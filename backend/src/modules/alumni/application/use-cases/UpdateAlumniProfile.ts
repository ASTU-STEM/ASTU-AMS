import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { AlumniNotFoundError } from '../../domain/errors/AlumniErrors';

export class UpdateAlumniProfile {
  constructor(private readonly alumniRepository: IAlumniProfileRepository) {}

  async execute(userId: string, data: any) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    const updatedProfile = await this.alumniRepository.update(userId, data);
    return updatedProfile;
  }
}
