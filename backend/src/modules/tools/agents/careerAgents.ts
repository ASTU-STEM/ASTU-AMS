import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU Career Strategy AI Agent powered by LangChain & LangGraph. Provide clear, professional, structured Markdown guidance for ASTU engineering & science graduates in Ethiopia.`;

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

export const careerAgents: ToolAgent[] = [
  buildAgent('career-goal-builder', 'Career Goal Builder Agent', 'career', (inp, prof) => {
    const name = prof?.fullName || 'ASTU Candidate';
    const dept = prof?.department?.name || 'Software Engineering';
    const cgpa = prof?.cgpa || '3.85';
    const target1 = inp.targetRole1Yr || inp.targetRole || 'Junior Full-Stack Software Engineer';
    const target3 = inp.targetRole3Yr || 'Senior Tech Lead / System Architect';
    const salary = inp.targetSalary || '45,000 ETB / month';
    const skills = inp.keySkills || (prof?.skills || []).join(', ') || 'React, Python, System Architecture, PostgreSQL';
    const sector = inp.targetEmployerType || 'Ethiopian Tech & Telecom (Ethio Telecom, Safaricom, CBE)';

    return `You are the ASTU Career Goal Builder AI Agent powered by LangChain & LangGraph.
Candidate: ${name} (Department: ${dept}, CGPA: ${cgpa})
1-Year Target Role: ${target1}
3-Year Target Role / Leadership Vision: ${target3}
Target Salary / Compensation Benchmark: ${salary}
Primary Technical Skills to Acquire: ${skills}
Target Employer Sector: ${sector}

Generate a comprehensive, structured Markdown Career Goal Blueprint covering:
1. Executive Summary & Trajectory Analysis for ${dept}
2. 1-Year Milestone Action Plan (Quarter-by-Quarter Targets)
3. 3-Year Technical Leadership Blueprint
4. Required Competencies, Frameworks & Certification Plan
5. Top Employers in Ethiopia & Global Remote Opportunities
6. Action Checklist & ASTU Alumni Portal Integration Recommendations`;
  }),

  buildAgent('career-roadmap-generator', 'Career Roadmap Generator Agent', 'career', (inp, prof) => {
    const name = prof?.fullName || 'ASTU Candidate';
    const dept = prof?.department?.name || 'Software Engineering';
    const current = inp.currentRole || `ASTU ${dept} Graduate`;
    const target = inp.targetRole || 'Senior Cloud Engineer / Architect';
    const timeframe = inp.timeframe === '1y' ? '1 Year (4 Quarters)' : inp.timeframe === '3y' ? '3 Years (12 Quarters)' : '2 Years (8 Quarters)';
    const focus = inp.primaryFocus || (prof?.skills || []).join(', ') || 'Full-Stack Development, Cloud Infrastructure, Microservices';

    return `You are the ASTU Career Roadmap Generator AI Agent powered by LangChain & LangGraph.
Candidate: ${name}
Current Position: ${current}
Target Destination Role: ${target}
Progression Timeframe: ${timeframe}
Technical Focus Stack: ${focus}

Generate a step-by-step quarterly progression blueprint:
1. Career Progression Roadmap Overview
2. Quarter 1 (Months 1–3): Core Foundation & Specialized Skill Acquisition
3. Quarter 2 (Months 4–6): Technical Project Portfolio & System Engineering
4. Quarter 3 (Months 7–9): Industry Placement, Production Deliverables & Mid-Level Milestone
5. Quarter 4 (Months 10–12): Technical Leadership, Team Mentorship & Promotion Escalation
6. Key Recommended Projects, Certifications & ASTU Mentorship Strategy`;
  }),

  buildAgent('career-path-explorer', 'Career Path Explorer Agent', 'career', (inp, prof) => {
    const name = prof?.fullName || 'ASTU Candidate';
    const dept = inp.department || prof?.department?.name || 'Software Engineering';
    const sector = inp.industrySector || 'all';
    const level = inp.experienceLevel || 'entry_mid';

    return `You are the ASTU Career Path Explorer AI Agent powered by LangChain & LangGraph.
