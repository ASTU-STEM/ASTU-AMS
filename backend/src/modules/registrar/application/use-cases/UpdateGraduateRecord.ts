import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { GraduateRecord } from '../../domain/entities/Registrar';

export class UpdateGraduateRecord {
  constructor(private readonly gradRepo: IGraduateRecordRepository) {}

  async execute(id: string, data: Partial<GraduateRecord>) {
    return this.gradRepo.update(id, data);
  }
}
