export interface Survey {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS';
  completedAt?: string;
  type: '6-Month' | '12-Month' | '24-Month' | 'Custom';
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'select' | 'text' | 'rating' | 'checkbox' | 'date';
  options?: string[];
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export interface SurveyResponse {
  id: number;
  surveyId: number;
  respondentId: string;
  answers: Record<string, any>;
  submittedAt: string;
}

export interface SurveyFilters {
  type?: '6-Month' | '12-Month' | '24-Month' | 'Custom' | 'All';
  status?: 'PENDING' | 'COMPLETED' | 'IN_PROGRESS' | 'All';
  search?: string;
}

export interface SurveyStats {
  totalSurveys: number;
  pendingSurveys: number;
  completedSurveys: number;
  completionRate: number;
  averageCompletionTime: string; // e.g., "2 days 3 hours"
}