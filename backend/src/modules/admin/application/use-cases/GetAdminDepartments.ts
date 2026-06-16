import prisma from '../../../../core/config/db';

export class GetAdminDepartments {
  async execute() {
    return prisma.department.findMany({
      include: { alumniProfiles: true }
    });
  }
}
