import prisma from '../../../../core/config/db';

export class GetSidebarStats {
  async execute(adminUserId?: string) {
    // 1. User Management (Pending Verifications)
    const pendingAlumni = await prisma.alumniProfile.count({ where: { isVerified: false } });
    const pendingEmployers = await prisma.employerProfile.count({ where: { isVerified: false } });
    const pendingVerifications = pendingAlumni + pendingEmployers;

    // 2. Survey Management (Active Surveys)
    const activeSurveys = await prisma.survey.count({ where: { isActive: true, isArchived: false } });

    // 3. Jobs Management (Active Job Posts)
    const activeJobs = await prisma.job.count({ where: { status: 'PUBLISHED', isActive: true } });

    // 4. Notifications (Unread)
    // If we have an admin userId, we count their unread notifications. Otherwise, just generic total unread.
    let unreadNotifications = 0;
    if (adminUserId) {
      unreadNotifications = await prisma.notification.count({ where: { userId: adminUserId, isRead: false } });
    } else {
      unreadNotifications = await prisma.notification.count({ where: { isRead: false } });
    }

    // 5. Support Desk (Open / in-progress tickets)
    const openSupportTickets = await prisma.supportTicket.count({
      where: {
        status: { in: ['OPEN', 'IN_PROGRESS', 'PENDING_ICT_ADMIN'] },
      },
    });

    return {
      pendingVerifications,
      activeSurveys,
      activeJobs,
      unreadNotifications,
      openSupportTickets,
    };
  }
}
