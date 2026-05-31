import { IAlumniDepartmentRepository, AlumniBasicInfo } from '../../application/ports/IAlumniDepartmentRepository';
import prisma from '../../../../core/config/db';

export class PrismaAlumniDepartmentRepository implements IAlumniDepartmentRepository {
  async findByDepartmentId(departmentId: string): Promise<AlumniBasicInfo[]> {
    const alumni = await prisma.alumniProfile.findMany({
      where: { departmentId },
      include: {
        user: true, // Assuming we need user data for fullName or similar. Actually, name might be on profile or user.
      },
    });

    return alumni.map((a: any) => ({
      id: a.id,
      userId: a.userId,
      fullName: a.fullName || a.user?.email || 'Unknown', // Using email fallback since User doesn't have fullName
      graduationYear: a.graduationYear,
      employmentStatus: a.employmentStatus,
    }));
  }
}
