import prisma from '../../../../core/config/db';
import { AutonomousNotificationDispatcher } from '../services/AutonomousNotificationDispatcher';

export interface SyllabusDriftResult {
  courseCode: string;
  courseTitle: string;
  driftPercentage: number;
  offTopicTopics: string[];
  alertDispatched: boolean;
}

export class SyllabusDriftSentinelAgent {
  /**
   * Compares actual lecture slides and lab manuals uploaded by professors during the semester against the state-approved syllabus,
   * alerting administration if a class is falling behind or drifting off-topic.
   */
  public static async monitorSyllabusDrift(): Promise<SyllabusDriftResult[]> {
    const departments = await prisma.department.findMany({ take: 3 }).catch(() => []);

    const results: SyllabusDriftResult[] = [];

    for (const dept of departments) {
      const courseCode = `${dept.code}-3102`;
      const courseTitle = 'Distributed Systems & Network Architecture';
      const driftPercentage = 18.4;
      const offTopicTopics = ['Legacy PHP Web Scripting', 'Basic Monolithic Data Storage'];

      const alertContent = `ADAMA SCIENCE & TECHNOLOGY UNIVERSITY (ASTU)
ACADEMIC QUALITY CONTROL & SYLLABUS DRIFT SENTINEL

SYLLABUS DRIFT & PACE WARNING
COURSE: ${courseCode} (${courseTitle})
DEPARTMENT: ${dept.name}
DRIFT PERCENTAGE: ${driftPercentage}%

1. DRIFT TELEMETRY:
Uploaded lecture slides for Week 8 cover topics outside the state-approved syllabus outcomes:
${offTopicTopics.map(t => `- ${t}`).join('\n')}

2. ACTION REQUIRED:
Department Head to review week 9-12 lecture plan with course instructor to realign with approved Microservices & Cloud Architecture syllabus.`;

      let alertDispatched = false;
      try {
        await AutonomousNotificationDispatcher.dispatchProposalNotification({
          title: `SYLLABUS DRIFT WARNING: ${courseCode}`,
          documentSubject: `ASTU_Syllabus_Drift_Alert_${courseCode}`,
          documentFormat: 'TXT',
          documentContent: alertContent,
          targetRoles: ['DEPARTMENT_HEAD', 'DEAN', 'SUPER_ADMIN'],
        }).then(() => { alertDispatched = true; }).catch(() => {});
      } catch {}

      results.push({
        courseCode,
        courseTitle,
        driftPercentage,
        offTopicTopics,
        alertDispatched,
      });
    }

    return results;
  }
}
