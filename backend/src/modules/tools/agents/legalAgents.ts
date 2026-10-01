import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Ethiopian Commercial Legal & Compliance AI Advisory Agent powered by LangChain & LangGraph. Provide NDA clause breakdowns, employment contract rights under Proclamation 1156/2019, IP transfer guidelines, lease audits, and privacy compliance checklists.`;

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

export const legalAgents: ToolAgent[] = [
  buildAgent('nda-summary-checker', 'NDA Summary & Clause Checker Agent', 'legal', (inp, prof) =>
    `Audit Non-Disclosure Agreement (NDA) clauses (Confidential Information scope, Exclusions, Term length, Jurisdiction).`
  ),
  buildAgent('employment-contract-rights-checker', 'Employment Contract Rights Agent', 'legal', (inp, prof) =>
    `Analyze employment contract clause against Ethiopian Labor Proclamation 1156/2019 (Probation period, Overtime rate, Severance).`
  ),
  buildAgent('ip-transfer-checklist', 'IP Transfer & Assignment Agent', 'legal', (inp, prof) =>
    `Build Intellectual Property (IP) assignment checklist for code created during employment or university research.`
  ),
  buildAgent('vendor-service-terms-generator', 'Vendor & Contractor Terms Agent', 'legal', (inp, prof) =>
    `Outline standard Vendor Service Agreement terms (Deliverables, Payment Schedule, Termination, Liability Cap).`
  ),
  buildAgent('patent-copyright-overview', 'Patent & Copyright Overview Agent', 'legal', (inp, prof) =>
    `Explain software copyright vs patent protection procedures at Ethiopian Intellectual Property Authority (EIPA).`
  ),
  buildAgent('lease-agreement-audit', 'Business Lease Agreement Audit Agent', 'legal', (inp, prof) =>
    `Provide 5 key clauses to audit in a commercial office lease contract in Ethiopia (Rent escalation, Maintenance, Subletting).`
  ),
  buildAgent('regulatory-compliance-audit', 'Regulatory Compliance Audit Agent', 'legal', (inp, prof) =>
    `Audit compliance checklist for technology startups operating in Ethiopia (Ministry of Innovation & Technology standards).`
  ),
  buildAgent('dispute-resolution-notice', 'Dispute Resolution Notice Agent', 'legal', (inp, prof) =>
    `Draft formal breach of contract notice for overdue invoice under Ethiopian Civil Code.`
  ),
  buildAgent('data-privacy-checklist', 'Data Privacy & Protection Agent', 'legal', (inp, prof) =>
    `Build data privacy and user consent compliance checklist for web/mobile applications processing user data in Ethiopia.`
  ),
  buildAgent('company-by-laws-template', 'Company By-Laws Template Agent', 'legal', (inp, prof) =>
    `Outline Memorandum & Articles of Association key clauses for a new private limited company (PLC) in Ethiopia.`
  )
];
