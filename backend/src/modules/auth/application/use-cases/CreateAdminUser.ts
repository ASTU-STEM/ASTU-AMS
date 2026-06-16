import { IUserRepository } from '../ports/IUserRepository';
import { PrismaClient, Role } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';

import prisma from '../../../../core/config/db';

export interface CreateAdminUserRequest {
  email: string;
  role: 'REGISTRAR' | 'DEPARTMENT_HEAD' | 'ADMIN';
  fullName?: string;
}

export class CreateAdminUser {
  constructor(private userRepo: IUserRepository, private emailService: EmailService) {}

  async execute(req: CreateAdminUserRequest, adminId: string) {
    const existingUser = await this.userRepo.findByEmail(req.email);
    if (existingUser) {
      throw new Error('Email address already in use');
    }

    // Generate random 12-character temporary password
    const tempPassword = this.generateTempPassword();
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await this.userRepo.create({
      email: req.email.toLowerCase(),
      password: hashedPassword,
      role: req.role as Role,
      isActive: true,
    });

    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: 'CREATE_USER',
        details: `${req.role} account created: ${req.email}`,
        ipAddress: 'admin-panel',
      },
    });

    await this.emailService.sendTemporaryPassword(req.email, tempPassword, req.role);

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      tempPassword,
      message: 'Account created. Temporary password sent to email. User must change password on first login.',
    };
  }

  private generateTempPassword(length: number = 12): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}
