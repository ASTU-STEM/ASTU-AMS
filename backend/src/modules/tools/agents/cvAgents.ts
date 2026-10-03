import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU CV & Resume AI Specialist Agent powered by LangChain & LangGraph. Provide ATS-compliant, bulleted, quantified Markdown output for engineering candidates in Ethiopia and global markets.`;

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

export const cvAgents: ToolAgent[] = [
  buildAgent('cv-builder', 'ASTU Professional CV Builder Agent', 'cv', (inp, prof) =>
    `Candidate: ${prof?.fullName}, Dept: ${prof?.department?.name}, CGPA: ${prof?.cgpa}\nTarget Role: ${inp.targetRole || 'Engineer'}\nGenerate a complete ATS-compliant ASTU CV in Markdown format.`
  ),
  buildAgent('cv-achievement-converter', 'CV Achievement Bullet Converter Agent', 'cv', (inp, prof) =>
    `Convert duty "${inp.duty || 'Worked on engineering project'}" into 3 high-impact quantified CV achievement bullet points.`
  ),
  buildAgent('professional-summary-generator', 'Professional Summary Generator Agent', 'cv', (inp, prof) =>
    `Generate 3 distinct 3-line CV summary variations (Executive, Technical, Action-oriented) for ASTU ${prof?.department?.name} graduate.`
  ),
  buildAgent('ats-keyword-optimizer', 'ATS Keyword Optimizer Agent', 'cv', (inp, prof) =>
    `CV: ${inp.cvText || 'Engineering candidate'}\nJob Spec: ${inp.jobDesc || 'React, SQL, Node'}\nAnalyze keyword match %, missing skills, and exact placement fixes.`
  ),
  buildAgent('cv-proofreader-auditor', 'CV Proofreader & Auditor Agent', 'cv', (inp, prof) =>
    `Audit CV text for grammar, active voice, conciseness, and ATS parsing errors.`
  ),
  buildAgent('project-experience-formatter', 'Project Experience Formatter Agent', 'cv', (inp, prof) =>
    `Format project "${inp.projectName || 'ASTU Capstone'}" into Problem, Technical Solution, Tech Stack used, and Measurable Impact.`
  ),
  buildAgent('certification-highlight-builder', 'Certification Highlight Builder Agent', 'cv', (inp, prof) =>
    `Format certifications (${inp.certs || 'ASTU Academic Distinction, AWS, Cisco'}) into a high-impact resume section.`
  ),
  buildAgent('cv-template-picker', 'CV Template Picker Agent', 'cv', (inp, prof) =>
    `Recommend optimal CV layout (Academic vs Technical vs Corporate) for Ethiopian and international applications.`
  ),
  buildAgent('technical-skills-classifier', 'Technical Skills Classifier Agent', 'cv', (inp, prof) =>
    `Group skills (${(prof?.skills || []).join(', ')}) into Languages, Engineering Tools, Databases, and Methodologies.`
  ),
  buildAgent('single-page-resume-condenser', 'Single-Page Resume Condenser Agent', 'cv', (inp, prof) =>
    `Provide precise editing guidelines to condense a 2-page CV into a crisp 1-page technical resume without losing key achievements.`
  )
];
