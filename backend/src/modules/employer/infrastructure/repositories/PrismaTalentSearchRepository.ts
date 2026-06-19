import { ITalentSearchRepository, SearchCriteria, SearchResult } from '../../application/ports/ITalentSearchRepository';
import prisma from '../../../../core/config/db';

export class PrismaTalentSearchRepository implements ITalentSearchRepository {
  async search(criteria: SearchCriteria): Promise<SearchResult> {
    const { search, department, departmentId, graduationYear, minCgpa, skills, employmentStatus, location, sortBy, page = 1, limit = 10 } = criteria as any;
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { skills: { hasSome: [search] } },
        { experiences: { some: { title: { contains: search, mode: 'insensitive' } } } }
      ];
    }

    if (departmentId) {
      whereClause.departmentId = departmentId;
    } else if (department) {
      whereClause.department = { name: { contains: department, mode: 'insensitive' } };
    }
    if (graduationYear) {
      whereClause.graduationYear = Number(graduationYear);
    }
    if (minCgpa) {
      whereClause.cgpa = { gte: Number(minCgpa) };
    }
    if (employmentStatus) {
      whereClause.employmentStatus = employmentStatus;
    }
    if (location) {
      whereClause.experiences = { some: { location: { contains: location, mode: 'insensitive' } } };
    }
    if (skills && skills.length > 0) {
      whereClause.skills = { hasSome: skills };
    }

    // Sort options
    let orderByClause: any = { createdAt: 'desc' };
    if (sortBy === 'cgpa') {
      orderByClause = { cgpa: 'desc' };
    } else if (sortBy === 'newest') {
      orderByClause = { graduationYear: 'desc' };
    } else if (sortBy === 'experience') {
      orderByClause = { experiences: { _count: 'desc' } };
    }

    const [data, total] = await Promise.all([
      prisma.alumniProfile.findMany({
        where: whereClause,
        include: { department: true, experiences: true },
        orderBy: orderByClause,
        skip,
        take: Number(limit),
      }),
      prisma.alumniProfile.count({
        where: whereClause,
      }),
    ]);

    // Mask CGPA if privacy setting is false
    const maskedData = data.map((profile) => {
      if (!profile.isCgpaPublic) {
        return { ...profile, cgpa: null };
      }
      return profile;
    });

    return {
      data: maskedData,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async findById(alumniId: string): Promise<any | null> {
    const profile = await prisma.alumniProfile.findUnique({
      where: { id: alumniId },
      include: { department: true, experiences: true, surveyResponses: true },
    });
    if (profile && !profile.isCgpaPublic) {
      return { ...profile, cgpa: null };
    }
    return profile;
  }
}
