import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import { InvalidCredentialsError, AccountPendingApprovalError } from '../../domain/errors/AuthErrors';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../../../../core/utils/jwt.utils';
import { Role, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: any, ipAddress: string) {
    const identifier = data.emailOrStudentId?.trim();
    if (!identifier) {
      throw new InvalidCredentialsError();
    }

    let user: any = null;

    // Check if identifier looks like an email
    if (identifier.includes('@')) {
      user = await this.userRepository.findByEmail(identifier.toLowerCase());
    } else {
      // Try to find by student ID through AlumniProfile
      const profile = await prisma.alumniProfile.findUnique({
        where: { studentId: identifier },
        include: { user: true },
      });
      if (profile?.user) {
        user = profile.user;
      }
    }

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      if (user.role === Role.ALUMNI || user.role === Role.EMPLOYER) {
        throw new AccountPendingApprovalError();
      }
      throw new AccountPendingApprovalError();
    }

    if (user.role === Role.EMPLOYER && !data.isEmployerLoginFlow) {
      throw new Error('Employers use the separate employer login page');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password as string);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const payload = { userId: user.id, email: user.email, role: user.role as Role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await this.auditLogRepository.create({
      userId: user.id,
      action: data.isEmployerLoginFlow ? 'EMPLOYER_LOGIN' : 'LOGIN',
      details: 'User logged in successfully',
      ipAddress,
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      token: accessToken,
      refreshToken,
    };
  }
}
