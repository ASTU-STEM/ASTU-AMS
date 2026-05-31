import { IGraduateRecordRepository } from '../ports/IGraduateRecordRepository';
import { GraduateNotFoundError } from '../../domain/errors/RegistrarErrors';

export class GetGraduateRecord {
  constructor(private readonly gradRepo: IGraduateRecordRepository) {}

  async execute(studentId: string) {
    const record = await this.gradRepo.findByStudentId(studentId);
    if (!record) {
      throw new GraduateNotFoundError();
    }
    return record;
  }
}

export class VerifyStudentId {
  constructor(private readonly gradRepo: IGraduateRecordRepository) {}

  async execute(studentId: string) {
    const record = await this.gradRepo.findByStudentId(studentId);
    if (!record) {
      return { valid: false, student: null };
    }
    return {
      valid: true,
      student: {
        studentId: record.studentId,
        fullName: record.fullName,
        department: record.department,
        graduationYear: record.graduationYear,
      },
    };
  }
}
