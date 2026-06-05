export class SurveyQuestion {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly sectionId: string | null,
    public readonly questionText: string,
    public readonly questionType: string,
    public readonly required: boolean,
    public readonly placeholder: string | null,
    public readonly helpText: string | null,
    public readonly validationRules: any,
    public readonly options: string[],
    public readonly order: number
  ) {}
}

export class SurveySection {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly order: number,
    public readonly questions?: SurveyQuestion[]
  ) {}
}

export class Survey {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly type: string,
    public readonly milestoneMonths: number | null,
    public readonly isActive: boolean,
    public readonly isArchived: boolean,
    public readonly sections?: SurveySection[],
    public readonly questions?: SurveyQuestion[]
  ) {}
}

export class SurveyAnswer {
  constructor(
    public readonly id: string,
    public readonly responseId: string,
    public readonly questionId: string,
    public readonly answerText: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}

export class SurveyResponse {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly alumniId: string,
    public readonly assignmentId: string | null,
    public readonly answers?: SurveyAnswer[],
    public readonly isDraft?: boolean,
    public readonly submittedAt?: Date | null,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export class SurveyAssignment {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly alumniId: string,
    public readonly status: string,
    public readonly assignedAt: Date,
    public readonly dueDate: Date,
    public readonly completedAt: Date | null,
    public readonly sevenDayReminderSent: boolean,
    public readonly threeDayReminderSent: boolean,
    public readonly overdueReminderSent: boolean,
    public readonly responseId: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly survey?: Survey
  ) {}
}
