import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU Academic & Postgraduate AI Strategy Agent powered by LangChain & LangGraph. Focus on Master's/PhD SOPs, academic research proposals, ECTS transcript conversions, recommendation letters, and global university admissions.`;

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

export const academicAgents: ToolAgent[] = [
  buildAgent('statement-of-purpose-builder', 'Statement of Purpose (SOP) Builder Agent', 'academic', (inp, prof) =>
    `Applicant: ${prof?.fullName}, Target Program: ${inp.fieldOfStudy || 'M.Sc. Computer Science'}, ASTU Thesis: ${inp.astuThesis || 'Senior Capstone Project'}\nWrite a structured 5-paragraph SOP.`
  ),
  buildAgent('research-proposal-outline-builder', 'Research Proposal Outline Agent', 'academic', (inp, prof) =>
    `Generate a research proposal outline (Title, Abstract, Background, Methodology, Expected Output) for topic: ${inp.topic || 'Renewable Energy Systems in Ethiopia'}.`
  ),
  buildAgent('academic-cv-builder', 'Academic CV Builder Agent', 'academic', (inp, prof) =>
    `Generate an Academic CV highlighting ASTU coursework, CGPA ${prof?.cgpa}, lab research, capstone project, and teaching/lab assistant experience.`
  ),
  buildAgent('scholarship-motivation-letter-builder', 'Scholarship Motivation Letter Agent', 'academic', (inp, prof) =>
    `Write a scholarship motivation letter for ${inp.scholarshipName || 'DAAD / Erasmus Mundus'} connecting ASTU degree to home country development in Ethiopia.`
  ),
  buildAgent('faculty-recommendation-request', 'Faculty Recommendation Request Agent', 'academic', (inp, prof) =>
    `Write a polite formal request to an ASTU faculty professor asking for a letter of recommendation for postgraduate studies.`
  ),
  buildAgent('gre-toefl-ielts-prep-planner', 'GRE/TOEFL/IELTS Prep Planner Agent', 'academic', (inp, prof) =>
    `Build a 12-week study schedule for GRE/IELTS exam preparation for an ASTU engineering graduate.`
  ),
  buildAgent('grade-converter', 'Academic Grade & ECTS Converter Agent', 'academic', (inp, prof) =>
    `Convert ASTU CGPA ${prof?.cgpa} to European ECTS grade (A-F), US 4.0 scale, and percentage equivalent.`
  ),
  buildAgent('supervisor-cold-email-builder', 'Supervisor Cold Email Agent', 'academic', (inp, prof) =>
    `Write a concise cold email to a university professor abroad requesting M.Sc. / PhD thesis supervision and research assistantship.`
  ),
  buildAgent('conference-abstract-generator', 'Conference Abstract Generator Agent', 'academic', (inp, prof) =>
    `Generate a 250-word academic paper abstract based on senior project topic: ${inp.projectTitle || 'Optimized Microgrid Control System'}.`
  ),
  buildAgent('postgrad-application-checklist', 'Postgrad Application Checklist Agent', 'academic', (inp, prof) =>
    `Build a step-by-step master checklist for applying to top European and North American universities from Ethiopia.`
  )
];
