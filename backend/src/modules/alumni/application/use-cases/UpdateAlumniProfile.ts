import { IAlumniRepository } from '../ports/IAlumniRepository';
import { Alumni } from '../../domain/entities/Alumni';

export class UpdateAlumniProfile {
  constructor(private alumniRepository: IAlumniRepository) {}

  async execute(id: string, newName: string): Promise<Alumni> {
    const alumni = await this.alumniRepository.findById(id);
    
    if (!alumni) {
      throw new Error('Alumni not found');
    }

    alumni.updateName(newName);
    await this.alumniRepository.save(alumni);

    return alumni;
  }
}
