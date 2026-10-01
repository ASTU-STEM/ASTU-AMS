import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU Alumni Portal & Network AI Agent powered by LangChain & LangGraph. Provide guidance for ASTU graduate verified profiles, tracer study compliance, registrar document audits, mentor matching, alumni chapter networking, and campus engagement.`;

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

export const alumniAgents: ToolAgent[] = [
  buildAgent('profile-strength-checker', 'ASTU Profile Strength Auditor Agent', 'alumni', (inp, prof) =>
    `Audit ASTU alumni profile completion (Name, Email, CGPA ${prof?.cgpa}, Skills, CV link) and calculate profile strength score.`
  ),
  buildAgent('portfolio-audit', 'ASTU Project & Certificate Verification Agent', 'alumni', (inp, prof) =>
    `Audit candidate project links and certificates for registrar and employer verification.`
  ),
  buildAgent('tracer-study-completion-checker', 'Tracer Survey Compliance Agent', 'alumni', (inp, prof) =>
    `Check compliance status for mandatory 6-month, 12-month, and 24-month ASTU Tracer Surveys.`
  ),
  buildAgent('document-readiness-checker', 'Registrar Document Request Audit Agent', 'alumni', (inp, prof) =>
    `Audit readiness for Official Transcript, Degree Certificate, English Medium of Instruction Letter, and Digital Alumni ID.`
  ),
  buildAgent('alumni-opportunity-matcher', 'Alumni Job & Project Matcher Agent', 'alumni', (inp, prof) =>
    `Match candidate skills (${(prof?.skills || []).join(', ')}) with ASTU exclusive alumni job calls and corporate postings.`
  ),
  buildAgent('mentor-match-assistant', 'ASTU Alumni Mentor Matcher Agent', 'alumni', (inp, prof) =>
    `Match graduate (${prof?.department?.name}) with senior ASTU alumni mentors in Ethiopian tech/engineering firms.`
  ),
  buildAgent('alumni-networking-planner', 'Batch & Department Outreach Agent', 'alumni', (inp, prof) =>
    `Plan outreach campaign to connect with classmates from ASTU graduation year ${prof?.graduationYear || '2024'} and ${prof?.department?.name}.`
  ),
  buildAgent('alumni-event-planner', 'ASTU Event Attendance Planner Agent', 'alumni', (inp, prof) =>
    `Generate attendance plan for upcoming ASTU reunions, career fairs, and department webinars.`
  ),
  buildAgent('alumni-contribution-tracker', 'Alumni Giving & Volunteer Log Agent', 'alumni', (inp, prof) =>
    `Track mentorship hours, guest lectures, student donations, and campus contributions for ASTU alumnus.`
  ),
  buildAgent('alumni-directory-search-assistant', 'ASTU Alumni Directory Search Agent', 'alumni', (inp, prof) =>
    `Provide directory search filters to find ASTU alumni by company, specialization, and graduation year.`
  ),
  buildAgent('chapter-leader-blueprint', 'ASTU Chapter Leader Blueprint Agent', 'alumni', (inp, prof) =>
    `Provide operational guide for organizing regional ASTU Alumni Chapters in Addis Ababa, Adama, or abroad.`
  ),
  buildAgent('startup-endorsement-request', 'ASTU Startup Endorsement Request Agent', 'alumni', (inp, prof) =>
    `Draft formal request for ASTU Innovation Center & Alumni Association startup endorsement letter.`
  ),
  buildAgent('lab-collaboration-finder', 'ASTU Research Lab Collaboration Agent', 'alumni', (inp, prof) =>
    `Connect alumni industry R&D teams with ASTU specialized engineering research laboratories.`
  ),
  buildAgent('campus-career-fair-prep', 'Campus Career Fair Prep Agent', 'alumni', (inp, prof) =>
    `Build career fair preparation guide for ASTU graduates meeting corporate employers on campus.`
  ),
  buildAgent('milestone-announcement-builder', 'Career Milestone Announcement Agent', 'alumni', (inp, prof) =>
    `Write a professional announcement post for celebrating job promotion, certification, or startup launch with ASTU community.`
  )
];
