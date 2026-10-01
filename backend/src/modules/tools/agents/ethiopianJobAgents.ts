import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Ethiopian Labor Market & Career Advisory AI Agent powered by LangChain & LangGraph. Focus on Ethiopian labor proclamations (1156/2019), ETB pay scales, Ethio Telecom, Safaricom, banks, NGOs, and regional cost-of-living realities.`;

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

export const ethiopianJobAgents: ToolAgent[] = [
  buildAgent('salary-after-living-costs-calculator', 'Ethiopian Tax & Net Take-Home Agent', 'ethiopia_jobs', (inp, prof) =>
    `Calculate Ethiopian PAYE tax and 7% pension breakdown for Gross Salary of ETB ${inp.grossSalary || 20000}. Provide net take-home and budget advice.`
  ),
  buildAgent('addis-vs-regional-salary-comparison', 'Addis vs Regional Salary Comparison Agent', 'ethiopia_jobs', (inp, prof) =>
    `Compare disposable income between Addis Ababa (Salary: ${inp.addisSalary || 25000} ETB) vs Regional City (Adama/Hawassa, Salary: ${inp.regionalSalary || 20000} ETB).`
  ),
  buildAgent('relocation-cost-calculator', 'Relocation & Housing Cost Agent', 'ethiopia_jobs', (inp, prof) =>
    `Estimate total relocation budget needed to move to Addis Ababa (Rent advance deposit, transport, household essentials).`
  ),
  buildAgent('public-vs-private-vs-remote-comparison', 'Public vs Private vs Remote Employer Agent', 'ethiopia_jobs', (inp, prof) =>
    `Compare career growth, job security, and compensation between Ethiopian Civil Service, Private Corporations, and Foreign Remote Work for ASTU graduates.`
  ),
  buildAgent('job-scam-risk-checker', 'Job Scam Risk Auditor Agent', 'ethiopia_jobs', (inp, prof) =>
    `Audit job offer details (Money requested: ${inp.askedMoney}, Official email: ${inp.officialEmail}) against Ethiopian labor laws to flag scam risks.`
  ),
  buildAgent('ethio-telecom-safaricom-roadmap', 'Ethio Telecom & Safaricom Career Roadmap Agent', 'ethiopia_jobs', (inp, prof) =>
    `Provide career roadmap for joining Ethio Telecom or Safaricom Ethiopia in engineering/tech roles for ASTU ${prof?.department?.name} graduate.`
  ),
  buildAgent('banking-sector-job-prep', 'Banking Sector Job Prep Agent', 'ethiopia_jobs', (inp, prof) =>
    `Provide preparation guide for Ethiopian commercial bank IT/Engineering exams (CBE, Awash, Dashen, Hibret).`
  ),
  buildAgent('ngo-un-application-assistant', 'NGO & UN Application Assistant Agent', 'ethiopia_jobs', (inp, prof) =>
    `Provide application strategies for International NGOs (UN, GIZ, USAID partners) operating in Ethiopia for ASTU graduates.`
  ),
  buildAgent('civil-service-scale-auditor', 'Civil Service Scale Auditor Agent', 'ethiopia_jobs', (inp, prof) =>
    `Explain Ethiopian public sector civil service salary grades (P1-P8 scales) and allowance structures for engineering degrees.`
  ),
  buildAgent('freelance-vs-fulltime-income', 'Freelance vs Full-Time Income Agent', 'ethiopia_jobs', (inp, prof) =>
    `Compare stability, tax liabilities, and earnings potential of local Ethiopian full-time employment vs international USD freelancing.`
  )
];
