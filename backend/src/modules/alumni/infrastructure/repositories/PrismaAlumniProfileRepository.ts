import { IAlumniProfileRepository } from '../../application/ports/IAlumniProfileRepository';
import { AlumniProfile } from '../../domain/entities/Alumni';
import prisma from '../../../../core/config/db';

export class PrismaAlumniProfileRepository implements IAlumniProfileRepository {
  private async enrichProfileData(data: any): Promise<AlumniProfile> {
    if (!data) return null as any;

    const prefs = (data.preferences as any) || {};
    const currentExp = Array.isArray(data.experiences)
      ? (data.experiences.find((e: any) => e.isCurrent) || data.experiences[0])
      : null;

    // Check for active hired job application
    const hiredApp = await prisma.jobApplication.findFirst({
      where: {
        alumniId: data.id,
        status: 'HIRED',
      },
      include: {
        job: {
          include: {
            employer: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    }).catch(() => null);

    const isHired = data.employmentStatus === 'EMPLOYED' || data.employmentStatus === 'FULL_TIME' || Boolean(hiredApp) || Boolean(prefs.company) || Boolean(currentExp?.companyName);

    const resolvedCompany = prefs.company || hiredApp?.job?.employer?.companyName || currentExp?.companyName || (isHired ? 'ASTU Corporate Partner' : 'ASTU Alumnus');
    const resolvedRole = prefs.currentRole || hiredApp?.job?.title || currentExp?.position || (isHired ? 'Hired Graduate' : 'Not Employed');
    const resolvedSalary = prefs.salaryRange || hiredApp?.job?.salary || currentExp?.salaryRange || (data.salary ? `${data.salary} ETB` : (isHired ? 'Competitive Salary' : 'Seeking Opportunities'));
    const resolvedBatch = data.batch || (data.graduationYear ? `${data.graduationYear}` : '2024');

    return {
      ...data,
      batch: resolvedBatch,
      company: resolvedCompany,
      currentRole: resolvedRole,
      salaryRange: resolvedSalary,
      employmentStatus: isHired ? 'EMPLOYED' : data.employmentStatus,
      linkedInUrl: data.linkedIn || data.linkedInUrl,
      gitHubUrl: data.gitHub || data.gitHubUrl,
      portfolioUrl: data.portfolio || data.portfolioUrl,
      twitterUrl: data.twitterUrl,
      skills: Array.isArray(data.skills) ? data.skills : [],
    } as any as AlumniProfile;
  }

  async findByUserId(userId: string): Promise<AlumniProfile | null> {
    const data = await prisma.alumniProfile.findUnique({
      where: { userId },
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        department: true,
        certifications: true,
        projects: true,
        achievements: true,
      },
    });

    if (!data) return null;
    return this.enrichProfileData(data);
  }

  async update(userId: string, updateData: any): Promise<AlumniProfile> {
    // Destructure relations and non-schema fields out of updateData
    const {
      certifications, projects, achievements,
      // Non-schema fields sent by frontend that must be stripped
      experiences, resume, studentId,
      avatarUrl, linkedInUrl, gitHubUrl, twitterUrl, portfolioUrl,
      id, userId: _uid, createdAt, updatedAt,
      // Keep the rest as potential scalar updates
      ...rest
    } = updateData;

    // Map frontend field names → Prisma schema field names
    const dataToUpdate: any = {};

    // Allowed scalar fields on AlumniProfile
    const ALLOWED_SCALARS = new Set([
      'fullName', 'email', 'phone', 'profilePicture', 'bio', 'nationality',
      'maritalStatus', 'volunteerWork', 'address', 'languages', 'skills',
      'resumeUrl', 'linkedIn', 'gitHub', 'portfolio', 'telegram',
      'twitterUrl', 'employmentStatus', 'salary', 'gender', 'dateOfBirth',
    ]);

    // Copy only allowed scalars from `rest`
    for (const key of Object.keys(rest)) {
      if (ALLOWED_SCALARS.has(key)) {
        if (key === 'dateOfBirth' && rest.dateOfBirth) {
          try {
            dataToUpdate.dateOfBirth = new Date(rest.dateOfBirth);
          } catch (e) {
            console.error('Invalid dateOfBirth:', rest.dateOfBirth);
          }
        } else {
          dataToUpdate[key] = rest[key];
        }
      }
    }

    // Map Academic Record fields (cgpa, graduationYear / batch, department)
    if (updateData.cgpa !== undefined && updateData.cgpa !== null && updateData.cgpa !== '') {
      const parsedCgpa = parseFloat(updateData.cgpa);
      if (!isNaN(parsedCgpa)) {
        dataToUpdate.cgpa = parsedCgpa;
      }
    }

    if (updateData.batch || updateData.graduationYear) {
      const rawBatch = String(updateData.batch || updateData.graduationYear);
      const parsedYear = parseInt(rawBatch.replace(/\D/g, ''));
      if (!isNaN(parsedYear)) {
        dataToUpdate.graduationYear = parsedYear;
      }
    }

    if (updateData.department) {
      const deptName = typeof updateData.department === 'object' ? updateData.department.name : updateData.department;
      if (deptName) {
        const dept = await prisma.department.findFirst({
          where: { name: { contains: deptName, mode: 'insensitive' } }
        }).catch(() => null);
        if (dept) {
          dataToUpdate.departmentId = dept.id;
        }
      }
    }

    // Persist Employment Details (company, currentRole, salaryRange) to preferences JSON
    if (updateData.company !== undefined || updateData.currentRole !== undefined || updateData.salaryRange !== undefined) {
      const existingProfile = await prisma.alumniProfile.findUnique({ where: { userId } }).catch(() => null);
      const currentPrefs = (existingProfile?.preferences as any) || {};

      dataToUpdate.preferences = {
        ...currentPrefs,
        ...(updateData.company !== undefined ? { company: updateData.company } : {}),
        ...(updateData.currentRole !== undefined ? { currentRole: updateData.currentRole } : {}),
        ...(updateData.salaryRange !== undefined ? { salaryRange: updateData.salaryRange } : {}),
      };

      if (updateData.company || updateData.currentRole) {
        dataToUpdate.employmentStatus = 'EMPLOYED';
      }
    }

    // Map frontend names to schema names
    if (avatarUrl !== undefined) dataToUpdate.profilePicture = avatarUrl;
    if (updateData.profilePicture !== undefined) dataToUpdate.profilePicture = updateData.profilePicture;

    const targetLinkedIn = updateData.linkedInUrl !== undefined ? updateData.linkedInUrl : (updateData.linkedIn !== undefined ? updateData.linkedIn : linkedInUrl);
    if (targetLinkedIn !== undefined) dataToUpdate.linkedIn = targetLinkedIn;

    const targetGitHub = updateData.gitHubUrl !== undefined ? updateData.gitHubUrl : (updateData.gitHub !== undefined ? updateData.gitHub : gitHubUrl);
    if (targetGitHub !== undefined) dataToUpdate.gitHub = targetGitHub;

    const targetPortfolio = updateData.portfolioUrl !== undefined ? updateData.portfolioUrl : (updateData.portfolio !== undefined ? updateData.portfolio : portfolioUrl);
    if (targetPortfolio !== undefined) dataToUpdate.portfolio = targetPortfolio;

    const targetTwitter = updateData.twitterUrl !== undefined ? updateData.twitterUrl : twitterUrl;
    if (targetTwitter !== undefined) dataToUpdate.twitterUrl = targetTwitter;

    if (updateData.resumeUrl !== undefined) dataToUpdate.resumeUrl = updateData.resumeUrl;

    // Also update primary User account email if changed
    if (updateData.email) {
      await prisma.user.update({
        where: { id: userId },
        data: { email: updateData.email }
      }).catch((err: any) => console.error('Note: User email update failed or email unchanged', err?.message));
    }

    // Handle nested relation writes
    if (certifications && Array.isArray(certifications)) {
      dataToUpdate.certifications = {
        deleteMany: {},
        create: certifications.map((c: any) => ({
          name: c.name,
          issuer: c.issuer || '',
          issueDate: c.issueDate || null,
          expiryDate: c.expiryDate || null,
          credentialUrl: c.credentialUrl || null,
          imageUrl: c.imageUrl || null,
          description: c.description || null,
        }))
      };
    }

    if (projects && Array.isArray(projects)) {
      dataToUpdate.projects = {
        deleteMany: {},
        create: projects.map((p: any) => ({
          title: p.title,
          description: p.description || null,
          url: p.url || null,
          imageUrl: p.imageUrl || null,
          technologies: p.technologies || [],
          role: p.role || null,
          startDate: p.startDate || null,
          endDate: p.endDate || null,
        }))
      };
    }

    if (achievements && Array.isArray(achievements)) {
      dataToUpdate.achievements = {
        deleteMany: {},
        create: achievements.map((a: any) => ({
          title: a.title,
          description: a.description || null,
          date: a.date || null,
          type: a.type || 'recognition',
        }))
      };
    }

    const updated = await prisma.alumniProfile.update({
      where: { userId },
      data: dataToUpdate,
      include: {
        experiences: { orderBy: { startDate: 'desc' } },
        department: true,
        certifications: true,
        projects: true,
        achievements: true,
      },
    });
    return this.enrichProfileData(updated);
  }
}
