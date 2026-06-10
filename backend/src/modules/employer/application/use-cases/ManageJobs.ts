import { IJobRepository } from '../ports/IJobRepository';
import { IEmployerProfileRepository } from '../ports/IEmployerProfileRepository';
import { EmployerNotFoundError, JobNotFoundError, UnauthorizedEmployerActionError } from '../../domain/errors/EmployerErrors';
import { NotificationDispatcher } from '../../../notifications/application/services/NotificationDispatcher';

const dispatcher = new NotificationDispatcher();

export class CreateJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) {
      throw new EmployerNotFoundError();
    }
    const job = await this.jobRepo.create({
      employerId: employer.id,
      ...data,
      isActive: true,
      deadline: data.deadline ? new Date(data.deadline) : new Date(),
    });

    if (job.status === 'PUBLISHED') {
      await dispatcher.broadcastJobAlert(job.title, employer.companyName, job.id);
    }

    return job;
  }
}

export class UpdateJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string, data: any) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only update your own jobs.');
    }

    const updated = await this.jobRepo.update(jobId, data);
    return updated;
  }
}

export class DeleteJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only delete your own jobs.');
    }

    await this.jobRepo.delete(jobId);
  }
}

export class PublishJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only publish your own jobs.');
    }

    const updated = await this.jobRepo.update(jobId, { status: 'PUBLISHED' });
    
    await dispatcher.broadcastJobAlert(updated.title, employer.companyName, updated.id);
    
    return updated;
  }
}

export class CloseJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only close your own jobs.');
    }

    return await this.jobRepo.update(jobId, { status: 'CLOSED' });
  }
}

export class ReopenJob {
  constructor(
    private readonly jobRepo: IJobRepository,
    private readonly empRepo: IEmployerProfileRepository
  ) {}

  async execute(userId: string, jobId: string, deadline: Date) {
    const employer = await this.empRepo.findByUserId(userId);
    if (!employer) throw new EmployerNotFoundError();

    const job = await this.jobRepo.findById(jobId);
    if (!job) throw new JobNotFoundError();

    if (job.employerId !== employer.id) {
      throw new UnauthorizedEmployerActionError('You can only reopen your own jobs.');
    }

    return await this.jobRepo.update(jobId, { status: 'PUBLISHED', deadline });
  }
}
