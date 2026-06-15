import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';

export class GetAllGraduateRecords {
  constructor(private readonly gradRepo: IGraduateRecordRepository) {}

  async execute() {
    return this.gradRepo.findAll();
  }
}
