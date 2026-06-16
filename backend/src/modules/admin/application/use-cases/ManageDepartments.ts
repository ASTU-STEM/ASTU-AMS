import { PrismaClient } from '@prisma/client';

import prisma from '../../../../core/config/db';

export class ManageDepartments {
  async getDepartments() {
    const departments = await prisma.department.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { alumniProfiles: true },
        },
      },
    });

    return departments.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      alumniCount: d._count.alumniProfiles,
      createdAt: d.createdAt,
    }));
  }

  async createDepartment(data: { name: string; code: string }) {
    if (!data.name || !data.code) {
      throw new Error('Name and code are required');
    }

    const existing = await prisma.department.findFirst({
      where: {
        OR: [
          { name: data.name },
          { code: data.code }
        ]
      }
    });

    if (existing) {
      throw new Error('Department with this name or code already exists');
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        code: data.code,
      },
    });

    return department;
  }

  async updateDepartment(id: string, data: { name?: string; code?: string }) {
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Department not found');
    }

    if (data.name || data.code) {
      const conflict = await prisma.department.findFirst({
        where: {
          id: { not: id },
          OR: [
            ...(data.name ? [{ name: data.name }] : []),
            ...(data.code ? [{ code: data.code }] : [])
          ]
        }
      });
      if (conflict) {
        throw new Error('Another department uses this name or code');
      }
    }

    const updated = await prisma.department.update({
      where: { id },
      data,
    });

    return updated;
  }

  async deleteDepartment(id: string) {
    const existing = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: { select: { alumniProfiles: true } }
      }
    });

    if (!existing) {
      throw new Error('Department not found');
    }

    if (existing._count.alumniProfiles > 0) {
      throw new Error('Cannot delete department with active alumni profiles');
    }

    await prisma.department.delete({ where: { id } });
    return { success: true };
  }
}
