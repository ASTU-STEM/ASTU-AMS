import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { EmployerNotFoundError } from '../../domain/errors/EmployerErrors';

export class GetEmployerProfile {
  constructor(private readonly repo: IEmployerProfileRepository) {}

  async execute(userId: string) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new EmployerNotFoundError();
    }
    return profile;
  }
}

export class UpdateEmployerProfile {
  constructor(private readonly repo: IEmployerProfileRepository) {}

  async execute(userId: string, data: any) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new EmployerNotFoundError();
    }
    const updated = await this.repo.update(userId, data);
    return updated;
  }
}
