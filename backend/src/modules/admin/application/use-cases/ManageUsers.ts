import prisma from '../../../../core/config/db';
import { Role, AlumniStatus } from '@prisma/client';
import { EmailService } from '../../../../core/services/EmailService';
import bcrypt from 'bcryptjs';

const emailService = new EmailService();

export class ManageUsers {
  async getRoleStats() {
    const group = await prisma.user.groupBy({
      by: ['role'],
      _count: {
        id: true,
      },
    });

    const stats: Record<string, number> = {};
    for (const g of group) {
      stats[g.role] = g._count.id;
    }

    return stats;
  }

  async getUsers(params: {
    page?: number;
    limit?: number;
    query?: string;
    role?: string;
    status?: string;
    department?: string;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 25;
    const skip = (page - 1) * limit;

    // We build a dynamic where clause based on the query, role, and status.
    const where: any = {};

    if (params.role && params.role !== 'All Roles') {
      const roleMap: Record<string, Role> = {
        'Alumni': Role.ALUMNI,
        'Employer': Role.EMPLOYER,
        'Department Head': Role.DEPARTMENT_HEAD,
        'Registrar': Role.REGISTRAR,
        'Admin': Role.ADMIN,
      };
      if (roleMap[params.role]) {
        where.role = roleMap[params.role];
      }
    }

    if (params.query) {
      where.OR = [
        { email: { contains: params.query, mode: 'insensitive' } },
        { alumniProfile: { fullName: { contains: params.query, mode: 'insensitive' } } },
        { alumniProfile: { studentId: { contains: params.query, mode: 'insensitive' } } },
        { employerProfile: { companyName: { contains: params.query, mode: 'insensitive' } } },
      ];
    }

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          alumniProfile: {
            include: { department: true }
          },
          employerProfile: true,
          departmentHeadProfile: {
            include: { department: true }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    // Map the database models to the UserRow shape expected by the frontend
    const mappedUsers = users.map((user: any) => {
      let name = 'Unknown User';
      let studentId = '';
      let department = 'N/A';
      let batch = 'N/A';
      let status = 'Inactive';
      let phone = '';

      if (user.role === Role.ALUMNI && user.alumniProfile) {
        name = user.alumniProfile.fullName;
        studentId = user.alumniProfile.studentId;
        department = user.alumniProfile.department.name;
        batch = user.alumniProfile.graduationYear.toString();
        phone = user.alumniProfile.phone || '';

        switch (user.alumniProfile.status) {
          case AlumniStatus.ACTIVE:
            status = 'Active';
            break;
          case AlumniStatus.SUSPENDED:
            status = 'Suspended';
            break;
          case AlumniStatus.INACTIVE:
            status = 'Pending Verification'; // We'll map inactive to pending for new signups
            break;
        }

        if (!user.isActive) {
          status = 'Inactive';
        }
      } else if (user.role === Role.EMPLOYER && user.employerProfile) {
        name = user.employerProfile.companyName;
        department = 'External Partner';
        phone = user.employerProfile.phone || '';
        status = user.employerProfile.isVerified ? (user.isActive ? 'Active' : 'Suspended') : 'Pending Verification';
      } else if (user.role === Role.DEPARTMENT_HEAD && user.departmentHeadProfile) {
        name = user.email.split('@')[0]; // Can be updated if they have a profile name
        department = user.departmentHeadProfile.department.name;
        status = user.isActive ? 'Active' : 'Inactive';
      } else {
        name = user.email.split('@')[0];
        department = 'System Office';
        status = user.isActive ? 'Active' : 'Inactive';
      }

      // Map Prisma Role to Frontend Role String
      let displayRole = 'Admin';
      switch (user.role) {
        case Role.ALUMNI: displayRole = 'Alumni'; break;
        case Role.EMPLOYER: displayRole = 'Employer'; break;
        case Role.DEPARTMENT_HEAD: displayRole = 'Department Head'; break;
        case Role.REGISTRAR: displayRole = 'Registrar'; break;
        case Role.ALUMNI_OFFICE: displayRole = 'CMS Mgr'; break;
        case Role.ADMIN: displayRole = 'Admin'; break;
      }

      return {
        id: user.id,
        name,
        email: user.email,
        studentId,
        role: displayRole,
        department,
        batch,
        status,
        lastLogin: user.updatedAt.toISOString(), // Placeholder
        registeredAt: user.createdAt.toISOString(),
        phone,
      };
    });

    // Handle Frontend 'Status' Filter manually since it's derived
    let filteredUsers = mappedUsers;
    if (params.status && params.status !== 'All') {
      filteredUsers = filteredUsers.filter((u: any) => u.status === params.status);
    }

    // Handle Frontend 'Department' Filter manually
    if (params.department && params.department !== 'All Departments') {
      filteredUsers = filteredUsers.filter((u: any) => u.department === params.department);
    }

    // Compute Global Stats (ignoring filters to show overall system health)
    const allUsers = await prisma.user.findMany({
      include: {
        alumniProfile: true,
        employerProfile: true,
      }
    });

    let activeCount = 0;
    let pendingCount = 0;
    let suspendedCount = 0;
    let inactiveCount = 0;

    for (const u of allUsers) {
      if (u.role === Role.ALUMNI && u.alumniProfile) {
        if (u.alumniProfile.status === AlumniStatus.ACTIVE) activeCount++;
        else if (u.alumniProfile.status === AlumniStatus.SUSPENDED) suspendedCount++;
        else pendingCount++;
      } else if (u.role === Role.EMPLOYER && u.employerProfile) {
        if (!u.employerProfile.isVerified) pendingCount++;
        else if (u.isActive) activeCount++;
        else suspendedCount++;
      } else {
        if (u.isActive) activeCount++;
        else inactiveCount++;
      }
    }

    return {
      users: filteredUsers,
      totalCount: params.status && params.status !== 'All' ? filteredUsers.length : totalCount, // Approximate if filtered manually
      totalPages: Math.ceil((params.status && params.status !== 'All' ? filteredUsers.length : totalCount) / limit),
      currentPage: page,
      stats: {
        total: allUsers.length,
        active: activeCount,
        pending: pendingCount,
        suspended: suspendedCount,
        inactive: inactiveCount
      }
    };
  }

  async createUser(data: { name: string; email: string; role: string; department: string; studentId?: string; phone?: string; password?: string }) {
    // Basic password hash logic skipped for admin direct creation or assumed to be handled by auth layer.
    // For demo/simplicity, we'll create the user and profile.
    let roleEnum: Role = Role.ALUMNI;
    switch (data.role) {
      case 'Alumni': roleEnum = Role.ALUMNI; break;
      case 'Employer': roleEnum = Role.EMPLOYER; break;
      case 'Department Head': roleEnum = Role.DEPARTMENT_HEAD; break;
      case 'Registrar': roleEnum = Role.REGISTRAR; break;
      case 'CMS Mgr': roleEnum = Role.ALUMNI_OFFICE; break;
      case 'Admin': roleEnum = Role.ADMIN; break;
    }

    // Check for existing user by email
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error(`A user with the email ${data.email} already exists.`);
    }

    // Check for existing student ID if Alumni
    if (roleEnum === Role.ALUMNI && data.studentId) {
      const existingAlumni = await prisma.alumniProfile.findUnique({ where: { studentId: data.studentId } });
      if (existingAlumni) {
        throw new Error(`An alumni with the Student ID ${data.studentId} already exists.`);
      }
    }

    const tempPassword = data.password ? data.password : 'admin-generated';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        role: roleEnum,
        isActive: true, // Auto-activate admin-created users
        password: hashedPassword,
      }
    });

    if (roleEnum === Role.ALUMNI) {
      // Need a default dept for alumni if not provided properly. We'll find or create one just in case.
      let dept = await prisma.department.findFirst({ where: { name: data.department } });
      if (!dept) {
        dept = await prisma.department.create({ data: { name: data.department, code: data.department.substring(0, 3).toUpperCase() } });
      }
      await prisma.alumniProfile.create({
        data: {
          userId: user.id,
          studentId: data.studentId || `ASTU/TMP/${Date.now()}`,
          fullName: data.name,
          departmentId: dept.id,
          graduationYear: new Date().getFullYear(),
          phone: data.phone,
          status: AlumniStatus.ACTIVE,
          isVerified: true,
          cgpa: 0.0,
          gender: 'Unknown'
        }
      });
    } else if (roleEnum === Role.EMPLOYER) {
      await prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyName: data.name,
          industry: 'Unknown',
          location: 'Unknown',
          hrContact: data.name,
          phone: data.phone,
          isVerified: true
        }
      });
    } else if (roleEnum === Role.DEPARTMENT_HEAD) {
      let dept = await prisma.department.findFirst({ where: { name: data.department } });
      if (!dept) {
        dept = await prisma.department.create({ data: { name: data.department, code: data.department.substring(0, 3).toUpperCase() } });
      }
      await prisma.departmentHeadProfile.create({
        data: {
          userId: user.id,
          departmentId: dept.id
        }
      });
    }

    // Send the professional welcome email with credentials
    try {
      await emailService.sendTemporaryPassword(data.email, data.password || 'admin-generated', data.role);
    } catch (error) {
      console.error('Failed to send welcome email to', data.email, error);
    }

    return { success: true, user };
  }

  async updateUserStatus(id: string, action: 'activate' | 'suspend' | 'verify') {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { alumniProfile: true, employerProfile: true }
    });

    if (!user) throw new Error('User not found');

    if (action === 'activate' || action === 'verify') {
      await prisma.user.update({
        where: { id },
        data: { isActive: true }
      });

      if (user.role === Role.ALUMNI && user.alumniProfile) {
        await prisma.alumniProfile.update({
          where: { id: user.alumniProfile.id },
          data: { status: AlumniStatus.ACTIVE, isVerified: true }
        });
      } else if (user.role === Role.EMPLOYER && user.employerProfile) {
        await prisma.employerProfile.update({
          where: { id: user.employerProfile.id },
          data: { isVerified: true }
        });
      }
    } else if (action === 'suspend') {
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });

      if (user.role === Role.ALUMNI && user.alumniProfile) {
        await prisma.alumniProfile.update({
          where: { id: user.alumniProfile.id },
          data: { status: AlumniStatus.SUSPENDED }
        });
      }
    }

    return { success: true };
  }

  async bulkUpdateStatus(ids: string[], action: 'activate' | 'suspend' | 'verify') {
    // In a real prod app we might want to do a transaction, but loop is fine for admin scale
    for (const id of ids) {
      await this.updateUserStatus(id, action);
    }
    return { success: true };
  }

  async deleteUser(id: string) {
    // Check if it's the last admin
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user.');
      }
    }

    await prisma.user.delete({ where: { id } });
    return { success: true };
  }
}
