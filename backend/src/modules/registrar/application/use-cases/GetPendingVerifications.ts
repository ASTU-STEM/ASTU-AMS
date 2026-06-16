import { IRegistrarAlumniRepository } from '../ports/IRegistrarAlumniRepository';

export class GetPendingVerifications {
  constructor(private readonly alumniRepo: IRegistrarAlumniRepository) {}

  async execute() {
    return this.alumniRepo.findAll('INACTIVE');
  }
}
