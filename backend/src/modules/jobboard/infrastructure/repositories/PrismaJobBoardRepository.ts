import { IJobBoardRepository } from '../../application/ports/IJobBoardRepository';
import { JobSearchParams, PaginatedResult, JobWithEmployer, JobDetailView } from '../../domain/entities/JobBoard';
import prisma from '../../../../core/config/db';

export class PrismaJobBoardRepository implements IJobBoardRepository {

  async findPublicJobs(params: JobSearchParams): Promise<PaginatedResult<JobWithEmployer>> {
    const {
      keyword, department, location, employmentType, experienceLevel,
      industry, company, salaryMin, salaryMax, experienceMin, experienceMax,
      page, limit, sort
    } = params;

    // Base filter: only PUBLISHED, ACTIVE, NOT EXPIRED jobs
    const where: any = {
      status: 'PUBLISHED',
      isActive: true,
      deadline: { gte: new Date() },
    };

    // Keyword search on title and description
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    // Filters
    if (department) where.department = { equals: department, mode: 'insensitive' };
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (employmentType) where.employmentType = employmentType;
    if (experienceLevel) where.experienceLevel = { equals: experienceLevel, mode: 'insensitive' };

    // Salary range filter (numeric fields)
    if (salaryMin !== undefined || salaryMax !== undefined) {
      where.AND = where.AND || [];
      if (salaryMin !== undefined) {
        where.AND.push({ salaryMax: { gte: salaryMin } });
      }
      if (salaryMax !== undefined) {
        where.AND.push({ salaryMin: { lte: salaryMax } });
      }
    }

    // Experience range filter
    if (experienceMin !== undefined) {
      where.experienceRequired = { ...where.experienceRequired, gte: experienceMin };
    }
    if (experienceMax !== undefined) {
      where.experienceRequired = { ...where.experienceRequired, lte: experienceMax };
    }

    // Industry / Company filter (via employer relation)
    if (industry || company) {
      where.employer = {};
      if (industry) where.employer.industry = { contains: industry, mode: 'insensitive' };
      if (company) where.employer.companyName = { contains: company, mode: 'insensitive' };
    }

    // Sorting
    let orderBy: any;
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'deadline':
        orderBy = { deadline: 'asc' };
        break;
      case 'salary_high':
        orderBy = { salaryMax: 'desc' };
        break;
      case 'salary_low':
        orderBy = { salaryMin: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { createdAt: 'desc' };
        break;
    }

    // Execute count + data in parallel
    const skip = (page - 1) * limit;
    const [total, jobs] = await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          employer: {
            select: {
              id: true,
              companyName: true,
              industry: true,
              location: true,
              logoUrl: true,
              website: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = jobs.map((job: any) => new JobWithEmployer(
      job.id, job.title, job.description, job.location,
      job.employmentType, job.experienceRequired, job.skillsRequired,
      job.deadline, job.salary, job.salaryMin, job.salaryMax,
      job.isActive, job.status, job.department, job.experienceLevel,
      job.responsibilities, job.requirements, job.createdAt,
      job.employer.companyName, job.employer.industry, job.employer.location,
      job.employer.logoUrl, job.employer.website, job.employer.id
    ));

    return { data, total, page, limit, totalPages };
  }

  async findJobDetail(jobId: string): Promise<JobDetailView | null> {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        employer: {
          select: {
            id: true,
            companyName: true,
            industry: true,
            location: true,
            logoUrl: true,
            website: true,
            description: true,
            companySize: true,
          },
        },
        _count: {
          select: {
            applications: true,
            views: true,
          },
        },
      },
    });

    if (!job) return null;
    if (job.status !== 'PUBLISHED' || !job.isActive) return null;

    return new JobDetailView(
      job.id, job.title, job.description, job.location,
      job.employmentType, job.experienceRequired, job.skillsRequired,
      job.deadline, job.salary, job.salaryMin, job.salaryMax,
      job.isActive, job.status, job.department, job.experienceLevel,
      job.responsibilities, job.requirements, job.createdAt,
      job.employer.companyName, job.employer.industry, job.employer.location,
      job.employer.logoUrl, job.employer.website, job.employer.id,
      job._count.applications, job._count.views,
      job.employer.description, job.employer.companySize
    );
  }

  async findJobById(jobId: string): Promise<any | null> {
    return prisma.job.findUnique({ where: { id: jobId } });
  }

  async countApplications(jobId: string): Promise<number> {
    return prisma.jobApplication.count({ where: { jobId } });
  }
}
