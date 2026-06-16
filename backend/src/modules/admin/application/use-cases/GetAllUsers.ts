import prisma from '../../../../core/config/db';

export class GetAllUsers {
  async execute() {
    const users = await prisma.user.findMany({
      include: {
        alumniProfile: true,
        employerProfile: true,
        departmentHeadProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }
}
