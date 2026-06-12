import { CompanyProfile, EmployerJob, CandidateApplication, GraduateFeedback } from '../types/employer.types';

const emptyProfile: CompanyProfile = {
  name: '', registrationNumber: '', industry: '', website: '', location: '',
  hrName: '', hrEmail: '', hrPhone: '', logoUrl: '', description: '',
};

export const getCompanyProfile = (): CompanyProfile => ({ ...emptyProfile });
export const saveCompanyProfile = (_profile: CompanyProfile): void => {};

export const getEmployerJobs = (): EmployerJob[] => [];
export const saveEmployerJobs = (_jobs: EmployerJob[]): void => {};

export const getCandidateApplications = (): CandidateApplication[] => [];
export const saveCandidateApplications = (_apps: CandidateApplication[]): void => {};

export const getGraduateFeedback = (): GraduateFeedback[] => [];
export const saveGraduateFeedback = (_fb: GraduateFeedback[]): void => {};
