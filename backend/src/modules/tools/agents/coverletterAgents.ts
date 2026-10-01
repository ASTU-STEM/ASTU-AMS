import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU Outreach & Cover Letter AI Agent powered by LangChain & LangGraph. Write persuasive, professional, culture-aware communications for Ethiopian corporate & international recruiters.`;

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

export const coverletterAgents: ToolAgent[] = [
  buildAgent('cover-letter-builder', 'Smart Cover Letter Generator Agent', 'coverletter', (inp, prof) =>
    `Candidate: ${prof?.fullName}, Target Company: ${inp.companyName || 'Safaricom Ethiopia'}, Job Title: ${inp.jobTitle || 'Software Engineer'}\nWrite a complete 4-paragraph cover letter.`
  ),
  buildAgent('cold-outreach-email-generator', 'Cold Outreach Email Generator Agent', 'coverletter', (inp, prof) =>
    `Write a 150-word cold outreach email to ${inp.recipientRole || 'Engineering Lead'} at ${inp.company || 'Tech Partner'} requesting a 15-minute chat.`
  ),
  buildAgent('linkedin-connection-request-builder', 'LinkedIn Connection Request Builder Agent', 'coverletter', (inp, prof) =>
    `Write 3 concise personalized LinkedIn connection request messages (under 300 characters) for ASTU alumni networking.`
  ),
  buildAgent('follow-up-email-builder', 'Follow-Up Email Builder Agent', 'coverletter', (inp, prof) =>
    `Write a polite follow-up email after 10 days of submitting a job application.`
  ),
  buildAgent('referral-request-generator', 'Referral Request Generator Agent', 'coverletter', (inp, prof) =>
    `Write an internal employee referral request message to an ASTU graduate working at ${inp.targetCompany || 'Ethio Telecom'}.`
  ),
  buildAgent('thank-you-email-builder', 'Thank You Email Builder Agent', 'coverletter', (inp, prof) =>
    `Write a post-interview thank you email mentioning key discussion topic: ${inp.topic || 'System design and ASTU project'}.`
  ),
  buildAgent('salary-negotiation-email-generator', 'Salary Negotiation Email Generator Agent', 'coverletter', (inp, prof) =>
    `Offered: ${inp.offered || '25,000 ETB'}, Target: ${inp.target || '32,000 ETB'}. Write a persuasive salary negotiation email.`
  ),
  buildAgent('resignation-letter-builder', 'Resignation Letter Builder Agent', 'coverletter', (inp, prof) =>
    `Write a compliant, professional resignation letter under Ethiopian Labor Law (Proclamation 1156/2019) with 1 month notice.`
  ),
  buildAgent('recommendation-letter-request', 'Recommendation Letter Request Agent', 'coverletter', (inp, prof) =>
    `Write a formal email requesting an academic recommendation letter from an ASTU professor for ${inp.purpose || 'Master degree application'}.`
  ),
  buildAgent('interview-confirmation-email', 'Interview Confirmation Email Agent', 'coverletter', (inp, prof) =>
    `Write a crisp interview appointment confirmation email to HR.`
  )
];
