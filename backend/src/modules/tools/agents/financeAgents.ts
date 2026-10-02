import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Personal Finance & Financial Planning AI Agent powered by LangChain & LangGraph for Ethiopian professionals. Provide ETB budgetary allocations, loan amortization breakdowns, inflation protection strategies, Equb planning, and savings benchmarks.`;

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

export const financeAgents: ToolAgent[] = [
  buildAgent('salary-budget-planner', '50/30/20 Salary Budget Allocator Agent', 'finance', (inp, prof) =>
    `Divide monthly net income of ETB ${inp.netIncome || 18000} into Needs (50%), Wants (30%), and Savings (20%). Provide itemized ETB breakdown.`
  ),
  buildAgent('debt-payoff-calculator', 'Debt Repayment Payoff Agent', 'finance', (inp, prof) =>
    `Calculate debt payoff roadmap for total outstanding debt of ETB ${inp.totalDebt || 35000} using Avalanche vs Snowball methods.`
  ),
  buildAgent('emergency-fund-calculator', 'Emergency Fund Calculator Agent', 'finance', (inp, prof) =>
    `Calculate emergency reserve cushion needed for monthly essential expenses of ETB ${inp.essentialExpenses || 12000} across 6 months.`
  ),
  buildAgent('savings-goal-calculator', 'Savings Goal Calculator Agent', 'finance', (inp, prof) =>
    `Calculate monthly savings required to reach ETB ${inp.targetAmount || 60000} target in ${inp.targetMonths || 12} months.`
  ),
  buildAgent('loan-payment-calculator', 'Loan EMI Payment Agent', 'finance', (inp, prof) =>
    `Calculate monthly EMI, total interest, and total repayment for bank loan principal ETB ${inp.principal || 100000} at ${inp.annualRate || 14.5}% interest over ${inp.tenureYears || 3} years.`
  ),
  buildAgent('inflation-purchasing-power', 'Inflation Purchasing Power Agent', 'finance', (inp, prof) =>
    `Calculate real purchasing power loss over 3 years assuming ${inp.inflationRate || 25}% annual inflation rate in Ethiopia.`
  ),
  buildAgent('bank-interest-rate-comparator', 'Ethiopian Bank Interest Rate Agent', 'finance', (inp, prof) =>
    `Compare savings and fixed deposit interest rates across CBE, Awash, Dashen, and Bank of Abyssinia.`
  ),
  buildAgent('equb-contribution-planner', 'Equb Contribution & Payout Agent', 'finance', (inp, prof) =>
    `Calculate monthly contribution needed for an Equb round targeting ETB ${inp.equbPayoutTarget || 50000} payout over 10 members.`
  ),
  buildAgent('fx-remittance-valuation', 'FX Remittance Valuation Agent', 'finance', (inp, prof) =>
    `Calculate ETB valuation for USD $${inp.usdAmount || 500} remittance under National Bank of Ethiopia (NBE) floating exchange system.`
  ),
  buildAgent('personal-expense-tracker', 'Personal Expense Tracker Agent', 'finance', (inp, prof) =>
    `Generate a monthly expense tracking template categorizing rent, food, transport, data, and social expenses in ETB.`
  )
];
