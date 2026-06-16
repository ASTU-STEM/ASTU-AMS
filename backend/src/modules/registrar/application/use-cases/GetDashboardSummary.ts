import { IDashboardRepository } from '../ports/IDashboardRepository';

export class GetDashboardSummary {
  constructor(private readonly dashboardRepo: IDashboardRepository) {}

  async execute() {
    return this.dashboardRepo.getSummary();
  }
}
