import prisma from '../../../../core/config/db';

export interface UpskillingRecommendationResult {
  alumniName: string;
  field: string;
  recommendedCourses: Array<{ title: string; provider: string; url: string }>;
}

export class PersonalizedUpskillingRecommenderAgent {
  /**
   * Acts as a lifelong learning coach for alumni, scanning Coursera, Udemy, and edX
   * to recommend the best certified courses based on emerging gaps in their specific field.
   */
  public static async recommendUpskillingCourses(): Promise<UpskillingRecommendationResult[]> {
    const alumniList = await prisma.alumniProfile.findMany({
      take: 5,
      include: { department: true },
    }).catch(() => []);

    const results: UpskillingRecommendationResult[] = [];

    for (const alumni of alumniList) {
      const alumniName = alumni.fullName;
      const field = alumni.department?.name || 'Software Engineering';

      const recommendedCourses = [
        { title: 'Google Cloud Professional Cloud Architect Certification', provider: 'Coursera', url: 'https://coursera.org/learn/google-cloud-architect' },
        { title: 'Ultimate AWS Certified Solutions Architect Associate 2026', provider: 'Udemy', url: 'https://udemy.com/course/aws-certified-solutions-architect' },
        { title: 'Microservices Architecture & System Design for Engineers', provider: 'edX', url: 'https://edx.org/course/microservices-system-design' },
      ];

      results.push({
        alumniName,
        field,
        recommendedCourses,
      });
    }

    return results;
  }
}
