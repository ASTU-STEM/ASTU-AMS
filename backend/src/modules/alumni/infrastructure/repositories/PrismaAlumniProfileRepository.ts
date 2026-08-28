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
    const resolvedSalary = hiredApp?.job?.salary || currentExp?.salaryRange || (data.salary ? `${data.salary} ETB` : (isHired ? 'Competitive Salary' : 'Seeking Opportunities'));

    return {
      ...data,
      company: resolvedCompany,
      currentRole: resolvedRole,
      salaryRange: resolvedSalary,
      employmentStatus: isHired ? 'EMPLOYED' : data.employmentStatus,
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
      department, experiences, resume, studentId, batch, cgpa,
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
      'twitterUrl', 'employmentStatus', 'salary', 'gender',
    ]);

    // Copy only allowed scalars from `rest`
    for (const key of Object.keys(rest)) {
      if (ALLOWED_SCALARS.has(key)) {
        dataToUpdate[key] = rest[key];
      }
    }

    // Map frontend names to schema names
    if (avatarUrl !== undefined)    dataToUpdate.profilePicture = avatarUrl;
    if (updateData.profilePicture !== undefined) dataToUpdate.profilePicture = updateData.profilePicture;
    if (linkedInUrl !== undefined)  dataToUpdate.linkedIn = linkedInUrl;
    if (gitHubUrl !== undefined)    dataToUpdate.gitHub = gitHubUrl;
    if (portfolioUrl !== undefined) dataToUpdate.portfolio = portfolioUrl;
    if (twitterUrl !== undefined)   dataToUpdate.twitterUrl = twitterUrl;
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
          credentialUrl: c.credentialUrl || null,
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
      },
    });
    return this.enrichProfileData(updated);
  }
}
