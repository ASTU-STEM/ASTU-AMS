import prisma from '../../../../core/config/db';
import { JobStatus, ApplicationStatus } from '@prisma/client';
import { NotificationDispatcher } from '../../../notifications/application/services/NotificationDispatcher';

export class ManageJobs {
  async getJobs(params: {
    page?: number;
    limit?: number;
    query?: string;
    status?: JobStatus;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.query) {
      where.OR = [
        { title: { contains: params.query, mode: 'insensitive' } },
        { employer: { companyName: { contains: params.query, mode: 'insensitive' } } },
      ];
    }

    if (params.status && (params.status as string) !== 'All') {
      where.status = params.status as JobStatus;
    }

    const [jobs, total, totalApps, activeCount, closedCount, draftCount] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
      prisma.jobApplication.count().catch(() => 0),
      prisma.job.count({
        where: { status: JobStatus.PUBLISHED }
      }).catch(() => 0),
      prisma.job.count({
        where: { status: JobStatus.CLOSED }
      }).catch(() => 0),
      prisma.job.count({ where: { status: JobStatus.DRAFT } }).catch(() => 0),
    ]);

    const totalInSystem = await prisma.job.count().catch(() => total);

    return {
      jobs: jobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        employer: job.employer?.companyName || 'Corporate Employer',
        type: job.employmentType || 'FULL_TIME',
        postedDate: job.createdAt,
        deadline: job.deadline ? job.deadline.toISOString().split('T')[0] : 'Open',
        applicants: job._count?.applications || 0,
        status: job.status,
      })),
      total: totalInSystem || total,
      page,
      limit,
      stats: {
        totalJobs: totalInSystem || total || jobs.length,
        totalApplications: totalApps,
        activeJobs: activeCount,
        closedJobs: closedCount,
        draftJobs: draftCount,
      }
    };
  }

  async getApplications(params: {
    page?: number;
    limit?: number;
    query?: string;
    status?: string;
  }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 100;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.query) {
      where.OR = [
        { job: { title: { contains: params.query, mode: 'insensitive' } } },
        { job: { employer: { companyName: { contains: params.query, mode: 'insensitive' } } } },
        { alumni: { fullName: { contains: params.query, mode: 'insensitive' } } },
        { alumni: { email: { contains: params.query, mode: 'insensitive' } } },
      ];
    }

    if (params.status && params.status !== 'All') {
      where.status = params.status as ApplicationStatus;
    }

    const [apps, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        include: {
          job: {
            include: { employer: true }
          },
          alumni: {
            include: { user: true }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.jobApplication.count({ where }),
    ]);

    return {
      applications: apps.map((app: any) => {
        const companyName = app.job?.employer?.companyName || 'Corporate Partner';
        const isSelfPosted = companyName.toLowerCase().includes('astu') ||
                             companyName.toLowerCase().includes('adama science') ||
                             companyName.toLowerCase().includes('university') ||
                             companyName.toLowerCase().includes('super admin');
        return {
          id: app.id,
          applicant: app.alumni?.fullName || app.alumni?.user?.fullName || 'ASTU Graduate Candidate',
          email: app.alumni?.user?.email || app.alumni?.email || 'alumni@astu.edu.et',
          phone: app.alumni?.user?.phone || app.alumni?.phone || '+251 900 000 000',
          department: app.alumni?.department || app.job?.department || 'Software Engineering / Computer Science',
          graduationYear: app.alumni?.graduationYear || '2024',
          cgpa: app.alumni?.cgpa ? String(app.alumni.cgpa) : '3.75',
          skills: app.alumni?.skills || ['TypeScript', 'Node.js', 'React', 'Database Systems'],
          bio: app.alumni?.bio || '',
          coverLetter: app.coverLetter || app.alumni?.bio || 'I am writing to express my strong interest in this position at ASTU. With my academic background and practical project experience, I am confident in contributing effectively to the team.',
          resumeUrl: app.resumeUrl || app.alumni?.resumeUrl || null,
          linkedIn: app.alumni?.linkedIn || null,
          gitHub: app.alumni?.gitHub || null,
          portfolio: app.alumni?.portfolio || null,
          jobTitle: app.job?.title || 'Position',
          employer: companyName,
          appliedDate: app.createdAt ? new Date(app.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          status: app.status,
          isSelfPosted,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getJobAnalytics() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();

    const [allJobs, allApps, topEmployers] = await Promise.all([
      prisma.job.findMany({
        select: { id: true, createdAt: true, status: true, employer: { select: { companyName: true } } }
      }),
      prisma.jobApplication.findMany({
        select: { id: true, status: true, createdAt: true }
      }),
      prisma.employerProfile.findMany({
        select: {
          companyName: true,
          _count: { select: { jobs: true } }
        },
        orderBy: {
          jobs: { _count: 'desc' }
        },
        take: 10
      })
    ]);

    // 1. Calculate jobs posted per month (exact last 6 calendar months based on year & month)
    const monthList: { label: string; year: number; monthIndex: number; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthList.push({
        label: months[d.getMonth()],
        year: d.getFullYear(),
        monthIndex: d.getMonth(),
        count: 0
      });
    }

    allJobs.forEach(job => {
      if (job.createdAt) {
        const jDate = new Date(job.createdAt);
        const jYear = jDate.getFullYear();
        const jMonth = jDate.getMonth();
        const target = monthList.find(m => m.year === jYear && m.monthIndex === jMonth);
        if (target) {
          target.count += 1;
        }
      }
    });

    const jobsPostedData = monthList.map(m => ({
      month: m.label,
      jobs: m.count
    }));

    // 2. Calculate Application Funnel from real DB applications
    const postedCount = allJobs.length;
    const appliedCount = allApps.length;
    const shortlistedCount = allApps.filter(a =>
      a.status === 'SHORTLISTED' ||
      a.status === 'INTERVIEW_SCHEDULED' ||
      a.status === 'REVIEWED' ||
      a.status === 'OFFERED' ||
      a.status === 'HIRED' ||
      a.status === 'ACCEPTED'
    ).length;
    const hiredCount = allApps.filter(a => a.status === 'HIRED' || a.status === 'ACCEPTED').length;

    const funnelData = [
      { name: 'Posted', value: postedCount },
      { name: 'Applied', value: appliedCount },
      { name: 'Shortlisted', value: shortlistedCount },
      { name: 'Hired', value: hiredCount },
    ];

    // 3. Calculate Top Employers by Job Postings dynamically from real jobs in DB
    const exactCompanyCounts: Record<string, number> = {};
    allJobs.forEach(job => {
      let cName = job.employer?.companyName || 'ASTU University';
      if (cName.toLowerCase().includes('insa')) {
        cName = 'INSA Corporation';
      }
      exactCompanyCounts[cName] = (exactCompanyCounts[cName] || 0) + 1;
    });

    topEmployers.forEach(emp => {
      let empName = emp.companyName;
      if (empName && empName.toLowerCase().includes('insa')) {
        empName = 'INSA Corporation';
      }
      if (empName && exactCompanyCounts[empName] === undefined) {
        exactCompanyCounts[empName] = emp._count?.jobs || 0;
      }
    });

    const employerPosts = Object.entries(exactCompanyCounts)
      .map(([name, jobs]) => ({ name, jobs }))
      .sort((a, b) => b.jobs - a.jobs)
      .slice(0, 6);

    // 4. Calculate Detailed Hired Alumni Placement Breakdown (Platform Job Board vs External System & ASTU vs External Employers)
    const [hiredApps, employedAlumni] = await Promise.all([
      prisma.jobApplication.findMany({
        where: { status: { in: ['HIRED', 'ACCEPTED'] } },
        include: { job: { include: { employer: true } }, alumni: true }
      }),
      prisma.alumniProfile.findMany({
        where: { employmentStatus: { in: ['EMPLOYED', 'SELF_EMPLOYED'] } },
        select: { id: true }
      })
    ]);

    const isSelfPosted = (cName?: string) => {
      const emp = (cName || '').toLowerCase();
      return emp.includes('astu') || emp.includes('adama science') || emp.includes('university') || emp.includes('super admin');
    };

    const jobBoardHiredCount = hiredApps.length;
    const astuJobBoardHiredCount = hiredApps.filter(a => isSelfPosted(a.job?.employer?.companyName)).length;
    const externalJobBoardHiredCount = hiredApps.filter(a => !isSelfPosted(a.job?.employer?.companyName)).length;

    const totalEmployedCount = employedAlumni.length;
    const nonJobBoardHiredCount = Math.max(0, totalEmployedCount - jobBoardHiredCount);

    const totalAstuHiredCount = astuJobBoardHiredCount;
    const totalExternalHiredCount = externalJobBoardHiredCount + nonJobBoardHiredCount;

    const hiredAnalytics = {
      totalHired: Math.max(totalEmployedCount, jobBoardHiredCount),
      jobBoardHired: jobBoardHiredCount,
      nonJobBoardHired: nonJobBoardHiredCount,
      astuHired: totalAstuHiredCount,
      externalHired: totalExternalHiredCount,
      astuJobBoardHired: astuJobBoardHiredCount,
      externalJobBoardHired: externalJobBoardHiredCount,
      hiredChannelData: [
        { name: 'System Job Board Hired', value: jobBoardHiredCount, fill: '#003580' },
        { name: 'External / Direct Hired', value: nonJobBoardHiredCount, fill: '#1D9E75' },
      ],
      hiredEmployerData: [
        { name: 'External Corporate Hires', value: totalExternalHiredCount, fill: '#E8A020' },
        { name: 'University (ASTU) Hires', value: totalAstuHiredCount, fill: '#003580' },
      ]
    };

    return {
      jobsPostedData,
      funnelData,
      employerPosts,
      hiredAnalytics
    };
  }

  async updateJobStatus(id: string, status: JobStatus) {
    const job = await prisma.job.update({
      where: { id },
      data: { status },
      include: { employer: true }
    });

    if (status === 'PUBLISHED') {
      const dispatcher = new NotificationDispatcher();
      await dispatcher.broadcastJobAlert(job.title, job.employer?.companyName || 'ASTU University', job.id).catch(console.error);
    }

    return job;
  }

  async createJob(data: {
    title: string;
    employer?: string;
    type?: string;
    deadline?: string;
    description?: string;
    location?: string;
    salary?: string;
  }) {
    const employerName = data.employer?.trim() || 'ASTU University (Super Admin)';

    // Find or pick matching employer profile
    let employer = await prisma.employerProfile.findFirst({
      where: { companyName: { contains: employerName, mode: 'insensitive' } }
    });

    if (!employer) {
      // Find admin user to attach profile
      const adminUser = await prisma.user.findFirst({
        where: { OR: [{ role: 'SUPER_ADMIN' as any }, { role: 'ADMIN' as any }] }
      });

      if (adminUser) {
        employer = await prisma.employerProfile.create({
          data: {
            userId: adminUser.id,
            companyName: employerName,
            industry: 'Higher Education & Technical Research',
            location: 'Adama, Ethiopia (ASTU Main Campus)',
            hrContact: adminUser.email || 'admin@astu.edu.et',
            isVerified: true,
            description: 'ASTU University Official Placement & Academic Openings'
          }
        }).catch(async () => {
          return await prisma.employerProfile.findFirst();
        });
      }
    }

    if (!employer) {
      employer = await prisma.employerProfile.findFirst();
    }

    if (!employer) {
      throw new Error('No employer profile found in database to assign this job listing.');
    }

    const createdJob = await prisma.job.create({
      data: {
        title: data.title,
        employerId: employer.id,
        employmentType: data.type === 'INTERNSHIP' ? 'INTERNSHIP' : data.type === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME',
        description: data.description || `${data.title} position posted by ${employerName}.`,
        location: data.location || 'Adama, Ethiopia (ASTU Main Campus)',
        salary: data.salary || 'Competitive / Scale',
        deadline: data.deadline ? new Date(data.deadline) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'PUBLISHED',
      },
      include: {
        employer: true,
        _count: { select: { applications: true } }
      }
    });

    // Notify matching alumni via email & in-app alerts
    const dispatcher = new NotificationDispatcher();
    await dispatcher.broadcastJobAlert(createdJob.title, createdJob.employer.companyName, createdJob.id).catch(console.error);

    return {
      id: createdJob.id,
      title: createdJob.title,
      employer: createdJob.employer.companyName,
      type: createdJob.employmentType,
      postedDate: createdJob.createdAt,
      deadline: createdJob.deadline.toISOString().split('T')[0],
      applicants: 0,
      status: createdJob.status,
    };
  }

  async updateJobDetails(id: string, data: any) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.type) updateData.employmentType = data.type === 'INTERNSHIP' ? 'INTERNSHIP' : data.type === 'PART_TIME' ? 'PART_TIME' : 'FULL_TIME';
    if (data.location) updateData.location = data.location;
    if (data.salary) updateData.salary = data.salary;
    if (data.deadline) updateData.deadline = new Date(data.deadline);
    if (data.description) updateData.description = data.description;

    const job = await prisma.job.update({
      where: { id },
      data: updateData,
      include: { employer: true }
    });

    return job;
  }

  async deleteJob(id: string) {
    await prisma.jobApplication.deleteMany({ where: { jobId: id } }).catch(() => {});
    const job = await prisma.job.delete({ where: { id } });
    return job;
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus) {
    const app = await prisma.jobApplication.findUnique({
      where: { id },
      include: { job: { include: { employer: true } } }
    });

    if (!app) throw new Error('Application not found');

    const companyName = app.job?.employer?.companyName || '';
    const isSelfPosted = companyName.toLowerCase().includes('astu') ||
                         companyName.toLowerCase().includes('adama science') ||
                         companyName.toLowerCase().includes('university') ||
                         companyName.toLowerCase().includes('super admin');

    if (!isSelfPosted) {
      throw new Error('Super Admin can only manage applications for university / self-posted jobs.');
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: { status },
      include: { job: true, alumni: true },
    });
    return updated;
  }

  async bulkUpdateApplicationStatus(ids: string[], status: ApplicationStatus) {
    const eligibleApps = await prisma.jobApplication.findMany({
      where: {
        id: { in: ids },
        job: {
          employer: {
            OR: [
              { companyName: { contains: 'ASTU', mode: 'insensitive' } },
              { companyName: { contains: 'University', mode: 'insensitive' } },
              { companyName: { contains: 'Adama Science', mode: 'insensitive' } },
              { companyName: { contains: 'Super Admin', mode: 'insensitive' } },
            ]
          }
        }
      },
      select: { id: true }
    });

    const eligibleIds = eligibleApps.map(a => a.id);

    if (eligibleIds.length === 0) {
      throw new Error('None of the selected applications belong to ASTU / Super Admin posted jobs.');
    }

    const updated = await prisma.jobApplication.updateMany({
      where: { id: { in: eligibleIds } },
      data: { status },
    });
    return updated;
  }
}

