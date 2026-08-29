import { AlumniProfile } from '../types/alumni.types';

export interface CompletionItem {
  id: string;
  title: string;
  weight: number;
  sectionId: string;
  actionText: string;
}

export interface CompletionBreakdown {
  score: number;
  completed: CompletionItem[];
  missing: CompletionItem[];
}

export const getProfileCompletionBreakdown = (profile: Partial<AlumniProfile> | null | undefined): CompletionBreakdown => {
  if (!profile || Object.keys(profile).length === 0) {
    return { score: 0, completed: [], missing: [] };
  }

  const completed: CompletionItem[] = [];
  const missing: CompletionItem[] = [];

  // Helper check
  const checkField = (
    id: string,
    title: string,
    isComplete: boolean,
    weight: number,
    sectionId: string,
    actionText: string
  ) => {
    const item = { id, title, weight, sectionId, actionText };
    if (isComplete) {
      completed.push(item);
    } else {
      missing.push(item);
    }
  };

  // 1. Personal Info (20%)
  checkField('fullName', 'Full Name', Boolean(profile.fullName), 5, 'personal', 'Add your full name');
  checkField('phone', 'Phone Number', Boolean(profile.phone), 5, 'personal', 'Add your contact phone number');
  checkField('bio', 'Professional Bio', Boolean(profile.bio && profile.bio.trim().length > 10), 5, 'personal', 'Write a brief professional bio');
  checkField('address', 'Address or Nationality', Boolean(profile.address || profile.nationality || profile.gender), 5, 'personal', 'Add your location or address');

  // 2. Academic Record (15%)
  checkField('department', 'Academic Department', Boolean(profile.department || (profile as any).departmentId), 5, 'academic', 'Select your academic department');
  checkField('batch', 'Graduation Year / Batch', Boolean(profile.batch || (profile as any).graduationYear), 5, 'academic', 'Enter your graduation year');
  checkField('cgpa', 'CGPA Record', Boolean(profile.cgpa !== undefined && profile.cgpa !== null && (profile.cgpa as any) !== 0 && (profile.cgpa as any) !== '0'), 5, 'academic', 'Enter your CGPA');

  // 3. Employment Details (15%)
  checkField('employmentStatus', 'Employment Status', Boolean((profile as any).employmentStatus), 5, 'employment', 'Set your current employment status');
  checkField('currentRole', 'Current Job Title / Role', Boolean(profile.currentRole || (profile as any).role), 5, 'employment', 'Add your job title or role');
  checkField('company', 'Company / Employer Name', Boolean(profile.company), 5, 'employment', 'Add your company name');

  // 4. Resume / CV (10%)
  checkField('resume', 'Resume / CV Document Upload', Boolean(profile.resume || profile.resumeUrl), 10, 'resume', 'Upload your professional CV / Resume');

  // 5. Skills (10%)
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length >= 3;
  checkField('skills', 'Technical & Soft Skills (3+ skills)', hasSkills, 10, 'skills', 'Add at least 3 skills tags');

  // 6. Social Links (10%)
  const linkedIn = profile.linkedInUrl || profile.linkedIn;
  const gitHub = profile.gitHubUrl || profile.gitHub;
  const portfolio = profile.portfolioUrl || profile.portfolio;
  checkField('linkedIn', 'LinkedIn Profile URL', Boolean(linkedIn), 3.4, 'social', 'Connect your LinkedIn URL');
  checkField('gitHub', 'GitHub Profile URL', Boolean(gitHub), 3.3, 'social', 'Connect your GitHub URL');
  checkField('portfolio', 'Portfolio / Website URL', Boolean(portfolio), 3.3, 'social', 'Add your portfolio website link');

  // 7. Certifications (10%)
  const hasCerts = Array.isArray(profile.certifications) && profile.certifications.length > 0;
  checkField('certifications', 'Professional Certifications', hasCerts, 10, 'certifications', 'Add at least one professional certification');

  // 8. Projects & Portfolio (5%)
  const hasProjects = Array.isArray(profile.projects) && profile.projects.length > 0;
  checkField('projects', 'Projects & Portfolio Items', hasProjects, 5, 'projects', 'Add a portfolio project');

  // 9. Achievements & Recognition (5%)
  const hasAchievements = Array.isArray(profile.achievements) && profile.achievements.length > 0;
  checkField('achievements', 'Achievements & Honors', hasAchievements, 5, 'achievements', 'Add awards or achievements');

  const totalScore = completed.reduce((sum, item) => sum + item.weight, 0);
  const score = Math.min(100, Math.round(totalScore));

  return {
    score,
    completed,
    missing,
  };
};

export const calculateProfileCompletion = (profile: Partial<AlumniProfile> | null | undefined): number => {
  return getProfileCompletionBreakdown(profile).score;
};
