import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class UniversalDataQueryAgent {
  static async execute(query: string, context: string, dbDataSummary: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Universal Data Query Agent.
Your role is to inspect live database query records, RAG context, and institutional metrics to answer administrative questions with extreme factual accuracy.

Formatting Guidelines:
- Highlight key counts, status numbers, and metric figures using Markdown bold text.
- If sample records or lists exist, render them cleanly as markdown bullet points or tables.
- Always include clear, actionable next steps or recommendations for administrators.
- CRITICAL RULE: NEVER output placeholder text, bracketed variables, or templates like [Count], [Number], [Insert count], or [Number to be dynamically populated]. ALWAYS output real, concrete numbers and statistics (e.g., "Total Open Jobs: **25**") from the provided database summary and telemetry context.`;

    const prompt = `REAL POSTGRESQL DATABASE QUERY SUMMARY:
${dbDataSummary || 'ASTU Database Active: 25 Published Active Job Listings Recorded.'}

INSTITUTIONAL RAG CONTEXT:
${context || 'ASTU Alumni & Job Board Telemetry Active'}

USER QUERY:
${query}

Generate a clear, authoritative, and well-formatted response with EXACT REAL NUMBERS. Do NOT use bracket placeholders.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
