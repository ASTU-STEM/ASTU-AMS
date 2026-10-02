import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Engineering Leadership & Project Management AI Advisory Agent powered by LangChain & LangGraph. Provide 1-on-1 agendas, sprint planning frameworks, risk assessment matrices, retrospective logs, and stakeholder reports.`;

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

export const managementAgents: ToolAgent[] = [
  buildAgent('one-on-one-meeting-agenda', '1-on-1 Meeting Agenda Agent', 'management', (inp, prof) =>
    `Generate a 30-minute 1-on-1 meeting agenda (Wins, Workload, Career Growth, Action Items) for an engineering manager.`
  ),
  buildAgent('project-scope-brief', 'Project Scope Brief Agent', 'management', (inp, prof) =>
    `Create a Project Scope Brief (Problem Statement, Objectives, In-Scope vs Out-of-Scope, Milestones, Risks).`
  ),
  buildAgent('sprint-planning-allocator', 'Sprint Planning Allocator Agent', 'management', (inp, prof) =>
    `Formulate 2-week sprint capacity allocation for a team of 4 engineers with story point estimates.`
  ),
  buildAgent('team-performance-feedback', 'Team Performance Feedback Agent', 'management', (inp, prof) =>
    `Format constructive performance feedback using SBI (Situation, Behavior, Impact) framework.`
  ),
  buildAgent('conflict-resolution-guide', 'Conflict Resolution Guide Agent', 'management', (inp, prof) =>
    `Provide a step-by-step discussion script for resolving technical architecture disagreements between senior developers.`
  ),
  buildAgent('delegated-task-tracker', 'Delegated Task Tracker Agent', 'management', (inp, prof) =>
    `Build a task delegation tracking framework detailing Task, Assignee, Expected Quality Standard, Check-in Date, and Outcome.`
  ),
  buildAgent('risk-assessment-matrix', 'Risk Assessment Matrix Agent', 'management', (inp, prof) =>
    `Generate a project risk assessment matrix (Technical, Schedule, Budget, Dependency) with Risk Score and Mitigation Plan.`
  ),
  buildAgent('post-mortem-retrospective-log', 'Post-Mortem Retrospective Log Agent', 'management', (inp, prof) =>
    `Format sprint retrospective log (What Went Well, What Could Improve, Action Items for Next Sprint).`
  ),
  buildAgent('stakeholder-status-report', 'Stakeholder Status Report Agent', 'management', (inp, prof) =>
    `Write an executive 1-page weekly status report (Overall Health, Major Milestones Delivered, Key Risks, Next Steps).`
  ),
  buildAgent('onboarding-checklist-generator', 'Onboarding Checklist Generator Agent', 'management', (inp, prof) =>
    `Generate a 30-day new developer onboarding checklist (System Access, Codebase Walkthrough, First PR, Buddy Mentor).`
  )
];
