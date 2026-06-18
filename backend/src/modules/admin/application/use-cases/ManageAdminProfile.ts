import prisma from '../../../../core/config/db';
import bcrypt from 'bcryptjs';

export class ManageAdminProfile {
  static async getProfile(userId: string) {
    let profile = await prisma.adminProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    if (!profile) {
      // Create default profile if it doesn't exist
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      profile = await prisma.adminProfile.create({
        data: {
          userId,
          firstName: 'System',
          lastName: 'Administrator',
          department: 'ICT Directorate',
          employeeId: 'EMP-ASTU-001',
          bio: 'Overseeing the overall digital infrastructure, alumni tracking system, and API integrations for Adama Science and Technology University.'
        },
        include: { user: true }
      });
    }

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.user.email,
      phone: profile.phone || '',
      department: profile.department || '',
      employeeId: profile.employeeId || '',
      bio: profile.bio || ''
    };
  }

  static async updateProfile(userId: string, data: any) {
    const profile = await prisma.adminProfile.upsert({
      where: { userId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        department: data.department,
        employeeId: data.employeeId,
        bio: data.bio
      },
      create: {
        userId,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        department: data.department,
        employeeId: data.employeeId,
        bio: data.bio
      }
    });

    return profile;
  }

  static async updateSecurity(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isValidPassword = await bcrypt.compare(data.currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password updated successfully' };
  }
}
