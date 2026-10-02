import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Productivity & Focus AI Optimization Agent powered by LangChain & LangGraph. Provide Eisenhower matrix task prioritization, time blocking schedules, OKR framework design, and meeting note summaries.`;

const buildAgent = (id: string, name: string, category: string, promptBuilder: (inp: any, prof: any) => string): ToolAgent => ({
  id,
  name,
  category,
  async execute(inputs, profile): Promise<ToolAgentResult> {
    const pipeline = createLangGraphAgentPipeline(id, name, sysInstruction, promptBuilder);
    const res: any = await pipeline.invoke({ inputs, profile });
    return {
      text: typeof res?.resultText === 'string' ? res.resultText : String(res?.resultText || ''),
      summary: typeof res?.resultSummary === 'string' ? res.resultSummary : String(res?.resultSummary || ''),
      agentId: id,
      agentName: name,
      timestamp: new Date().toLocaleString(),
      engine: 'LangGraph / LangChain StateGraph'
    };
  }
});

export const productivityAgents: ToolAgent[] = [
  buildAgent('task-prioritizer-matrix', 'Eisenhower Task Prioritizer Agent', 'productivity', (inp, prof) =>
    `Classify tasks (${inp.tasks || 'Finish ASTU report, study React, reply emails'}) into Eisenhower Matrix (Do, Schedule, Delegate, Delete).`
  ),
  buildAgent('weekly-time-blocking-planner', 'Weekly Time-Blocking Planner Agent', 'productivity', (inp, prof) =>
    `Generate a weekly 40-hour time-blocking schedule balancing deep engineering work, meetings, and learning.`
  ),
  buildAgent('pomodoro-timer', 'Pomodoro Focus Session Agent', 'productivity', (inp, prof) =>
    `Outline a 4-cycle Pomodoro focus plan with specific break goals for studying or coding.`
  ),
  buildAgent('daily-habit-tracker', 'Daily Micro-Habit Tracker Agent', 'productivity', (inp, prof) =>
    `Design a 30-day habit tracking grid focusing on 3 high-impact daily engineering & wellness habits.`
  ),
  buildAgent('project-task-estimator', 'Project Task Estimator Agent', 'productivity', (inp, prof) =>
    `Break down feature "${inp.featureName || 'Authentication & User Roles'}" into subtasks with realistic hour estimates.`
  ),
  buildAgent('meeting-notes-action-item-summary', 'Meeting Notes & Action Summary Agent', 'productivity', (inp, prof) =>
    `Summarize raw meeting text into Key Decisions, Action Items, Owners, and Deadlines.`
  ),
  buildAgent('distraction-focus-auditor', 'Distraction Audit & Focus Score Agent', 'productivity', (inp, prof) =>
    `Audit daily work interruptions (social media, notifications, unplanned calls) and calculate Focus Efficiency Score.`
  ),
  buildAgent('okr-goal-setting-framework', 'OKR Goal Setting Framework Agent', 'productivity', (inp, prof) =>
    `Formulate 1 quarterly Objective and 3 measurable Key Results (OKRs) for an ASTU graduate's career growth.`
  ),
  buildAgent('burnout-self-audit', 'Burnout & Work-Life Balance Audit Agent', 'productivity', (inp, prof) =>
    `Provide a 5-question work-life balance audit and recovery recommendations for engineers under high workload.`
  ),
  buildAgent('end-of-day-work-log', 'End-of-Day Work Log Agent', 'productivity', (inp, prof) =>
    `Generate a 2-minute daily reflection work log template covering Accomplishments, Blockers, and Tomorrow's Top 3 Goals.`
  )
];
