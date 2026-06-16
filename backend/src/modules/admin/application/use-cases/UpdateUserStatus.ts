import prisma from '../../../../core/config/db';

export class UpdateUserStatus {
  async execute(userId: string, isActive: boolean) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employerProfile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update user status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    // If employer is being activated, also verify their profile
    if (user.role === 'EMPLOYER' && isActive && user.employerProfile) {
      await prisma.employerProfile.update({
        where: { userId },
        data: { isVerified: true },
      });
    }

    // If employer is being deactivated, also unverify their profile
    if (user.role === 'EMPLOYER' && !isActive && user.employerProfile) {
      await prisma.employerProfile.update({
        where: { userId },
        data: { isVerified: false },
      });
    }

    return updatedUser;
  }
}
