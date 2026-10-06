import { ToolType } from '../types/tools.types';

export const TOOL_TYPE_LABELS: Record<ToolType, string> = {
  FRONTEND_UTILITY: 'Instant Utility',
  DATA_DRIVEN: 'Portal Data',
  AI_ASSISTED: 'AI Generator',
  GUIDED_WORKFLOW: 'Interactive Checklist',
  VERIFIED_RESOURCE: 'Verified Guide',
};

export const TOOL_TYPE_FILTER_LABELS: Record<ToolType, string> = {
  FRONTEND_UTILITY: 'Instant Utilities (Calculators)',
  DATA_DRIVEN: 'Portal Data Tools',
  AI_ASSISTED: 'AI Generators & Assistants',
  GUIDED_WORKFLOW: 'Interactive Checklists',
  VERIFIED_RESOURCE: 'Verified Guides',
};

export const TOOL_TYPE_BADGE: Record<
  ToolType,
  { label: string; badgeClass: string; iconName: 'bolt' | 'database' | 'psychology' | 'checklist' | 'verified' }
> = {
  FRONTEND_UTILITY: {
    label: TOOL_TYPE_LABELS.FRONTEND_UTILITY,
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    iconName: 'bolt',
  },
  DATA_DRIVEN: {
    label: TOOL_TYPE_LABELS.DATA_DRIVEN,
    badgeClass:
      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    iconName: 'database',
  },
  AI_ASSISTED: {
    label: TOOL_TYPE_LABELS.AI_ASSISTED,
    badgeClass:
      'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60',
    iconName: 'psychology',
  },
  GUIDED_WORKFLOW: {
    label: TOOL_TYPE_LABELS.GUIDED_WORKFLOW,
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    iconName: 'checklist',
  },
  VERIFIED_RESOURCE: {
    label: TOOL_TYPE_LABELS.VERIFIED_RESOURCE,
    badgeClass:
      'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/60',
    iconName: 'verified',
  },
};

export const ALL_TOOL_TYPES: ToolType[] = [
  'FRONTEND_UTILITY',
  'DATA_DRIVEN',
  'AI_ASSISTED',
  'GUIDED_WORKFLOW',
  'VERIFIED_RESOURCE',
];
