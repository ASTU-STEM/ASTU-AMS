import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetAnalyticsInsights {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute() {
    const cacheKey = 'analytics:insights';
    const cached = await AnalyticsCacheService.get<string[]>(cacheKey);
    if (cached) return cached;

    const [employment, curriculum, departments, employers] = await Promise.all([
      this.repo.getOverallEmploymentStats(),
      this.repo.getCurriculumAnalytics(),
      this.repo.getDepartmentMetrics(),
      this.repo.getEmployerAnalytics(),
    ]);

    const insights: string[] = [];

    // Employment Insights
    insights.push(`Overall graduate employment rate is currently ${employment.employmentRate.toFixed(1)}%.`);
    if (employment.selfEmploymentRate > 0) {
      insights.push(`Self-employment stands at ${employment.selfEmploymentRate.toFixed(1)}% of all graduates.`);
    }
    if (employment.salaryGrowth > 0) {
      insights.push(`Graduate average salary growth rate is ${employment.salaryGrowth.toFixed(1)}% over graduation cohorts.`);
    }

    // Department Insights
    if (departments.length > 0) {
      const sortedDepts = [...departments].sort((a, b) => b.employmentRate - a.employmentRate);
      insights.push(`${sortedDepts[0].departmentName} (${sortedDepts[0].departmentCode}) achieved the highest graduate employment rate at ${sortedDepts[0].employmentRate.toFixed(1)}%.`);
      if (sortedDepts.length > 1) {
        const lowestDept = sortedDepts[sortedDepts.length - 1];
        insights.push(`${lowestDept.departmentName} (${lowestDept.departmentCode}) has the lowest employment rate at ${lowestDept.employmentRate.toFixed(1)}%.`);
      }
    }

    // Skill Gap Insights
    if (curriculum.missingSkills.length > 0) {
      insights.push(`${curriculum.missingSkills[0].skill} is the most requested missing skill by employers.`);
    }
    insights.push(`Curriculum relevance is rated at ${curriculum.curriculumRelevanceScore.toFixed(1)}% based on graduate tracer feedback.`);

    // Employer Insights
    if (employers.topHiringCompanies.length > 0) {
      insights.push(`${employers.topHiringCompanies[0].companyName} is currently the largest employer of ASTU graduates.`);
    }
    if (employers.averageEmployerSatisfaction > 0) {
      insights.push(`Overall employer satisfaction score is ${employers.averageEmployerSatisfaction.toFixed(1)}/10.`);
    }

    await AnalyticsCacheService.set(cacheKey, insights, 600);
    return insights;
  }
}
