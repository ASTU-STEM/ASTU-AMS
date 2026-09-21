import { PrismaAnalyticsRepository } from '../../../analytics/infrastructure/repositories/PrismaAnalyticsRepository';

const repo = new PrismaAnalyticsRepository();

export class AnalyticsContextProvider {
  static async getContextForIntent(intent: string): Promise<string> {
    switch (intent) {
      case 'employment': {
        const stats = await repo.getOverallEmploymentStats();
        return `OVERALL EMPLOYMENT STATISTICS:
- Total Alumni Count: ${stats.totalAlumni}
- Employed (Company): ${stats.employed}
- Self-Employed: ${stats.selfEmployed}
- Unemployed: ${stats.unemployed}
- Employment Rate: ${(stats.employmentRate || 0).toFixed(1)}%
- Unemployment Rate: ${(stats.unemploymentRate || 0).toFixed(1)}%
- Self-Employment Rate: ${(stats.selfEmploymentRate || 0).toFixed(1)}%
- Average Salary: ${(stats.averageSalary || 0).toFixed(2)} ETB
- Median Salary: ${(stats.medianSalary || 0).toFixed(2)} ETB
- Average Time To Hire: ${(stats.averageTimeToHireMonths || 0).toFixed(1)} months
- Employment Trends (Grouped by Graduation Year):
${(stats.employmentTrend || []).map(t => `  * Year ${t.year}: ${(t.rate || 0).toFixed(1)}% employment rate`).join('\n')}
- Outcome Trends:
${(stats.graduateOutcomeTrend || []).map(t => `  * Year ${t.year}: Employed: ${t.employed}, Unemployed: ${t.unemployed}, Self-Employed: ${t.selfEmployed}`).join('\n')}`;
      }

      case 'employer': {
        const stats = await repo.getEmployerAnalytics();
        return `EMPLOYER ENGAGEMENT STATISTICS:
- Average Employer Satisfaction Rating: ${(stats.averageEmployerSatisfaction || 0).toFixed(1)}/10
- Top hiring companies (by alumni experiences count):
${(stats.topHiringCompanies || []).map((c, i) => `  ${i + 1}. ${c.companyName} (${c.count} hires)`).join('\n')}
- Most active job poster companies:
${(stats.mostActiveEmployers || []).map((c, i) => `  ${i + 1}. ${c.companyName} (${c.jobPostCount} jobs posted)`).join('\n')}
- Company Hiring Rates (accepted job applications / total applications):
${(stats.companyHiringRate || []).map(c => `  * ${c.companyName}: ${(c.rate || 0).toFixed(1)}%`).join('\n')}
- Average Salaries paid per employer:
${(stats.employerSalaryRanking || []).map(c => `  * ${c.companyName}: ${(c.averageSalaryPaid || 0).toFixed(2)} ETB`).join('\n')}`;
      }

      case 'department': {
        const stats = await repo.getDepartmentAnalytics();
        return `DEPARTMENTAL PERFORMANCE METRICS:
- Department rankings (by employment rate):
${(stats.departmentRankings || []).map(r => `  * Rank ${r.rank}: ${r.code}`).join('\n')}
- Department average salaries:
${(stats.departmentSalaryRankings || []).map(s => `  * ${s.code}: ${(s.averageSalary || 0).toFixed(2)} ETB`).join('\n')}
- Department performance benchmarks (employability scores out of 100 based on CGPA and employment):
${(stats.performanceBenchmarks || []).map(b => `  * ${b.code}: score of ${(b.score || 0).toFixed(1)}/100`).join('\n')}
- Detailed metrics by department:
${(stats.departmentMetrics || []).map(m => `  * ${m.departmentName} (${m.departmentCode}):
    - Total Alumni: ${m.totalAlumni}
    - Employment Rate: ${(m.employmentRate || 0).toFixed(1)}%
    - Average Salary: ${(m.averageSalary || 0).toFixed(2)} ETB
    - Employability Score: ${(m.employabilityScore || 0).toFixed(1)}/100
    - Status Distribution: ${(m.statusDistribution || []).map(s => `${s.status}: ${s.count}`).join(', ')}`).join('\n')}`;
      }

      case 'skill_gap': {
        const stats = await repo.getCurriculumAnalytics();
        const skillGapStats = await repo.getSkillGapStats();
        return `CURRICULUM RELEVANCE & SKILL GAP ANALYSIS:
- Overall Curriculum Relevance Score (from Tracer response analysis): ${(stats.curriculumRelevanceScore || 0).toFixed(1)}%
- Skill gaps (measured as desired target 9.0 minus actual average employer feedback ratings):
  * Technical Skills: gap of ${(stats.skillGaps?.find(s => s.skill === 'Technical Skills')?.gapScore || 0).toFixed(1)} (Average Rating: ${(skillGapStats?.averageTechnical || 0).toFixed(1)})
  * Communication Skills: gap of ${(stats.skillGaps?.find(s => s.skill === 'Communication')?.gapScore || 0).toFixed(1)} (Average Rating: ${(skillGapStats?.averageCommunication || 0).toFixed(1)})
  * Leadership Skills: gap of ${(stats.skillGaps?.find(s => s.skill === 'Leadership')?.gapScore || 0).toFixed(1)} (Average Rating: ${(skillGapStats?.averageLeadership || 0).toFixed(1)})
  * Teamwork Skills: gap of ${(stats.skillGaps?.find(s => s.skill === 'Teamwork')?.gapScore || 0).toFixed(1)} (Average Rating: ${(skillGapStats?.averageTeamwork || 0).toFixed(1)})
  * Problem Solving: gap of ${(stats.skillGaps?.find(s => s.skill === 'Problem Solving')?.gapScore || 0).toFixed(1)} (Average Rating: ${(skillGapStats?.averageProblemSolving || 0).toFixed(1)})
  * Innovation Skills: gap of ${(stats.skillGaps?.find(s => s.skill === 'Innovation')?.gapScore || 0).toFixed(1)} (Average Rating: ${(skillGapStats?.averageInnovation || 0).toFixed(1)})
- Missing Skills (demanded in employer job postings but missing from alumni skill lists):
${(stats.missingSkills || []).map(s => `  * ${s.skill} (demanded in ${s.demandCount} job postings)`).join('\n')}
- Emerging Technologies:
${(stats.emergingTechnologies || []).map(t => `  * ${t.skill} (appeared in ${t.count} jobs)`).join('\n')}`;
      }

      case 'moe':
      case 'ministry': {
        const emp = await repo.getOverallEmploymentStats();
        const trac = await repo.getTracerAnalytics();
        return `MINISTRY OF EDUCATION (MoE / ETA) NATIONAL REPORT CONTEXT:
- Institutional Name: Adama Science & Technology University (ASTU)
- National Graduate Employment Outcome Rate: ${(emp.employmentRate || 0).toFixed(1)}%
- Total Tracked Graduates: ${emp.totalAlumni || 0}
- Employed in High-Demand Sectors: ${(emp.employed || 0) + (emp.selfEmployed || 0)}
- Average Time To Hire: ${(emp.averageTimeToHireMonths || 0).toFixed(1)} months
- Graduate Tracer Survey Coverage: ${(trac.surveyCompletionRate || 0).toFixed(1)}% (Meets ETA Level 1 Quality Standard)
- Key Employment Sectors: Telecommunications, FinTech, Civil Engineering Infrastructure, Manufacturing.`;
      }

      case 'document_sla': {
        return `REGISTRAR DOCUMENT SERVICES & SLA CONTEXT:
- Supported Official Documents: Official Academic Transcript, Degree Verification Certificate, Medium of Instruction Certificate, Recommendation Letter.
- Standard SLA Turnaround Time: 2 to 3 Business Days.
- Expedited Processing SLA: 24 Hours.
- Verification Direct Channel: Digital QR-code verification backed by Registrar student master records.`;
      }

      case 'job_board': {
        const empl = await repo.getEmployerAnalytics();
        return `JOB BOARD & TALENT MATCHING CONTEXT:
- Active Partner Employer Organizations: ${empl.mostActiveEmployers?.length || 50}+
- Top Partner Hiring Companies: ${(empl.topHiringCompanies || []).slice(0, 5).map(c => c.companyName).join(', ')}
- Candidate Matching Algorithm: Matches alumni skills, CGPA, graduation year, and department against job postings.
- Talent Pipeline Features: Employer direct messaging, saved job notifications, resume evaluation.`;
      }

      case 'report':
      default: {
        const emp = await repo.getOverallEmploymentStats();
        const dept = await repo.getDepartmentAnalytics();
        const curr = await repo.getCurriculumAnalytics();
        const empl = await repo.getEmployerAnalytics();
        const trac = await repo.getTracerAnalytics();

        return `CONSOLIDATED UNIVERSITY ANALYTICS PROFILE (RAG CONTEXT):
1. EMPLOYMENT OUTCOMES:
- Graduate Employment Rate: ${(emp.employmentRate || 0).toFixed(1)}% (Employed: ${emp.employed || 0}, Self-Employed: ${emp.selfEmployed || 0}, Unemployed: ${emp.unemployed || 0})
- Average Starting Salary: ${(emp.averageSalary || 0).toFixed(2)} ETB
- Median Starting Salary: ${(emp.medianSalary || 0).toFixed(2)} ETB

2. DEPARTMENT HIGHLIGHTS:
${(dept.departmentMetrics || []).map(m => `* ${m.departmentCode} - Employment: ${(m.employmentRate || 0).toFixed(1)}%, Average Salary: ${(m.averageSalary || 0).toFixed(2)} ETB`).join('\n')}

3. EMPLOYER METRICS:
- Employer Satisfaction: ${(empl.averageEmployerSatisfaction || 0).toFixed(1)}/10
- Largest Employer: ${empl.topHiringCompanies?.[0]?.companyName || 'N/A'}

4. SKILLS & CURRICULUM:
- Curriculum Relevance Rating: ${(curr.curriculumRelevanceScore || 0).toFixed(1)}%
- Top Requested Missing Skill: ${curr.missingSkills?.[0]?.skill || 'N/A'}

5. TRACER RESPONSE STATS:
- Tracer Survey Completion Rate: ${(trac.surveyCompletionRate || 0).toFixed(1)}%
- Response Rate: ${(trac.responseRate || 0).toFixed(1)}%`;
      }
    }
  }
}
