import { IUserRepository } from '../ports/IUserRepository';
import { IAuditLogRepository } from '../ports/IAuditLogRepository';
import { UserNotFoundError, InvalidTokenError } from '../../domain/errors/AuthErrors';
import bcrypt from 'bcryptjs';

export class ActivateAlumni {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  async execute(data: any, ipAddress: string) {
    let userId: string;
    try {
      const decodedToken = Buffer.from(data.token, 'base64').toString('ascii');
      userId = decodedToken.split(':')[0];
    } catch (e) {
      throw new InvalidTokenError();
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundError();
    }

    if (user.role !== 'ALUMNI') {
      throw new Error('This endpoint is for alumni only');
    }

    const newHashedPassword = await bcrypt.hash(data.password, 10);

    await this.userRepository.update(userId, { password: newHashedPassword, isActive: true });

    await this.auditLogRepository.create({
      userId: user.id,
      action: 'ACTIVATE_ACCOUNT',
      details: 'Alumni account password set and activated',
      ipAddress,
    });

    return true;
  }
}
