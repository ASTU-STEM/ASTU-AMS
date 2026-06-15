import { IGraduateRecordRepository } from '../../application/ports/IGraduateRecordRepository';
import { GraduateRecord } from '../../domain/entities/Registrar';
import prisma from '../../../../core/config/db';

export class PrismaGraduateRecordRepository implements IGraduateRecordRepository {
  async findByStudentId(studentId: string): Promise<GraduateRecord | null> {
    const record = await prisma.registrarStudent.findUnique({
      where: { studentId },
    });
    if (!record) return null;
    return record as any as GraduateRecord;
  }

  async findAll(): Promise<GraduateRecord[]> {
    const records = await prisma.registrarStudent.findMany({
      orderBy: { importedAt: 'desc' },
    });
    return records as any[] as GraduateRecord[];
  }

  async upsertMany(records: Omit<GraduateRecord, 'id'>[]): Promise<{ added: number; updated: number }> {
    let added = 0;
    let updated = 0;

    for (const record of records) {
      const existing = await prisma.registrarStudent.findUnique({
        where: { studentId: record.studentId },
      });

      if (existing) {
        await prisma.registrarStudent.update({
          where: { studentId: record.studentId },
          data: record as any,
        });
        updated++;
      } else {
        await prisma.registrarStudent.create({
          data: record as any,
        });
        added++;
      }
    }

    return { added, updated };
  }
}
