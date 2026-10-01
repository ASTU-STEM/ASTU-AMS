import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Freelance & Remote Work AI Strategy Agent powered by LangChain & LangGraph. Focus on Upwork/Fiverr profiling, hourly USD/ETB rate pricing, client contract terms, project proposals, and scope creep management for ASTU tech professionals.`;

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

export const freelanceAgents: ToolAgent[] = [
  buildAgent('freelance-rate-calculator', 'Hourly Rate & Project Pricing Agent', 'freelance', (inp, prof) =>
    `Calculate target hourly USD rate ($) and ETB project pricing based on monthly net income target of ETB ${inp.targetIncome || 45000}.`
  ),
  buildAgent('service-proposal-builder', 'Professional Service Proposal Agent', 'freelance', (inp, prof) =>
    `Write a winning project proposal for client requirement: ${inp.requirement || 'Full Stack Web & Mobile Application'}. Include Scope, Deliverables, Timeline, and Pricing.`
  ),
  buildAgent('client-contract-terms-generator', 'Client Contract Terms Agent', 'freelance', (inp, prof) =>
    `Generate standard freelance contract terms (50% deposit, IP ownership transfer upon full payment, 14-day review window).`
  ),
  buildAgent('invoice-payment-request-generator', 'Invoice & Payment Request Agent', 'freelance', (inp, prof) =>
    `Generate a professional client invoice template with Bank transfer / Telebirr / Payoneer payment instructions.`
  ),
  buildAgent('upwork-fiverr-bio-builder', 'Upwork & Fiverr Profile Bio Agent', 'freelance', (inp, prof) =>
    `Write an optimized Upwork profile title, overview bio, and skill tags for ASTU ${prof?.department?.name} graduate.`
  ),
  buildAgent('freelance-portfolio-showcase', 'Portfolio Showcase Agent', 'freelance', (inp, prof) =>
    `Structure 3 freelance case study portfolio entries showing Problem, Technical Stack, and Client Result.`
  ),
  buildAgent('scope-creep-preventer', 'Scope Creep Preventer Agent', 'freelance', (inp, prof) =>
    `Write a polite email response to a client requesting extra features out of initial agreed scope, offering a change-order addendum.`
  ),
  buildAgent('freelance-tax-budget-allocator', 'Freelance Tax Budget Allocator Agent', 'freelance', (inp, prof) =>
    `Explain tax set-aside requirements (Category A/B business income tax) for Ethiopian tech freelancers.`
  ),
  buildAgent('remittance-payout-guide', 'Remittance Payout Guide Agent', 'freelance', (inp, prof) =>
    `Provide step-by-step guide for transferring USD remote earnings from Payoneer/Wise/Upwork to Ethiopian bank accounts under NBE rules.`
  ),
  buildAgent('testimonial-request-generator', 'Testimonial Request Generator Agent', 'freelance', (inp, prof) =>
    `Write a short, polite client review & testimonial request message upon successful project completion.`
  )
];
