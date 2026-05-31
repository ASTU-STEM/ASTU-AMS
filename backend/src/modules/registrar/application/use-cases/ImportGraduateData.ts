import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { ISyncLogRepository } from '../ports/ISyncLogRepository';
import { InvalidFileFormatError } from '../../domain/errors/RegistrarErrors';

export class ImportGraduateData {
  constructor(
    private readonly gradRepo: IGraduateRecordRepository,
    private readonly syncRepo: ISyncLogRepository
  ) {}

  async execute(records: any[]) {
    if (!records || records.length === 0) {
      throw new InvalidFileFormatError('No records to import.');
    }

    const result = await this.gradRepo.upsertMany(records);

    await this.syncRepo.create({
      status: 'SUCCESS',
      recordsCount: records.length,
      errors: null,
    });

    return result;
  }
}
