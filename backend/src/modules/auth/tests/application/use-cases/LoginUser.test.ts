import { LoginUser } from '../../../application/use-cases/LoginUser';
import { IUserRepository } from '../../../application/ports/IUserRepository';
import { IAuditLogRepository } from '../../../application/ports/IAuditLogRepository';
import { User } from '../../../domain/entities/User';
import { InvalidCredentialsError } from '../../../domain/errors/AuthErrors';
import bcrypt from 'bcryptjs';

// Mock dependencies
const mockUserRepository: jest.Mocked<IUserRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockAuditLogRepository: jest.Mocked<IAuditLogRepository> = {
  create: jest.fn(),
  findByUserId: jest.fn(),
};

// Mock bcrypt
jest.mock('bcryptjs');

// Mock jwt utils
jest.mock('../../../../../core/utils/jwt.utils', () => ({
  generateAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
}));

describe('LoginUser Use Case', () => {
  let useCase: LoginUser;

  beforeEach(() => {
    useCase = new LoginUser(mockUserRepository, mockAuditLogRepository);
    jest.clearAllMocks();
  });

  it('should throw InvalidCredentialsError if user is not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'notfound@test.com', password: 'password' }, '127.0.0.1'))
      .rejects.toThrow(InvalidCredentialsError);
  });

  it('should return tokens if login is successful', async () => {
    const mockUser = new User('1', 'test@test.com', 'ADMIN', true, 'hashedPassword');
    mockUserRepository.findByEmail.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute({ email: 'test@test.com', password: 'password' }, '127.0.0.1');

    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
    expect(mockAuditLogRepository.create).toHaveBeenCalled();
  });
});
