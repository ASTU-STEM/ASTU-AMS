export class ToolsBackendService {
  static async getToolCategories() {
    return [
      { id: 'career', name: 'Career & Planning', count: 10 },
      { id: 'cv', name: 'CV & Resume', count: 10 },
      { id: 'jobs', name: 'Job Application', count: 10 },
      { id: 'interviews', name: 'Interview Prep', count: 10 },
      { id: 'ethiopia_jobs', name: 'Ethiopian Job Market', count: 10 },
      { id: 'job_safety', name: 'Job Scam Protection', count: 10 },
      { id: 'postgraduate', name: 'Postgraduate Education', count: 10 },
      { id: 'scholarships', name: 'Scholarships & Overseas', count: 10 },
      { id: 'finance', name: 'Financial Calculators', count: 10 },
      { id: 'ethiopia_finance', name: 'Ethiopian Personal Finance', count: 10 },
      { id: 'entrepreneurship', name: 'Entrepreneurship', count: 10 },
      { id: 'ethiopia_sme', name: 'Ethiopian Business & SME', count: 10 },
      { id: 'professional', name: 'Professional Tools', count: 15 },
      { id: 'productivity', name: 'Productivity Utilities', count: 10 },
      { id: 'academic', name: 'Academic & Document', count: 10 },
      { id: 'alumni', name: 'ASTU Alumni Portal', count: 10 },
    ];
  }

  static async getToolsSummary() {
    return {
      totalTools: 165,
      categoriesCount: 16,
      status: 'ACTIVE',
      lastUpdated: new Date().toISOString()
    };
  }
}
