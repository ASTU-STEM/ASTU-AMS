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
        'Super Admin': Role.SUPER_ADMIN,
        'Admin': Role.ADMIN,
        'ICT Admin': Role.ADMIN,
        'Alumni': Role.ALUMNI,
        'Employer': Role.EMPLOYER,
        'Department Head': Role.DEPARTMENT_HEAD,
        'Registrar': Role.REGISTRAR,
        'CMS Manager': Role.ALUMNI_OFFICE,
        'CMS Mgr': Role.ALUMNI_OFFICE,
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
        { adminProfile: { firstName: { contains: params.query, mode: 'insensitive' } } },
        { adminProfile: { lastName: { contains: params.query, mode: 'insensitive' } } },
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
            include: {
              department: true,
              experiences: true,
              certifications: true,
              projects: true,
              achievements: true,
              documentRequests: true,
              verificationRequests: true,
              registrarRecord: true,
            }
          },
          employerProfile: {
            include: {
              jobs: {
                include: {
                  applications: true,
                }
              }
            }
          },
          departmentHeadProfile: {
            include: { department: true }
          },
          adminProfile: true,
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
      } else if (user.role === Role.DEPARTMENT_HEAD) {
        const full = user.adminProfile ? `${user.adminProfile.firstName || ''} ${user.adminProfile.lastName || ''}`.trim() : '';
        name = full || user.email.split('@')[0];
        department = user.departmentHeadProfile?.department?.name || user.adminProfile?.department || 'Academic Dept';
        phone = user.adminProfile?.phone || '';
        status = user.isActive ? 'Active' : 'Inactive';
      } else if (user.adminProfile) {
        const full = `${user.adminProfile.firstName || ''} ${user.adminProfile.lastName || ''}`.trim();
        name = full || user.email.split('@')[0];
        department = user.adminProfile.department || (String(user.role) === 'SUPER_ADMIN' ? 'Executive Directorate' : 'System Office');
        phone = user.adminProfile.phone || '';
        status = user.isActive ? 'Active' : 'Inactive';
      } else {
        name = user.email.split('@')[0];
        department = String(user.role) === 'SUPER_ADMIN' ? 'Executive Directorate' : 'System Office';
        status = user.isActive ? 'Active' : 'Inactive';
      }

      // Map Prisma Role to Frontend Role String
      let displayRole = 'Admin';
      switch (String(user.role)) {
        case 'SUPER_ADMIN':
          displayRole = 'Super Admin';
          break;
        case 'ADMIN':
          displayRole = 'Admin';
          break;
        case 'ALUMNI':
          displayRole = 'Alumni';
          break;
        case 'EMPLOYER':
          displayRole = 'Employer';
          break;
        case 'DEPARTMENT_HEAD':
          displayRole = 'Department Head';
          break;
        case 'REGISTRAR':
          displayRole = 'Registrar';
          break;
        case 'ALUMNI_OFFICE':
        case 'CMS_MANAGER':
          displayRole = 'CMS Manager';
          break;
        default:
          displayRole = 'Admin';
          break;
      }

      // Additional database profile attributes
      let alumniExtra: any = {};
      let employerExtra: any = {};

      if (user.role === Role.ALUMNI && user.alumniProfile) {
        const prefs = (user.alumniProfile.preferences as any) || {};
        const currentExp = user.alumniProfile.experiences && user.alumniProfile.experiences.length > 0
          ? (user.alumniProfile.experiences.find((e: any) => e.isCurrent) || user.alumniProfile.experiences[0])
          : null;

        const resolvedCompany = prefs.company || (user.alumniProfile as any).company || currentExp?.companyName || null;
        const resolvedJobTitle = prefs.currentRole || (user.alumniProfile as any).currentRole || currentExp?.position || null;
        
        const isInvalidIndustry = (val?: string | null) => {
          if (!val) return true;
          const lower = val.toLowerCase().trim();
          return lower.includes('bachelor') || lower.includes('degree') || lower === 'student' || lower === 'n/a' || lower === 'none' || lower === 'null';
        };

        let resolvedIndustry = prefs.industry || (user.alumniProfile as any).industry || currentExp?.industry || null;
        if (isInvalidIndustry(resolvedIndustry)) {
          const comp = (resolvedCompany || '').toLowerCase();
          if (comp.includes('insa') || comp.includes('security') || comp.includes('cyber')) {
            resolvedIndustry = 'Cybersecurity & Defense Intelligence';
          } else if (comp.includes('safaricom') || comp.includes('ethio telecom') || comp.includes('telecom')) {
            resolvedIndustry = 'Telecommunications & Digital Services';
          } else if (comp.includes('bank') || comp.includes('chapa') || comp.includes('cbe') || comp.includes('financial')) {
            resolvedIndustry = 'Banking & Digital Financial Services';
          } else if (comp.includes('ai') || comp.includes('tech') || comp.includes('software') || comp.includes('corporation') || comp.includes('coporation')) {
            resolvedIndustry = 'Software & Artificial Intelligence';
          } else if (resolvedCompany) {
            resolvedIndustry = 'Technology & Engineering';
          } else {
            resolvedIndustry = null;
          }
        }

        const resolvedWorkLocation = prefs.workLocation || prefs.location || (user.alumniProfile as any).workLocation || (user.alumniProfile as any).location || currentExp?.location || null;
        const resolvedSalaryRange = prefs.salaryRange || (user.alumniProfile as any).salaryRange || currentExp?.salaryRange || (user.alumniProfile.salary ? `${user.alumniProfile.salary} ETB/Month` : null);
        // Absent an employer, the graduate's status is simply unreported.
        const resolvedEmploymentStatus =
          user.alumniProfile.employmentStatus || prefs.employmentStatus || (resolvedCompany ? 'EMPLOYED' : 'UNSPECIFIED');

        alumniExtra = {
          cgpa: user.alumniProfile.cgpa,
          graduationYear: user.alumniProfile.graduationYear,
          gender: user.alumniProfile.gender,
          dateOfBirth: user.alumniProfile.dateOfBirth ? user.alumniProfile.dateOfBirth.toISOString() : null,
          nationality: user.alumniProfile.nationality || null,
          address: user.alumniProfile.address || null,
          bio: user.alumniProfile.bio || null,
          profilePicture: user.alumniProfile.profilePicture || null,
          avatarUrl: user.alumniProfile.profilePicture || null,
          languages: user.alumniProfile.languages || [],
          skills: user.alumniProfile.skills || [],
          employmentStatus: resolvedEmploymentStatus,
          salary: user.alumniProfile.salary || null,
          resumeUrl: user.alumniProfile.resumeUrl || null,
          linkedIn: user.alumniProfile.linkedIn || null,
          gitHub: user.alumniProfile.gitHub || null,
          portfolio: user.alumniProfile.portfolio || null,
          telegram: user.alumniProfile.telegram || null,
          twitterUrl: user.alumniProfile.twitterUrl || null,
          preferences: user.alumniProfile.preferences || {},
          isCgpaPublic: (user.alumniProfile.isCgpaPublic !== false) && ((user.alumniProfile.preferences as any)?.shareCgpaToEmployers !== false),
          experiences: user.alumniProfile.experiences || [],
          certifications: user.alumniProfile.certifications || [],
          projects: user.alumniProfile.projects || [],
          achievements: user.alumniProfile.achievements || [],
          documentRequests: user.alumniProfile.documentRequests || [],
          verificationRequests: user.alumniProfile.verificationRequests || [],
          isVerified: user.alumniProfile.isVerified,
          registrarRecord: user.alumniProfile.registrarRecord || null,

          employerName: resolvedCompany,
          companyName: resolvedCompany,
          company: resolvedCompany,
          jobTitle: resolvedJobTitle,
          position: resolvedJobTitle,
          currentRole: resolvedJobTitle,
          industry: resolvedIndustry,
          salaryRange: resolvedSalaryRange,
          workLocation: resolvedWorkLocation,
          location: resolvedWorkLocation,
          experienceYears: user.alumniProfile.experiences?.length ? user.alumniProfile.experiences.length : null,
        };
      } else if (user.role === Role.EMPLOYER && user.employerProfile) {
        const jobPosts = user.employerProfile.jobs || user.employerProfile.jobPosts || [];
        const activeJobsCount = jobPosts.filter((j: any) => j.status === 'ACTIVE' || j.status === 'PUBLISHED' || j.status === 'Open').length;
        const totalApplicationsCount = jobPosts.reduce((acc: number, j: any) => acc + (j.applications?.length || 0), 0);

        employerExtra = {
          companyName: user.employerProfile.companyName,
          industry: user.employerProfile.industry,
          website: user.employerProfile.website || null,
          location: user.employerProfile.location,
          hrContact: user.employerProfile.hrContact,
          tin: user.employerProfile.tin || null,
          companySize: user.employerProfile.companySize || null,
          contactPerson: user.employerProfile.contactPerson || null,
          contactEmail: user.employerProfile.contactEmail || null,
          verificationStatus: user.employerProfile.verificationStatus || null,
          ndaSigned: user.employerProfile.ndaSigned,
          isPremium: user.employerProfile.isPremium,
          partnerships: user.employerProfile.partnerships || [],
          jobPosts: jobPosts.map((j: any) => ({
            id: j.id,
            title: j.title,
            type: j.type,
            location: j.location,
            status: j.status,
            createdAt: j.createdAt ? j.createdAt.toISOString() : null,
            applicantCount: j.applications?.length || 0,
          })),
          activeJobsCount,
          totalApplicationsCount,
        };
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
        lastLogin: user.updatedAt.toISOString(),
        registeredAt: user.createdAt.toISOString(),
        phone,
        twoFactorEnabled: user.twoFactorEnabled,
        adminNotes: (user as any).adminNotes || null,
        ...alumniExtra,
        ...employerExtra,
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

    // Compute Global Stats using parallel count queries instead of full table scan
    const [totalUsers, activeAlumni, suspendedAlumni, pendingAlumni, verifiedEmployers, unverifiedEmployers] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.alumniProfile.count({ where: { status: AlumniStatus.ACTIVE } }).catch(() => 0),
      prisma.alumniProfile.count({ where: { status: AlumniStatus.SUSPENDED } }).catch(() => 0),
      prisma.alumniProfile.count({ where: { status: AlumniStatus.INACTIVE } }).catch(() => 0),
      prisma.employerProfile.count({ where: { isVerified: true } }).catch(() => 0),
      prisma.employerProfile.count({ where: { isVerified: false } }).catch(() => 0)
    ]);

    const activeCount = activeAlumni + verifiedEmployers;
    const pendingCount = pendingAlumni + unverifiedEmployers;
    const suspendedCount = suspendedAlumni;
    const inactiveCount = Math.max(0, totalUsers - activeCount - pendingCount - suspendedCount);

    return {
      users: filteredUsers,
      totalCount: params.status && params.status !== 'All' ? filteredUsers.length : totalCount,
      totalPages: Math.ceil((params.status && params.status !== 'All' ? filteredUsers.length : totalCount) / limit),
      currentPage: page,
      stats: {
        total: totalUsers,
        active: activeCount,
        pending: pendingCount,
        suspended: suspendedCount,
        inactive: inactiveCount,
      }
    };
  }

  async createUser(data: {
    name: string;
    email: string;
    role: string;
    status?: string;
    isVerified?: boolean;
    department?: string;
    studentId?: string;
    phone?: string;
    password?: string;
    nationality?: string;
    dateOfBirth?: string;
    dob?: string;
    graduationYear?: number | string;
    batch?: number | string;
    cgpa?: number | string;
    gender?: string;
    industry?: string;
    location?: string;
    hrContact?: string;
  }) {
    let roleEnum: Role = Role.ALUMNI;
    const rLower = (data.role || '').toLowerCase().trim();
    if (rLower === 'super admin' || rLower === 'super_admin' || rLower === 'superadmin') {
      roleEnum = Role.SUPER_ADMIN;
    } else if (rLower === 'admin' || rLower === 'ict admin' || rLower === 'ict_admin') {
      roleEnum = Role.ADMIN;
    } else if (rLower === 'alumni') {
      roleEnum = Role.ALUMNI;
    } else if (rLower === 'employer') {
      roleEnum = Role.EMPLOYER;
    } else if (rLower === 'department head' || rLower === 'department_head' || rLower === 'dept head') {
      roleEnum = Role.DEPARTMENT_HEAD;
    } else if (rLower === 'registrar') {
      roleEnum = Role.REGISTRAR;
    } else if (rLower === 'cms manager' || rLower === 'cms mgr' || rLower === 'alumni_office' || rLower === 'alumni office') {
      roleEnum = Role.ALUMNI_OFFICE;
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

    let isActive = true;
    let alumniStatus: AlumniStatus = AlumniStatus.ACTIVE;

    if (data.status === 'Inactive') {
      isActive = false;
      alumniStatus = AlumniStatus.INACTIVE;
    } else if (data.status === 'Suspended') {
      isActive = false;
      alumniStatus = AlumniStatus.SUSPENDED;
    } else if (data.status === 'Pending Verification' || data.status === 'Pending') {
      isActive = false;
      alumniStatus = AlumniStatus.INACTIVE;
    }

    const isVerifiedFinal = data.isVerified !== undefined ? Boolean(data.isVerified) : isActive;

    // Special handling for Alumni role:
    if (roleEnum === Role.ALUMNI) {
      const cleanStudentId = (data.studentId || '').trim().toUpperCase();

      // 1. Store/Upsert master record in RegistrarStudent database table
      if (cleanStudentId) {
        const deptStr = data.department || 'Computer Science';
        const deptCode = deptStr.substring(0, 4).toUpperCase();
        const parsedGradYear = parseInt(String(data.graduationYear || data.batch || new Date().getFullYear()), 10);
        const parsedCgpa = parseFloat(String(data.cgpa || '3.5'));
        const rawDob = data.dateOfBirth || data.dob;
        const parsedDob = rawDob ? new Date(rawDob) : null;

        await prisma.registrarStudent.upsert({
          where: { studentId: cleanStudentId },
          update: {
            fullName: data.name,
            department: deptStr,
            departmentCode: deptCode,
            cgpa: isNaN(parsedCgpa) ? 3.5 : parsedCgpa,
            graduationYear: isNaN(parsedGradYear) ? new Date().getFullYear() : parsedGradYear,
            email: data.email ? data.email.trim() : null,
            phone: data.phone || null,
            nationality: data.nationality || 'Ethiopian',
            dateOfBirth: parsedDob && !isNaN(parsedDob.getTime()) ? parsedDob : null,
          },
          create: {
            studentId: cleanStudentId,
            fullName: data.name,
            department: deptStr,
            departmentCode: deptCode,
            cgpa: isNaN(parsedCgpa) ? 3.5 : parsedCgpa,
            graduationYear: isNaN(parsedGradYear) ? new Date().getFullYear() : parsedGradYear,
            email: data.email ? data.email.trim() : null,
            phone: data.phone || null,
            nationality: data.nationality || 'Ethiopian',
            dateOfBirth: parsedDob && !isNaN(parsedDob.getTime()) ? parsedDob : null,
            source: 'ADMIN_MANUAL_PROVISION'
          }
        }).catch(() => null);
      }

      // 2. If Active & Verified: Create full User login account & send email credentials!
      if (isActive || isVerifiedFinal) {
        const tempPassword = data.password ? data.password : `ASTU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const user = await prisma.user.create({
          data: {
            email: data.email,
            role: roleEnum,
            isActive: true,
            password: hashedPassword,
          }
        });

        const deptName = data.department || 'Computer Science';
        let dept = await prisma.department.findFirst({ where: { name: deptName } });
        if (!dept) {
          dept = await prisma.department.create({ data: { name: deptName, code: deptName.substring(0, 3).toUpperCase() } });
        }

        const parsedGradYear = parseInt(String(data.graduationYear || data.batch || new Date().getFullYear()), 10);
        const parsedCgpa = parseFloat(String(data.cgpa || '3.5'));
        const rawDob = data.dateOfBirth || data.dob;
        const parsedDob = rawDob ? new Date(rawDob) : null;

        await prisma.alumniProfile.create({
          data: {
            userId: user.id,
            studentId: cleanStudentId || `ASTU/UGR/${Date.now()}`,
            fullName: data.name,
            email: data.email,
            departmentId: dept.id,
            graduationYear: isNaN(parsedGradYear) ? new Date().getFullYear() : parsedGradYear,
            cgpa: isNaN(parsedCgpa) ? 3.5 : parsedCgpa,
            nationality: data.nationality || 'Ethiopian',
            dateOfBirth: parsedDob && !isNaN(parsedDob.getTime()) ? parsedDob : null,
            phone: data.phone || null,
            status: AlumniStatus.ACTIVE,
            isVerified: true,
            gender: data.gender || 'Unknown'
          }
        });

        // Send email credentials
        try {
          await emailService.sendTemporaryPassword(data.email, tempPassword, 'Alumni');
        } catch (error) {
          console.error('Failed to send welcome email to', data.email, error);
        }

        return { success: true, user };
      } else {
        // 3. If initially Inactive / Pending / Unverified:
        // Seed initial INACTIVE AlumniProfile stub. DO NOT send credentials email!
        const deptName = data.department || 'Computer Science';
        let dept = await prisma.department.findFirst({ where: { name: deptName } });
        if (!dept) {
          dept = await prisma.department.findFirst();
        }

        if (dept) {
          const parsedGradYear = parseInt(String(data.graduationYear || data.batch || new Date().getFullYear()), 10);
          const parsedCgpa = parseFloat(String(data.cgpa || '3.5'));

          const profile = await prisma.alumniProfile.create({
            data: {
              studentId: cleanStudentId || `ASTU/UGR/${Date.now()}`,
              fullName: data.name,
              email: data.email || null,
              phone: data.phone || null,
              gender: data.gender || 'Unknown',
              cgpa: isNaN(parsedCgpa) ? 3.5 : parsedCgpa,
              graduationYear: isNaN(parsedGradYear) ? new Date().getFullYear() : parsedGradYear,
              departmentId: dept.id,
              status: AlumniStatus.INACTIVE,
              isVerified: false
            }
          });
          return { success: true, profile };
        }
        return { success: true };
      }
    }

    // Standard provisioning for Staff & Corporate roles (Employer, Registrar, Dept Head, Admin)
    const tempPassword = data.password ? data.password : 'admin-generated';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        role: roleEnum,
        isActive: isActive,
        password: hashedPassword,
      }
    });

    if (roleEnum === Role.EMPLOYER) {
      await prisma.employerProfile.create({
        data: {
          userId: user.id,
          companyName: data.name,
          industry: data.industry || 'Technology & Engineering',
          location: data.location || 'Ethiopia',
          hrContact: data.hrContact || data.name,
          phone: data.phone || null,
          isVerified: isVerifiedFinal
        }
      });
    } else if (roleEnum === Role.DEPARTMENT_HEAD) {
      const deptName = data.department || 'Computer Science';
      let dept = await prisma.department.findFirst({ where: { name: deptName } });
      if (!dept) {
        dept = await prisma.department.create({ data: { name: deptName, code: deptName.substring(0, 3).toUpperCase() } });
      }
      await prisma.departmentHeadProfile.create({
        data: {
          userId: user.id,
          departmentId: dept.id
        }
      });
    } else if (roleEnum === Role.ADMIN) {
      const nameParts = (data.name || '').trim().split(' ');
      const firstName = nameParts[0] || 'System';
      const lastName = nameParts.slice(1).join(' ') || 'Admin';
      await prisma.adminProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone: data.phone || null,
          department: data.department || 'System Office'
        }
      }).catch(() => null);
    }

    // Send the professional welcome email with credentials for active staff/partners
    if (isActive) {
      try {
        await emailService.sendTemporaryPassword(data.email, tempPassword, data.role);
      } catch (error) {
        console.error('Failed to send welcome email to', data.email, error);
      }
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

      // Map role to display role
      let displayRole = 'User';
      switch (user.role) {
        case Role.ALUMNI: displayRole = 'Alumni'; break;
        case Role.EMPLOYER: displayRole = 'Employer'; break;
        case Role.DEPARTMENT_HEAD: displayRole = 'Department Head'; break;
        case Role.REGISTRAR: displayRole = 'Registrar'; break;
        case Role.ALUMNI_OFFICE: displayRole = 'CMS Manager'; break;
        case Role.ADMIN: displayRole = 'Admin'; break;
      }

      try {
        await emailService.sendAccountActivatedEmail(user.email, displayRole);
      } catch (error) {
        console.error('Failed to send account activation email to', user.email, error);
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

  async updateUser(id: string, data: any) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { alumniProfile: true, employerProfile: true, adminProfile: true, departmentHeadProfile: { include: { department: true } } }
    });
    if (!user) throw new Error('User not found');

    const userUpdate: any = {};
    if (data.email) userUpdate.email = data.email;
    if (data.status) {
      userUpdate.isActive = data.status === 'Active';
    }
    if (data.role) {
      let roleEnum: Role | null = null;
      const rLower = (data.role || '').toLowerCase().trim();
      if (rLower === 'super admin' || rLower === 'super_admin' || rLower === 'superadmin') {
        roleEnum = Role.SUPER_ADMIN;
      } else if (rLower === 'admin' || rLower === 'ict admin' || rLower === 'ict_admin') {
        roleEnum = Role.ADMIN;
      } else if (rLower === 'alumni') {
        roleEnum = Role.ALUMNI;
      } else if (rLower === 'employer') {
        roleEnum = Role.EMPLOYER;
      } else if (rLower === 'department head' || rLower === 'department_head' || rLower === 'dept head') {
        roleEnum = Role.DEPARTMENT_HEAD;
      } else if (rLower === 'registrar') {
        roleEnum = Role.REGISTRAR;
      } else if (rLower === 'cms manager' || rLower === 'cms mgr' || rLower === 'alumni_office' || rLower === 'alumni office') {
        roleEnum = Role.ALUMNI_OFFICE;
      }

      if (roleEnum) {
        userUpdate.role = roleEnum;
      }
    }

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({ where: { id }, data: userUpdate });
    }

    const currentRole = userUpdate.role || user.role;

    if (currentRole === Role.EMPLOYER && user.employerProfile) {
      const empUpdate: any = {};
      if (data.name || data.companyName) empUpdate.companyName = data.name || data.companyName;
      if (data.industry !== undefined) empUpdate.industry = data.industry;
      if (data.location !== undefined) empUpdate.location = data.location;
      if (data.hrContact !== undefined) empUpdate.hrContact = data.hrContact;
      if (data.phone !== undefined) empUpdate.phone = data.phone;
      if (data.tin !== undefined) empUpdate.tin = data.tin || null;
      if (data.website !== undefined) empUpdate.website = data.website || null;
      if (data.companySize !== undefined) empUpdate.companySize = data.companySize || null;
      if (data.contactPerson !== undefined) empUpdate.contactPerson = data.contactPerson || null;
      if (data.contactEmail !== undefined) empUpdate.contactEmail = data.contactEmail || null;
      if (data.verificationStatus !== undefined) empUpdate.verificationStatus = data.verificationStatus;
      if (data.ndaSigned !== undefined) empUpdate.ndaSigned = Boolean(data.ndaSigned);
      if (data.isPremium !== undefined) empUpdate.isPremium = Boolean(data.isPremium);

      if (Object.keys(empUpdate).length > 0) {
        await prisma.employerProfile.update({
          where: { id: user.employerProfile.id },
          data: empUpdate,
        });
      }
    } else if (currentRole === Role.ALUMNI && user.alumniProfile) {
      const alumniUpdate: any = {};
      if (data.name) alumniUpdate.fullName = data.name;
      if (data.studentId) alumniUpdate.studentId = data.studentId;
      if (data.phone !== undefined) alumniUpdate.phone = data.phone;
      if (data.cgpa && !isNaN(parseFloat(data.cgpa))) alumniUpdate.cgpa = parseFloat(data.cgpa);
      if (data.graduationYear && !isNaN(parseInt(data.graduationYear, 10))) alumniUpdate.graduationYear = parseInt(data.graduationYear, 10);
      if (data.industry !== undefined) alumniUpdate.industry = data.industry;
      if (data.location !== undefined) alumniUpdate.location = data.location;

      if (Object.keys(alumniUpdate).length > 0) {
        await prisma.alumniProfile.update({
          where: { id: user.alumniProfile.id },
          data: alumniUpdate,
        });
      }
    } else {
      // For Staff accounts (Registrar, Admin, Department Head, CMS Manager)
      if (data.name !== undefined || data.phone !== undefined || data.department !== undefined) {
        let firstName = 'Staff';
        let lastName = '';
        if (data.name) {
          const parts = data.name.trim().split(' ');
          firstName = parts[0] || 'Staff';
          lastName = parts.slice(1).join(' ') || '';
        } else if (user.adminProfile) {
          firstName = user.adminProfile.firstName;
          lastName = user.adminProfile.lastName;
        }

        const deptForAdmin = (currentRole === Role.DEPARTMENT_HEAD && (data.department || user.departmentHeadProfile?.department?.name))
          ? (data.department || user.departmentHeadProfile?.department?.name)
          : (data.department || 'System Office');

        await prisma.adminProfile.upsert({
          where: { userId: user.id },
          update: {
            ...(data.name !== undefined ? { firstName, lastName } : {}),
            ...(data.phone !== undefined ? { phone: data.phone } : {}),
            ...(deptForAdmin ? { department: deptForAdmin } : {}),
          },
          create: {
            userId: user.id,
            firstName,
            lastName,
            phone: data.phone || null,
            department: deptForAdmin,
          }
        });

        if (currentRole === Role.DEPARTMENT_HEAD) {
          const targetDeptName = data.department || user.departmentHeadProfile?.department?.name;
          if (targetDeptName) {
            let dept = await prisma.department.findFirst({ where: { name: targetDeptName } });
            if (!dept) {
              dept = await prisma.department.create({
                data: { name: targetDeptName, code: targetDeptName.substring(0, 4).toUpperCase() }
              });
            }
            await prisma.departmentHeadProfile.upsert({
              where: { userId: user.id },
              update: { departmentId: dept.id },
              create: { userId: user.id, departmentId: dept.id }
            }).catch(() => null);
          }
        }
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
    // Check if it's the last admin/super admin
    const user = await prisma.user.findUnique({ where: { id } });
    if (user?.role === Role.SUPER_ADMIN) {
      const superAdminCount = await prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
      if (superAdminCount <= 1) {
        throw new Error('Cannot delete the last Super Admin user.');
      }
    } else if (user?.role === Role.ADMIN) {
      const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user.');
      }
    }

    await prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async updateUserNotes(id: string, notes: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { adminNotes: notes } as any,
    });

    return { success: true, adminNotes: (updatedUser as any).adminNotes };
  }

  async resetPassword(id: string, newPassword?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error('User not found');

    const tempPassword = newPassword || `ASTU-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    try {
      let displayRole = 'User';
      switch (user.role) {
        case Role.ALUMNI: displayRole = 'Alumni'; break;
        case Role.EMPLOYER: displayRole = 'Employer'; break;
        case Role.DEPARTMENT_HEAD: displayRole = 'Department Head'; break;
        case Role.REGISTRAR: displayRole = 'Registrar'; break;
        case Role.ALUMNI_OFFICE: displayRole = 'CMS Manager'; break;
        case Role.ADMIN: displayRole = 'Admin'; break;
        case Role.SUPER_ADMIN: displayRole = 'Super Admin'; break;
      }
      await emailService.sendTemporaryPassword(user.email, tempPassword, displayRole);
    } catch (err) {
      console.error('Failed to send password reset email:', err);
    }

    return { success: true, newPassword: tempPassword, email: user.email };
  }
}

