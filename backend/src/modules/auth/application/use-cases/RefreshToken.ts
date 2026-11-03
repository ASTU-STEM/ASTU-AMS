import { IUserRepository } from '../ports/IUserRepository';
import { InvalidTokenError } from '../../domain/errors/AuthErrors';
import { verifyRefreshToken, generateAccessToken } from '../../../../core/utils/jwt.utils';
import { Role } from '@prisma/client';

export class RefreshToken {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new InvalidTokenError();
      }

      const payload = { userId: user.id, email: user.email, role: user.role as Role };
      const newAccessToken = generateAccessToken(payload);

      return { accessToken: newAccessToken, token: newAccessToken };
    } catch (err) {
      throw new InvalidTokenError();
    }
  }
}
