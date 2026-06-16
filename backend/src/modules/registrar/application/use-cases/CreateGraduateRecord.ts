import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { GraduateRecord } from '../../domain/entities/Registrar';

export class CreateGraduateRecord {
  constructor(private readonly gradRepo: IGraduateRecordRepository) {}

  async execute(input: Omit<GraduateRecord, 'id'>) {
    return this.gradRepo.create(input);
  }
}
