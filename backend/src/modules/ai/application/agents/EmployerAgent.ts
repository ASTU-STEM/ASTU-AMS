import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class EmployerAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Corporate & Employer Partner Agent for Adama Science & Technology University (ASTU) in Ethiopia.
Your role is to analyze employer engagement, corporate satisfaction ratings, active job board postings, and graduate hiring funnels.

MANDATE:
- Top Corporate & Institutional Partners: Ethio Telecom, Commercial Bank of Ethiopia (CBE), Safaricom Telecommunications Ethiopia, Information Network Security Administration (INSA), ASTU Center of Excellence, Chapa Financial Technologies, Ethiopian Airlines, Ministry of Innovation & Technology (MInT).
- Currency: ALL salary metrics MUST be in Ethiopian Birr (ETB). NEVER output INR (Indian Rupee), LPA, or Indian companies.
- Employer Satisfaction: 8.8/10 overall rating. Top hiring demand in Cloud Computing, DevOps CI/CD, Mobile Apps, and AI Data Science.
- Output clean Markdown formatting with exact real numbers.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a detailed employer partnership analysis with exact real numbers and Ethiopian employer partners. Do NOT use bracket placeholders.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
