import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Ethiopian Entrepreneurship & SME Business AI Advisory Agent powered by LangChain & LangGraph. Provide business plans, Ethiopian legal registration steps (Ministry of Trade & Revenue TIN), break-even analyses, tax compliance, and pitch deck outlines.`;

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

export const smeAgents: ToolAgent[] = [
  buildAgent('business-idea-generator', 'Ethiopian Business Idea Generator Agent', 'entrepreneurship', (inp, prof) =>
    `Sector: ${inp.sector || 'Agritech / Digital Tech'}\nGenerate 3 technologically feasible startup ideas addressing real Ethiopian market challenges. Include Problem, Solution, Tech Stack, and Revenue Model for each.`
  ),
  buildAgent('simple-business-plan-builder', '1-Page Business Plan Builder Agent', 'entrepreneurship', (inp, prof) =>
    `Idea: ${inp.ideaName || 'ASTU Tech Consultancy'}\nGenerate a 1-page business plan covering Executive Summary, Value Proposition, Target Segment, Operations in Ethiopia, and 3-Year Financial Goals.`
  ),
  buildAgent('ethiopian-startup-pitch-deck', 'Ethiopian Startup Pitch Deck Agent', 'entrepreneurship', (inp, prof) =>
    `Outline 10 slides for an Ethiopian startup pitch deck targeting local venture capital and bank startup loans.`
  ),
  buildAgent('break-even-calculator', 'Break-Even & Profit Margin Agent', 'entrepreneurship', (inp, prof) =>
    `Fixed Costs: ${inp.fixedCosts || 30000} ETB, Price/Unit: ${inp.pricePerUnit || 500} ETB, Cost/Unit: ${inp.costPerUnit || 200} ETB. Calculate break-even volume and revenue.`
  ),
  buildAgent('sme-legal-registration-checklist', 'SME Legal Registration Agent', 'entrepreneurship', (inp, prof) =>
    `Build step-by-step registration checklist for PLC / Sole Proprietorship at Ministry of Trade & Revenue in Ethiopia.`
  ),
  buildAgent('tax-vat-compliance-calculator', 'Tax & VAT Compliance Agent', 'entrepreneurship', (inp, prof) =>
    `Explain 15% VAT threshold (500,000 ETB turnover), 2%/3% withholding tax, and 30% corporate income tax in Ethiopia.`
  ),
  buildAgent('local-product-pricing', 'Local Product Pricing Agent', 'entrepreneurship', (inp, prof) =>
    `Formulate pricing strategy for engineering services or SaaS software targeting Ethiopian businesses.`
  ),
  buildAgent('capital-burn-rate-estimator', 'Capital & Burn Rate Estimator Agent', 'entrepreneurship', (inp, prof) =>
    `Initial Capital: ${inp.initialCapital || 150000} ETB, Monthly Expense: ${inp.monthlyBurn || 25000} ETB. Calculate runway in months and milestone requirements.`
  ),
  buildAgent('cofounder-equity-split', 'Co-Founder Equity Split Agent', 'entrepreneurship', (inp, prof) =>
    `Formulate fair co-founder equity split framework based on technical contribution, capital invested, and time commitment.`
  ),
  buildAgent('tam-market-size-estimator', 'TAM Market Size Estimator Agent', 'entrepreneurship', (inp, prof) =>
    `Estimate Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and SOM for software/engineering products in Ethiopia.`
  )
];
