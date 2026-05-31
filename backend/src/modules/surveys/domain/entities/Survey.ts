export class SurveyQuestion {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly questionText: string,
    public readonly questionType: string,
    public readonly options: string[],
    public readonly order: number
  ) {}
}

export class Survey {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly type: string,
    public readonly isActive: boolean,
    public readonly questions?: SurveyQuestion[]
  ) {}
}

export class SurveyAnswer {
  constructor(
    public readonly id: string,
    public readonly responseId: string,
    public readonly questionId: string,
    public readonly answerText: string
  ) {}
}

export class SurveyResponse {
  constructor(
    public readonly id: string,
    public readonly surveyId: string,
    public readonly alumniId: string,
    public readonly submittedAt: Date,
    public readonly answers?: SurveyAnswer[]
  ) {}
}
