import { Survey } from '../../domain/entities/Survey';

export interface SurveyListOptions {
  activeOnly?: boolean;
  includeArchived?: boolean;
  /** When set, return institutional milestones + templates owned by this department */
  departmentId?: string;
}

export interface ISurveyRepository {
  findById(id: string): Promise<Survey | null>;
  findAll(activeOnly?: boolean, includeArchived?: boolean, departmentId?: string): Promise<Survey[]>;
  create(data: Omit<Survey, 'id'>): Promise<Survey>;
  update(id: string, data: Partial<Omit<Survey, 'id'>>): Promise<Survey>;
  archive(id: string): Promise<Survey>;
  clone(id: string, ownership?: { departmentId?: string | null; createdByUserId?: string | null }): Promise<Survey>;
  findByMilestone(months: number): Promise<Survey | null>;
}
