import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { IWorkExperienceRepository } from '../ports/IWorkExperienceRepository';
import { AlumniNotFoundError, UnauthorizedExperienceError } from '../../domain/errors/AlumniErrors';

export class AddWorkExperience {
  constructor(
    private readonly alumniRepository: IAlumniProfileRepository,
    private readonly experienceRepository: IWorkExperienceRepository
  ) {}

  async execute(userId: string, data: any) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    const experience = await this.experienceRepository.create({
      alumniId: profile.id,
      ...data,
    });
    return experience;
  }
}

export class UpdateWorkExperience {
  constructor(
    private readonly alumniRepository: IAlumniProfileRepository,
    private readonly experienceRepository: IWorkExperienceRepository
  ) {}

  async execute(userId: string, expId: string, data: any) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    const experience = await this.experienceRepository.findById(expId);
    if (!experience || experience.alumniId !== profile.id) {
      throw new UnauthorizedExperienceError();
    }

    const updated = await this.experienceRepository.update(expId, data);
    return updated;
  }
}

export class DeleteWorkExperience {
  constructor(
    private readonly alumniRepository: IAlumniProfileRepository,
    private readonly experienceRepository: IWorkExperienceRepository
  ) {}

  async execute(userId: string, expId: string) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    const experience = await this.experienceRepository.findById(expId);
    if (!experience || experience.alumniId !== profile.id) {
      throw new UnauthorizedExperienceError();
    }

    await this.experienceRepository.delete(expId);
  }
}
