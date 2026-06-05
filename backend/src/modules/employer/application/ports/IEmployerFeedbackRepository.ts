import { EmployerFeedback } from '../../domain/entities/Employer';

export interface IEmployerFeedbackRepository {
  create(data: Omit<EmployerFeedback, 'id' | 'createdAt'>): Promise<EmployerFeedback>;
  findByEmployerId(employerId: string): Promise<EmployerFeedback[]>;
  findAll(): Promise<EmployerFeedback[]>;
}