Candidate: ${name}
ASTU Department Chapter: ${dept}
Industry Sector Preference: ${sector}
Target Career Level: ${level}

Conduct a data-backed career path exploration for ASTU ${dept} graduates in Ethiopia and internationally:
1. Department Career Market Overview (${dept})
2. Career Pathway 1: Core Technical Engineering (Role Title, Salary Range ETB/USD, Key Employers in Ethiopia, High-Demand Skills)
3. Career Pathway 2: High-Growth Tech & AI / Fintech Specialization (Role Title, Compensation, Employers, Tech Stack)
4. Career Pathway 3: Systems Architecture / Management / Global Remote (Role Title, Compensation, Employers, Tech Stack)
5. Actionable Steps for ASTU Graduates to Enter Each Pathway`;
  }),

  buildAgent('career-skills-gap-checker', 'Career Skills Gap Checker Agent', 'career', (inp, prof) => {
    const name = prof?.fullName || 'ASTU Candidate';
    const dept = prof?.department?.name || 'Software Engineering';
    const targetRole = inp.targetRole || 'Senior Software Engineer / System Architect';
    const verifiedSkills = (prof?.skills && prof.skills.length > 0) ? prof.skills : ['React', 'Python', 'Node.js', 'PostgreSQL', 'System Architecture'];
    const customSkills = inp.customSkills ? `, ${inp.customSkills}` : '';
    const companyType = inp.targetCompanyType || 'ethiopia_top';

    return `You are the ASTU Career Skills Gap Checker AI Agent powered by LangChain & LangGraph.
Candidate: ${name} (${dept})
Target Position / Role: ${targetRole}
Verified ASTU Candidate Skills: ${verifiedSkills.join(', ')}${customSkills}
Target Employer Environment: ${companyType}

Provide an empirical skill match audit:
1. Candidate Skill Match Audit & Calculated Overall Score % (e.g. 84% Match Score)
2. Verified Acquired Strengths (Matching Candidate Competencies)
3. Identified Missing Skill Gaps (Critical employer requirements)
4. 90-Day Actionable Skill Acquisition Plan (Month 1 Foundation, Month 2 Deep-Dive, Month 3 Mastery)
5. Recommended ASTU Capstone Projects & ASTU Alumni Mentors`;
  }),

  buildAgent('personal-development-plan', 'Personal Development Plan Agent', 'career', (inp, prof) =>
    `Create a 30/60/90-day Personal Development Plan (PDP) for career acceleration of an ASTU graduate.`
  ),
  buildAgent('career-change-planner', 'Career Change Planner Agent', 'career', (inp, prof) =>
    `Transition Strategy: Move from ${prof?.department?.name} into ${inp.targetRole || 'Data Science / Management'}. Provide bridge project plan.`
  ),
  buildAgent('career-mentorship-prep', 'Career Mentorship Prep Agent', 'career', (inp, prof) =>
    `Generate 5 strategic mentorship questions and an outreach agenda for connecting with senior ASTU alumni.`
  ),
  buildAgent('first-year-work-plan', 'First Year Work Plan Agent', 'career', (inp, prof) =>
    `Build a 12-month workplace orientation plan to maximize performance, build influence, and earn early promotions.`
  ),
  buildAgent('target-employer-research', 'Target Employer Research Agent', 'career', (inp, prof) =>
    `Analyze top employers in Ethiopia (Ethio Telecom, Safaricom, Banks, Tech Hubs) for ASTU ${prof?.department?.name} graduates.`
  ),
  buildAgent('portfolio-project-planner', 'Portfolio Project Planner Agent', 'career', (inp, prof) =>
    `Outline 2 production-ready capstone portfolio projects that showcase empirical engineering mastery for ${prof?.department?.name}.`
  )
];
