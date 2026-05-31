import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import { InvalidCredentialsError, AccountPendingApprovalError } from '../../domain/errors/AuthErrors';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken } from '../../../../core/utils/jwt.utils';
import { Role } from '@prisma/client';

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: any, ipAddress: string) {
    const user = await this.userRepository.findByEmail(data.email.toLowerCase());

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (!user.isActive) {
      if (user.role === Role.ALUMNI || user.role === Role.EMPLOYER) {
        throw new AccountPendingApprovalError();
      }
      throw new AccountPendingApprovalError(); // Custom message could be adapted
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
      accessToken,
      refreshToken,
    };
  }
}
