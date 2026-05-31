import { IUserRepository } from '../../application/ports/IUserRepository';
import { User } from '../../domain/entities/User';
import prisma from '../../../../core/config/db';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { id } });
    if (!data) return null;
    return new User(data.id, data.email, data.role, data.isActive, data.password, data.createdAt, data.updatedAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({ where: { email } });
    if (!data) return null;
    return new User(data.id, data.email, data.role, data.isActive, data.password, data.createdAt, data.updatedAt);
  }

  async create(user: Omit<User, 'id'>): Promise<User> {
    const data = await prisma.user.create({
      data: {
        email: user.email,
        password: user.password as string,
        role: user.role as any,
        isActive: user.isActive,
      },
    });
    return new User(data.id, data.email, data.role, data.isActive, data.password, data.createdAt, data.updatedAt);
  }

  async update(id: string, payload: Partial<User>): Promise<User> {
    const data = await prisma.user.update({
      where: { id },
      data: {
        email: payload.email,
        password: payload.password,
        isActive: payload.isActive,
        role: payload.role as any,
      },
    });
    return new User(data.id, data.email, data.role, data.isActive, data.password, data.createdAt, data.updatedAt);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
