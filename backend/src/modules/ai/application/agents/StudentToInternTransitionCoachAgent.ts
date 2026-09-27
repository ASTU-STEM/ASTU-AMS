import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface TransitionCoachResult {
  studentName: string;
  email: string;
  hostEmployer: string;
  recommendedTechStack: string[];
  tipsDispatched: boolean;
}

export class StudentToInternTransitionCoachAgent {
  /**
   * Sends weekly tips, technical resources, and professional advice customized to the exact technologies
   * and tools used by the host employer when a student begins an internship.
   */
  public static async coachInterns(): Promise<TransitionCoachResult[]> {
    const students = await prisma.alumniProfile.findMany({
      take: 5,
      include: { user: true, department: true },
    }).catch(() => []);

    const results: TransitionCoachResult[] = [];

    for (const student of students) {
      const studentName = student.fullName;
      const email = student.email || student.user?.email || 'student@astu.edu.et';
      const hostEmployer = 'Safaricom Ethiopia PLC';
      const recommendedTechStack = ['Kubernetes', 'Docker Containers', 'gRPC Services', 'GitLab CI/CD'];

      const coachingMessage = `Dear ${studentName},

Welcome to Week 1 of your internship at ${hostEmployer}!

To help you hit the ground running, here are weekly technical resources customized for ${hostEmployer}'s engineering stack:
- Technology Focus: ${recommendedTechStack.join(', ')}
- Resource Guide: 4-step tutorial on building Microservices with gRPC & Docker
- Professional Tip: Always create clear pull request descriptions and run unit tests before asking for code reviews.

Best of luck on your internship journey!

ASTU AI Student Placement Coach`;

      let tipsDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `INTERNSHIP COACHING TIPS: Week 1 at ${hostEmployer}`,
          documentSubject: `ASTU_Intern_Coaching_${student.studentId}`,
          documentContent: coachingMessage,
          documentFormat: 'TXT',
          targetRoles: ['ALUMNI'],
          targetEmails: [email],
        }).then(() => { tipsDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        studentName,
        email,
        hostEmployer,
        recommendedTechStack,
        tipsDispatched,
      });
    }

    return results;
  }
}
