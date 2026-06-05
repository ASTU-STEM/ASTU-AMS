import { IAnalyticsRepository } from '../ports/IAnalyticsRepository';
import { AnalyticsCacheService } from '../../infrastructure/services/AnalyticsCacheService';

export class GetAnalyticsRecommendations {
  constructor(private readonly repo: IAnalyticsRepository) {}

  async execute() {
    const cacheKey = 'analytics:recommendations';
    const cached = await AnalyticsCacheService.get<any[]>(cacheKey);
    if (cached) return cached;

    const [curriculum, departments, employers] = await Promise.all([
      this.repo.getCurriculumAnalytics(),
      this.repo.getDepartmentMetrics(),
      this.repo.getEmployerAnalytics(),
    ]);

    const recommendations: { category: string; title: string; description: string; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[] = [];

    // Curriculum recommendations from missing skills
    curriculum.missingSkills.slice(0, 3).forEach(skill => {
      recommendations.push({
        category: 'CURRICULUM',
        title: `Integrate ${skill.skill} training`,
        description: `Add modules for ${skill.skill} to the primary curriculum, as requested by ${skill.demandCount} job postings.`,
        priority: 'HIGH',
      });
    });

    // Department recommendations
    departments.forEach(dept => {
      if (dept.employmentRate < 80) {
        recommendations.push({
          category: 'DEPARTMENT',
          title: `Enhance career counseling for ${dept.departmentName}`,
          description: `Employment rate is at ${dept.employmentRate.toFixed(1)}%. Coordinate career counseling and internship placement.`,
          priority: 'HIGH',
        });
      }
    });

    // Employer partnership recommendations
    employers.topHiringCompanies.slice(0, 2).forEach(comp => {
      recommendations.push({
        category: 'PARTNERSHIP',
        title: `Formalize partnership with ${comp.companyName}`,
        description: `Establish a structured campus hiring and internship agreement to secure direct hiring pipelines.`,
        priority: 'MEDIUM',
      });
    });

    // General employability recommendations
    if (curriculum.curriculumRelevanceScore < 90) {
      recommendations.push({
        category: 'EMPLOYABILITY',
        title: 'Increase practical lab hours',
        description: `Graduates rated hands-on practical relevance at ${curriculum.curriculumRelevanceScore.toFixed(1)}%. Introduce industry-linked projects in senior courses.`,
        priority: 'MEDIUM',
      });
    }

    await AnalyticsCacheService.set(cacheKey, recommendations, 600);
    return recommendations;
  }
}
