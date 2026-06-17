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
      return await this.repo.create({
        userId,
        ...data,
      });
    }
    const updated = await this.repo.update(userId, data);
    return updated;
  }
}

export class CreateEmployerProfile {
  constructor(private readonly repo: IEmployerProfileRepository) {}

  async execute(userId: string, data: any) {
    const existing = await this.repo.findByUserId(userId);
    if (existing) {
      throw new Error('Employer profile already exists');
    }
    return await this.repo.create({
      userId,
      ...data,
    });
  }
}

export class DeleteEmployerProfile {
  constructor(private readonly repo: IEmployerProfileRepository) {}

  async execute(userId: string) {
    const profile = await this.repo.findByUserId(userId);
    if (!profile) {
      throw new EmployerNotFoundError();
    }
    await this.repo.delete(userId);
  }
}
