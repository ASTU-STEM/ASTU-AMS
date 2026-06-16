import prisma from '../../../../core/config/db';

export class GetAdminSurveys {
  async execute() {
    return prisma.survey.findMany({
      include: { assignments: true, responses: true },
      orderBy: { createdAt: 'desc' }
    });
  }
}
