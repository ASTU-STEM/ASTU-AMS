import { ISurveyAssignmentRepository } from '../ports/ISurveyAssignmentRepository';

export class GetSurveyStatistics {
  constructor(private readonly assignmentRepo: ISurveyAssignmentRepository) {}

  async execute() {
    const assignments = await this.assignmentRepo.findAll();
    const total = assignments.length;
    const statusCounts = assignments.reduce((acc, assignment) => {
      acc[assignment.status] = (acc[assignment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const completed = statusCounts.COMPLETED || 0;
    const responseRate = total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;

    return {
      totalAssignments: total,
      statusCounts,
      responseRate,
    };
  }
}

export class GetCompletionReport {
  constructor(private readonly assignmentRepo: ISurveyAssignmentRepository) {}

  async execute() {
    const assignments = await this.assignmentRepo.findAll();
    const report = assignments.reduce((acc, assignment) => {
      const key = assignment.survey?.id ?? 'unknown';
      const entry = acc[key] ?? {
        surveyId: assignment.survey?.id ?? 'unknown',
        surveyTitle: assignment.survey?.title ?? 'Unknown Survey',
        milestoneMonths: assignment.survey?.milestoneMonths ?? null,
        totalAssigned: 0,
        completed: 0,
        overdue: 0,
        expired: 0,
      };

      entry.totalAssigned += 1;
      if (assignment.status === 'COMPLETED') entry.completed += 1;
      if (assignment.status === 'OVERDUE') entry.overdue += 1;
      if (assignment.status === 'EXPIRED') entry.expired += 1;

      acc[key] = entry;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(report).map((item) => ({
      ...item,
      completionRate: item.totalAssigned > 0 ? Number(((item.completed / item.totalAssigned) * 100).toFixed(2)) : 0,
    }));
  }
}
