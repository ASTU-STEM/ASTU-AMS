import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { AlumniNotFoundError } from '../../domain/errors/AlumniErrors';

export class GetAlumniProfile {
  constructor(private readonly alumniRepository: IAlumniProfileRepository) {}

  async execute(userId: string) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }
    return profile;
  }
}
