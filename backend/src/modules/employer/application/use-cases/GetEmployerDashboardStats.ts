import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { IDashboardAnalyticsRepository } from '../ports/IDashboardAnalyticsRepository';
import { EmployerNotFoundError } from '../../domain/errors/EmployerErrors';

export class GetEmployerDashboardStats {
  constructor(
    private readonly empRepo: IEmployerProfileRepository,
    private readonly analyticsRepo: IDashboardAnalyticsRepository
  ) {}

  async execute(userId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) {
      throw new EmployerNotFoundError();
    }
    return await this.analyticsRepo.getStatsByEmployerId(employer.id);
  }
}
