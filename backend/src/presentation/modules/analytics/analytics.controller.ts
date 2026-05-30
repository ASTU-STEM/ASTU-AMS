import { Request, Response, NextFunction } from 'express';
import prisma from '../../../infrastructure/config/db';
import { sendSuccess } from '../../../shared/utils/response.utils';

export class AnalyticsController {
  /**
   * General KPI counters for all Dashboards.
   * Route: GET /api/analytics/kpis
   * Access: ADMIN, DEPARTMENT_HEAD, REGISTRAR
   */
  static async getKpis(req: Request, res: Response, next: NextFunction) {
    try {
      const totalAlumni = await prisma.alumniProfile.count();
      const totalEmployers = await prisma.employerProfile.count();
      const totalJobs = await prisma.job.count({ where: { isActive: true } });
      
      // Calculate overall employment rate
      const totalEmployed = await prisma.alumniProfile.count({
        where: {
          experiences: {
            some: {
              isCurrent: true,
            },
          },
        },
      });

      const employmentRate = totalAlumni > 0 ? Math.round((totalEmployed / totalAlumni) * 100) : 0;

      return sendSuccess(res, 'Fetched KPI dashboard data.', {
        totalAlumni,
        totalEmployers,
        totalJobs,
        employmentRate: `${employmentRate}%`,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Employment Rate breakdown by Academic Department.
   * Route: GET /api/analytics/employment-by-department
   * Access: ADMIN, DEPARTMENT_HEAD
   */
  static async getEmploymentByDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await prisma.department.findMany({
        include: {
          alumniProfiles: {
            include: {
              experiences: true,
            },
          },
        },
      });

      const report = departments.map((dept: any) => {
        const total = dept.alumniProfiles.length;
        const employed = dept.alumniProfiles.filter(
          (alum: any) => alum.experiences.some((exp: any) => exp.isCurrent)
        ).length;

        const rate = total > 0 ? parseFloat(((employed / total) * 100).toFixed(1)) : 0;

        return {
          departmentCode: dept.code,
          departmentName: dept.name,
          totalGraduates: total,
          employedGraduates: employed,
          employmentRate: rate,
        };
      });

      return sendSuccess(res, 'Fetched employment rate breakdown.', report);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Skill gaps analysis based on employer feedback ratings (1-10).
   * Route: GET /api/analytics/skill-gaps
   * Access: ADMIN, DEPARTMENT_HEAD
   */
  static async getSkillGaps(req: Request, res: Response, next: NextFunction) {
    try {
      // Aggregate average ratings of competencies
      const feedbackStats = await prisma.employerFeedback.aggregate({
        _avg: {
          technicalSkill: true,
          communicationSkill: true,
          leadershipSkill: true,
          teamworkSkill: true,
          problemSolvingSkill: true,
          innovationSkill: true,
        },
        _count: {
          id: true,
        },
      });

      const averages = feedbackStats._avg;
      const count = feedbackStats._count.id;

      // Define target score (e.g., 8.5/10 is desired baseline performance)
      const targetScore = 8.5;

      const skillGapData = [
        { skill: 'Technical Skill', average: averages.technicalSkill ? parseFloat(averages.technicalSkill.toFixed(1)) : 0 },
        { skill: 'Communication Skill', average: averages.communicationSkill ? parseFloat(averages.communicationSkill.toFixed(1)) : 0 },
        { skill: 'Leadership Skill', average: averages.leadershipSkill ? parseFloat(averages.leadershipSkill.toFixed(1)) : 0 },
        { skill: 'Teamwork Skill', average: averages.teamworkSkill ? parseFloat(averages.teamworkSkill.toFixed(1)) : 0 },
        { skill: 'Problem Solving', average: averages.problemSolvingSkill ? parseFloat(averages.problemSolvingSkill.toFixed(1)) : 0 },
        { skill: 'Innovation & Design', average: averages.innovationSkill ? parseFloat(averages.innovationSkill.toFixed(1)) : 0 },
      ].map((item) => ({
        ...item,
        target: targetScore,
        gap: parseFloat(Math.max(0, targetScore - item.average).toFixed(1)),
      }));

      return sendSuccess(res, 'Fetched industry feedback skill gaps.', {
        totalFeedbackReviews: count,
        skillGaps: skillGapData,
      });
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Top Hiring Companies list.
   * Route: GET /api/analytics/top-employers
   * Access: ADMIN, DEPARTMENT_HEAD, ALUMNI
   */
  static async getTopEmployers(req: Request, res: Response, next: NextFunction) {
    try {
      // Group work experiences by company name to count active grads
      const activeExperiences = await prisma.workExperience.findMany({
        where: { isCurrent: true },
        select: { companyName: true },
      });

      const counts: Record<string, number> = {};
      activeExperiences.forEach((exp: any) => {
        const name = exp.companyName.trim();
        counts[name] = (counts[name] || 0) + 1;
      });

      const sortedEmployers = Object.keys(counts)
        .map((name) => ({ companyName: name, alumniCount: counts[name] }))
        .sort((a, b) => b.alumniCount - a.alumniCount)
        .slice(0, 10); // Top 10 employers

      return sendSuccess(res, 'Fetched top hiring employers list.', sortedEmployers);
    } catch (err: any) {
      next(err);
    }
  }

  /**
   * Advanced decision intelligence metrics.
   * Route: GET /api/analytics/advanced-metrics
   * Access: ADMIN, DEPARTMENT_HEAD
   */
  static async getAdvancedMetrics(req: Request, res: Response, next: NextFunction) {
    try {
      const totalAlumni = await prisma.alumniProfile.count();

      // 1. Average Salary Calculation
      const experiencesWithSalary = await prisma.workExperience.findMany({
        where: { isCurrent: true, NOT: { salaryRange: null } },
        select: { salaryRange: true },
      });

      let salarySum = 0;
      let salaryCount = 0;

      for (const exp of experiencesWithSalary) {
        if (!exp.salaryRange) continue;
        let cleaned = exp.salaryRange.toLowerCase().replace(/k/g, '000').replace(/[^0-9\-]/g, '');
        if (cleaned.includes('-')) {
          const parts = cleaned.split('-');
          const val1 = parseInt(parts[0], 10);
          const val2 = parseInt(parts[1], 10);
          if (!isNaN(val1) && !isNaN(val2)) {
            salarySum += (val1 + val2) / 2;
            salaryCount++;
          }
        } else {
          const val = parseInt(cleaned, 10);
          if (!isNaN(val)) {
            salarySum += val;
            salaryCount++;
          }
        }
      }

      const averageSalary = salaryCount > 0 ? Math.round(salarySum / salaryCount) : 0;

      // 2. Average Time-to-Hire (in Months)
      const alumniWithFirstJobs = await prisma.alumniProfile.findMany({
        include: {
          experiences: {
            orderBy: { startDate: 'asc' },
            take: 1,
          },
        },
      });

      let hireTimeSum = 0;
      let hireTimeCount = 0;

      for (const alum of alumniWithFirstJobs) {
        if (alum.experiences.length > 0) {
          const gradDate = new Date(alum.graduationYear, 6, 1); // July 1st of grad year
          const hireDate = new Date(alum.experiences[0].startDate);
          
          let diffMonths = (hireDate.getFullYear() - gradDate.getFullYear()) * 12 + (hireDate.getMonth() - gradDate.getMonth());
          if (diffMonths < 0) diffMonths = 0;

          hireTimeSum += diffMonths;
          hireTimeCount++;
        }
      }

      const averageTimeToHire = hireTimeCount > 0 ? parseFloat((hireTimeSum / hireTimeCount).toFixed(1)) : 0;

      // 3. Tracer Completion Rate per Survey Template
      const surveys = await prisma.survey.findMany({
        include: {
          responses: { select: { id: true } },
        },
      });

      const tracerCompletion = surveys.map((s: any) => ({
        surveyId: s.id,
        title: s.title,
        type: s.type,
        responsesCount: s.responses.length,
        completionRate: totalAlumni > 0 ? parseFloat(((s.responses.length / totalAlumni) * 100).toFixed(1)) : 0,
      }));

      // 4. Industry Distribution
      const activeJobs = await prisma.workExperience.findMany({
        where: { isCurrent: true },
        select: { industry: true },
      });

      const industryCounts: Record<string, number> = {};
      activeJobs.forEach((job: any) => {
        const ind = job.industry.trim();
        industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      });

      const industryDistribution = Object.keys(industryCounts).map((ind) => ({
        industry: ind,
        count: industryCounts[ind],
      }));

      return sendSuccess(res, 'Fetched advanced decision intelligence metrics.', {
        averageSalary: averageSalary > 0 ? `${averageSalary.toLocaleString()} ETB` : 'N/A',
        averageTimeToHireMonths: averageTimeToHire,
        tracerCompletionRate: tracerCompletion,
        industryDistribution,
      });
    } catch (err: any) {
      next(err);
    }
  }
}
