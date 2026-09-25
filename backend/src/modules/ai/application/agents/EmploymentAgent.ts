import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class EmploymentAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Employment & Placement Agent for Adama Science & Technology University (ASTU) in Ethiopia.
Your role is to analyze graduate employment trends, velocity rates, salary distributions, and time-to-hire metrics.

MANDATE:
- Location: ASTU, Adama, ETHIOPIA.
- Currency: ALL salary metrics MUST be in Ethiopian Birr (ETB) per month (e.g. 18,000 ETB - 35,000 ETB). NEVER output INR (Indian Rupee), LPA, or Indian tech firms.
- Key Metrics: Overall Employment Rate: 86.4%, Verified Alumni: 8, Unverified/Pending Alumni: 12, Total Recorded Alumni: 20, Active Job Openings: 15 (12 Published Openings).
- Output clean Markdown formatting with exact real numbers.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response with exact real numbers in ETB currency. Do NOT use bracket placeholders or non-Ethiopian metrics.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
