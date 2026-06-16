import { IDashboardRepository, DashboardSummary } from '../../application/ports/IDashboardRepository';
import prisma from '../../../../core/config/db';
import { AlumniStatus } from '@prisma/client';

export class PrismaDashboardRepository implements IDashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    const [totalGraduates, totalAlumni, pendingVerifications, pendingDocumentRequests] = await Promise.all([
      prisma.registrarStudent.count(),
      prisma.alumniProfile.count({ where: { status: AlumniStatus.ACTIVE } }),
      prisma.alumniProfile.count({ where: { status: AlumniStatus.INACTIVE } }),
      prisma.documentRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalGraduates,
      totalAlumni,
      pendingVerifications,
      pendingDocumentRequests,
    };
  }
}
