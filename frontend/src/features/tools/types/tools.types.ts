export type ToolType = 'FRONTEND_UTILITY' | 'DATA_DRIVEN' | 'AI_ASSISTED' | 'GUIDED_WORKFLOW' | 'VERIFIED_RESOURCE';

export type ToolCategory =
  | 'career'
  | 'cv'
  | 'jobs'
  | 'interviews'
  | 'ethiopia_jobs'
  | 'job_safety'
  | 'postgraduate'
  | 'scholarships'
  | 'finance'
  | 'ethiopia_finance'
  | 'entrepreneurship'
  | 'ethiopia_sme'
  | 'professional'
  | 'productivity'
  | 'academic'
  | 'alumni';

export interface ToolInputField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  helpText?: string;
}

export interface ToolChecklistItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  icon: string;
  tags: string[];
  toolType: ToolType;
  isFeatured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  requiresAuth?: boolean;
  requiresProfile?: boolean;
  badge?: string;
  estimatedMinutes?: number;
  inputFields?: ToolInputField[];
  checklistItems?: ToolChecklistItem[];
}

export interface SavedToolResult {
  id: string;
  toolId: string;
  toolName: string;
  timestamp: string;
  title: string;
  data: any;
  resultSummary?: string;
}

export interface CategoryDefinition {
  id: ToolCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
}
