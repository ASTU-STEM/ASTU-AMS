import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert International Scholarship & Grant AI Strategy Agent powered by LangChain & LangGraph. Provide guidance for DAAD, Erasmus Mundus, Chevening, Fulbright, KAIST, and research funding calls for ASTU alumni.`;

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

export const scholarshipAgents: ToolAgent[] = [
  buildAgent('masters-scholarship-finder', "Master's Scholarship Finder Agent", 'scholarships', (inp, prof) =>
    `Find top 4 fully-funded Master's scholarships in Europe, Asia, and North America for ASTU ${prof?.department?.name} graduates with CGPA ${prof?.cgpa}.`
  ),
  buildAgent('phd-fellowship-finder', 'PhD Fellowship Finder Agent', 'scholarships', (inp, prof) =>
    `Identify PhD research fellowship opportunities and funded doctoral positions in engineering/applied sciences.`
  ),
  buildAgent('research-grant-proposal-builder', 'Research Grant Proposal Agent', 'scholarships', (inp, prof) =>
    `Outline a competitive research grant proposal for topic: ${inp.topic || 'Solar Microgrid Optimization in Rural Ethiopia'}.`
  ),
  buildAgent('daad-erasmus-application-prep', 'DAAD & Erasmus Application Prep Agent', 'scholarships', (inp, prof) =>
    `Provide application guide and essay frameworks for DAAD and Erasmus Mundus scholarship calls.`
  ),
  buildAgent('fulbright-chevening-essay-assistant', 'Fulbright & Chevening Essay Agent', 'scholarships', (inp, prof) =>
    `Structure leadership and networking essays for Chevening / Fulbright scholarship applications.`
  ),
  buildAgent('financial-need-statement-builder', 'Financial Need Statement Agent', 'scholarships', (inp, prof) =>
    `Write a compelling Financial Need Statement explaining foreign exchange & economic context in Ethiopia.`
  ),
  buildAgent('scholarship-interview-prep', 'Scholarship Interview Prep Agent', 'scholarships', (inp, prof) =>
    `Provide top 5 scholarship panel interview questions with ideal candidate response structures.`
  ),
  buildAgent('academic-portfolio-auditor', 'Academic Portfolio Auditor Agent', 'scholarships', (inp, prof) =>
    `Audit candidate academic credentials (CGPA ${prof?.cgpa}, projects, publications) to assess scholarship competitiveness.`
  ),
  buildAgent('publication-citation-log', 'Publication & Citation Log Agent', 'scholarships', (inp, prof) =>
    `Format capstone research paper into IEEE / APA citation format for academic applications.`
  ),
  buildAgent('study-abroad-budget-calculator', 'Study Abroad Budget Calculator Agent', 'scholarships', (inp, prof) =>
    `Calculate initial relocation and living expense budget needed for studying in Germany/Europe (Block Account, Visa, Flight).`
  )
];
