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

    // Base filter: query published/active jobs
    const where: any = {};

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
            select: { applications: true, views: true },
          },
          applications: {
            select: { status: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const data = jobs.map((job: any) => {
      const viewsCount = job._count?.views || 0;
      const applicationsCount = job._count?.applications || 0;
      const shortlistedCount = Array.isArray(job.applications)
        ? job.applications.filter((a: any) => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length
        : 0;

      return new JobWithEmployer(
        job.id, job.title, job.description, job.location,
        job.employmentType, job.experienceRequired, job.skillsRequired,
        job.deadline, job.salary, job.salaryMin, job.salaryMax,
        job.isActive, job.status, job.department, job.experienceLevel,
        job.responsibilities, job.requirements, job.createdAt,
        job.employer.companyName, job.employer.industry, job.employer.location,
        job.employer.logoUrl, job.employer.website, job.employer.id,
        viewsCount, applicationsCount, shortlistedCount
      );
    });

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
        applications: {
          select: { status: true },
        },
      },
    });

    if (!job) return null;

    const shortlistedCount = Array.isArray(job.applications)
      ? job.applications.filter((a: any) => a.status === 'SHORTLISTED' || a.status === 'ACCEPTED').length
      : 0;

    return new JobDetailView(
      job.id, job.title, job.description, job.location,
      job.employmentType, job.experienceRequired, job.skillsRequired,
      job.deadline, job.salary, job.salaryMin, job.salaryMax,
      job.isActive, job.status, job.department, job.experienceLevel,
      job.responsibilities, job.requirements, job.createdAt,
      job.employer?.companyName || 'ASTU Corporate Partner', job.employer?.industry || 'Technology', job.employer?.location || 'Adama',
      job.employer?.logoUrl || null, job.employer?.website || null, job.employerId || '',
      job._count.applications, job._count.views, shortlistedCount,
      job.employer?.description || null, job.employer?.companySize || null
    );
  }

  async findJobById(jobId: string): Promise<any | null> {
    return prisma.job.findUnique({ where: { id: jobId } });
  }

  async countApplications(jobId: string): Promise<number> {
    return prisma.jobApplication.count({ where: { jobId } });
  }
}
