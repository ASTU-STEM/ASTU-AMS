import { IAlumniRepository } from '../../application/ports/IAlumniRepository';
import { Alumni } from '../../domain/entities/Alumni';

export class PrismaAlumniRepository implements IAlumniRepository {
  // Normally you would inject PrismaClient here
  constructor() {}

  async findById(id: string): Promise<Alumni | null> {
    // Mock implementation
    if (id === '1') {
      return new Alumni('1', 'John Doe', 'UGR/1234/12', 'Software Engineering', 2024);
    }
    return null;
  }

  async save(alumni: Alumni): Promise<void> {
    // Mock implementation
    console.log(`Saving alumni ${alumni.id} with new name ${alumni.name}`);
  }
}
