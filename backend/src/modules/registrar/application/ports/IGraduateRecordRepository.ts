import { GraduateRecord } from '../../domain/entities/Registrar';

export interface IGraduateRecordRepository {
  findByStudentId(studentId: string): Promise<GraduateRecord | null>;
  findAll(): Promise<GraduateRecord[]>;
  upsertMany(records: Omit<GraduateRecord, 'id'>[]): Promise<{ added: number; updated: number }>;
}
