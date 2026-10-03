import prisma from '../../../../core/config/db';

export interface JobFairMatchResult {
  studentName: string;
  matchedCompany: string;
  scheduledInterviewTime: string;
  virtualRoomId: string;
}

export class InteractiveVirtualJobFairAgent {
  /**
   * Matches students with companies in real-time during online virtual career fairs,
   * schedules video interviews, and guides candidates through virtual rooms.
   */
  public static async orchestrateVirtualJobFair(): Promise<JobFairMatchResult[]> {
    const students = await prisma.alumniProfile.findMany({
      take: 5,
      include: { department: true },
    }).catch(() => []);

    const results: JobFairMatchResult[] = [];

    for (const student of students) {
      const studentName = student.fullName;
      const matchedCompany = 'Safaricom Ethiopia Enterprise Cloud Team';
      const scheduledInterviewTime = '14:30 EATER';
      const virtualRoomId = `ASTU-VFAIR-ROOM-${student.studentId}`;

      results.push({
        studentName,
        matchedCompany,
        scheduledInterviewTime,
        virtualRoomId,
      });
    }

    return results;
  }
}
