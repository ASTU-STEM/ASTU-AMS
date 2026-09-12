import { IAlumniDepartmentRepository, AlumniBasicInfo } from '../../application/ports/IAlumniDepartmentRepository';
import prisma from '../../../../core/config/db';

export class PrismaAlumniDepartmentRepository implements IAlumniDepartmentRepository {
  async findByDepartmentId(departmentId: string): Promise<AlumniBasicInfo[]> {
    const alumni = await prisma.alumniProfile.findMany({
      where: { departmentId },
      include: {
        user: true,
        experiences: {
          orderBy: [{ isCurrent: 'desc' }, { startDate: 'desc' }],
        },
      },
    });

    return alumni.map((a: any) => {
      const experiences: any[] = Array.isArray(a?.experiences) ? a.experiences : [];
      // Prefer the current role, otherwise the most recent one.
      const currentJob = experiences.find((xp) => xp.isCurrent) || experiences[0] || null;

      return {
        id: a.id,
        userId: a.userId || null,
        studentId: a.studentId,
        fullName: a.fullName || a.user?.email || 'Unknown',
        email: a.email || a.user?.email || null,
        phone: a.phone || null,
        graduationYear: a.graduationYear,
        employmentStatus: a.employmentStatus || 'UNEMPLOYED',
        salary: typeof a.salary === 'number' ? a.salary : null,
        skills: Array.isArray(a.skills) ? a.skills : [],
        company: currentJob?.companyName || null,
        jobTitle: currentJob?.position || null,
        industry: currentJob?.industry || null,
        location: currentJob?.location || null,
        isVerified: !!a.isVerified,
      };
    });
  }
}