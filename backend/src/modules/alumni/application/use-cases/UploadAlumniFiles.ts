import { IAlumniProfileRepository } from '../ports/IAlumniProfileRepository';
import { AlumniNotFoundError, FileUploadError } from '../../domain/errors/AlumniErrors';

export class UploadAlumniFiles {
  constructor(private readonly alumniRepository: IAlumniProfileRepository) {}

  async execute(userId: string, files: { resumeUrl?: string; profilePicture?: string }) {
    const profile = await this.alumniRepository.findByUserId(userId);
    if (!profile) {
      throw new AlumniNotFoundError();
    }

    if (!files.resumeUrl && !files.profilePicture) {
      throw new FileUploadError();
    }

    const updated = await this.alumniRepository.update(userId, files);
    return updated;
  }
}
