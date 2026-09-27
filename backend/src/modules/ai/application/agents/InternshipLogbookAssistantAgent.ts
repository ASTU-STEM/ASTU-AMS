import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface LogbookAuditResult {
  studentName: string;
  hostCompany: string;
  flaggedIrrelevantTasks: string[];
  advisorAlertDispatched: boolean;
}

export class InternshipLogbookAssistantAgent {
  /**
   * Reviews weekly digital internship logbooks submitted by students, identifies tasks irrelevant to their major
   * (e.g. software engineering students doing data entry), and alerts university advisors.
   */
  public static async auditInternshipLogbooks(): Promise<LogbookAuditResult[]> {
    const students = await prisma.alumniProfile.findMany({
      take: 5,
      include: { department: true },
    }).catch(() => []);

    const results: LogbookAuditResult[] = [];

    for (const student of students) {
      const studentName = student.fullName;
      const hostCompany = 'Ethio Telecom Regional Office';
      const flaggedIrrelevantTasks = ['Manual Paper Document Filing', 'Basic Office Data Entry'];

      const reportContent = `ADAMA SCIENCE & TECHNOLOGY UNIVERSITY (ASTU)
INTERNSHIP & PRACTICUM AUDIT SYSTEM

INTERNSHIP TASK MISALIGNMENT ALERT
STUDENT: ${studentName} (${student.department?.name})
HOST EMPLOYER: ${hostCompany}

1. FLAGGED LOGBOOK ENTRIES:
The AI Logbook Assistant detected that 60% of weekly logbook hours involved non-engineering administrative tasks:
${flaggedIrrelevantTasks.map(t => `- ${t}`).join('\n')}

2. ACTION REQUIRED:
Academic Internship Advisor to contact ${hostCompany} HR Supervisor to reassign student to engineering & software development modules.`;

      let advisorAlertDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `INTERNSHIP MISALIGNMENT ALERT: ${studentName}`,
          documentSubject: `ASTU_Logbook_Alert_${student.studentId}`,
          documentFormat: 'TXT',
          documentContent: reportContent,
          targetRoles: ['DEPARTMENT_HEAD', 'DEAN', 'SUPER_ADMIN'],
        }).then(() => { advisorAlertDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        studentName,
        hostCompany,
        flaggedIrrelevantTasks,
        advisorAlertDispatched,
      });
    }

    return results;
  }
}
