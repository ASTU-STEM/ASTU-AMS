import { AlumniProfileSummary, ScoredRecommendation } from '../../domain/entities/JobBoard';

/**
 * AI-ready Recommendation Engine Interface.
 * 
 * This interface is designed so a future AI agent can replace the
 * rule-based implementation with ML-based scoring. The contract
 * remains the same — input an alumni profile, get scored recommendations.
 */
export interface IRecommendationEngine {
  generateForAlumni(
    alumniProfile: AlumniProfileSummary,
    activeJobs: any[]
  ): Promise<ScoredRecommendation[]>;
}

/**
 * Rule-based recommendation engine (v1).
 * 
 * Scoring breakdown:
 * - Department Match: +30 points
 * - Skills Overlap:   +25 points (proportional to overlap ratio)
 * - Experience Fit:   +15 points
 * - CGPA Threshold:   +10 points (above 3.0)
 * - Recency Bonus:    +10 points (jobs posted within last 7 days)
 * - Location Match:   +10 points
 * 
 * Total possible: 100 points
 */
export class RuleBasedRecommendationEngine implements IRecommendationEngine {
  async generateForAlumni(
    alumni: AlumniProfileSummary,
    activeJobs: any[]
  ): Promise<ScoredRecommendation[]> {
    const scored: ScoredRecommendation[] = [];

    for (const job of activeJobs) {
      let score = 0;
      const reasons: string[] = [];

      // 1. Department Match (+30)
      if (job.department && alumni.departmentCode) {
        if (job.department.toLowerCase() === alumni.departmentCode.toLowerCase()) {
          score += 30;
          reasons.push('department_match');
        }
      }

      // 2. Skills Overlap (+25, proportional)
      if (job.skillsRequired && job.skillsRequired.length > 0 && alumni.skills.length > 0) {
        const jobSkillsLower = job.skillsRequired.map((s: string) => s.toLowerCase());
        const alumniSkillsLower = alumni.skills.map(s => s.toLowerCase());
        const overlap = jobSkillsLower.filter((s: string) => alumniSkillsLower.includes(s));
        const overlapRatio = overlap.length / jobSkillsLower.length;
        const skillScore = Math.round(overlapRatio * 25);
        if (skillScore > 0) {
          score += skillScore;
          reasons.push('skills_overlap');
        }
      }

      // 3. Experience Fit (+15)
      // If alumni graduated 2+ years ago, they likely have some experience
      const yearsOfExperience = new Date().getFullYear() - alumni.graduationYear;
      if (job.experienceRequired <= Math.max(0, yearsOfExperience)) {
        score += 15;
        reasons.push('experience_fit');
      }

      // 4. CGPA Threshold (+10)
      if (alumni.cgpa >= 3.0) {
        score += 10;
        reasons.push('strong_academic_record');
      }

      // 5. Recency Bonus (+10) — jobs posted within last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      if (new Date(job.createdAt) >= sevenDaysAgo) {
        score += 10;
        reasons.push('recently_posted');
      }

      // 6. Location Match (+10)
      // Simple string containment check
      if (job.location && alumni.departmentCode) {
        // Future: use actual location from alumni profile
        score += 0; // Placeholder — no alumni location in current schema
      }

      // Only include if score is meaningful (> 20)
      if (score > 20) {
        scored.push({
          jobId: job.id,
          score,
          reasons,
        });
      }
    }

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }
}
