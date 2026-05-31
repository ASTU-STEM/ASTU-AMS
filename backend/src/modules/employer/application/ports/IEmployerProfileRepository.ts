import { EmployerProfile } from '../../domain/entities/Employer';

export interface IEmployerProfileRepository {
  findByUserId(userId: string): Promise<EmployerProfile | null>;
  update(userId: string, data: Partial<EmployerProfile>): Promise<EmployerProfile>;
}
