import { GraduateRecord } from '../../domain/entities/Registrar';

export interface IGraduateRecordRepository {
  findByStudentId(studentId: string): Promise<GraduateRecord | null>;
  upsertMany(records: Omit<GraduateRecord, 'id'>[]): Promise<{ added: number; updated: number }>;
}
