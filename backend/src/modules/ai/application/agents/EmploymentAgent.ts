import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class EmploymentAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Employment & Placement Agent. Your role is to analyze graduate employment trends, velocity rates, salary distributions, and time-to-hire metrics.
Always base your responses on the provided database context.
Do NOT fabricate raw metrics. Highlight insights, summarize outcomes, and provide data-driven predictions.
CRITICAL RULE: NEVER output template placeholders or bracketed variables like [Count], [Number], or [Insert value]. ALWAYS output exact real numeric figures and percentages (e.g., 86.4% employment rate).
Write in a professional executive tone using clear Markdown formatting.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response with exact real numbers. Do NOT use bracket placeholders.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
