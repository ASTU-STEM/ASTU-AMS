import { IAnalyticsRepository } from '../../application/ports/IAnalyticsRepository';
import { EmploymentStats, SkillGapStats, DepartmentMetric } from '../../domain/entities/Analytics';
import prisma from '../../../../core/config/db';

export class PrismaAnalyticsRepository implements IAnalyticsRepository {
  async getOverallEmploymentStats(): Promise<EmploymentStats> {
    const totalAlumni = await prisma.alumniProfile.count();
    const employed = await prisma.alumniProfile.count({
      where: { employmentStatus: 'EMPLOYED' },
    });
    const unemployed = totalAlumni - employed;
    const employmentRate = totalAlumni > 0 ? (employed / totalAlumni) * 100 : 0;

    return new EmploymentStats(totalAlumni, employed, unemployed, employmentRate);
  }

  async getSkillGapStats(): Promise<SkillGapStats> {
    const aggregations = await prisma.employerFeedback.aggregate({
      _avg: {
        technicalSkill: true,
        communicationSkill: true,
        leadershipSkill: true,
        teamworkSkill: true,
        problemSolvingSkill: true,
        innovationSkill: true,
      },
      _count: { id: true },
    });

    return new SkillGapStats(
      aggregations._avg.technicalSkill || 0,
      aggregations._avg.communicationSkill || 0,
      aggregations._avg.leadershipSkill || 0,
      aggregations._avg.teamworkSkill || 0,
      aggregations._avg.problemSolvingSkill || 0,
      aggregations._avg.innovationSkill || 0,
      aggregations._count.id
    );
  }

  async getDepartmentMetrics(): Promise<DepartmentMetric[]> {
    const departments = await prisma.department.findMany({
      include: {
        alumniProfiles: true,
      },
    });

    return departments.map((dept: any) => {
      const totalAlumni = dept.alumniProfiles.length;
      const employed = dept.alumniProfiles.filter((a: any) => a.employmentStatus === 'EMPLOYED').length;
      const employmentRate = totalAlumni > 0 ? (employed / totalAlumni) * 100 : 0;

      return new DepartmentMetric(dept.name, dept.code, totalAlumni, employmentRate);
    });
  }
}
