import { IUserRepository } from '../ports/IUserRepository';
import { InvalidTokenError } from '../../domain/errors/AuthErrors';
import { verifyRefreshToken, generateAccessToken } from '../../../../core/utils/jwt.utils';
import { TokenRevocationService } from '../../../../core/services/TokenRevocationService';
import { Role } from '@prisma/client';

export class RefreshToken {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(refreshToken: string) {
    if (!refreshToken) {
      throw new InvalidTokenError();
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);

      // A refresh token revoked at logout must never be able to mint a new
      // access token, otherwise logout only appears to work.
      if (await TokenRevocationService.isRevoked(decoded.jti)) {
        throw new InvalidTokenError();
      }

      const user = await this.userRepository.findById(decoded.userId);

      if (!user || !user.isActive) {
        throw new InvalidTokenError();
      }

      const payload = { userId: user.id, email: user.email, role: user.role as Role };
      const newAccessToken = generateAccessToken(payload);

      return { accessToken: newAccessToken };
    } catch (err) {
      throw new InvalidTokenError();
    }
  }
}
