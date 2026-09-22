import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class DepartmentAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Departmental Analytics & Benchmarking Agent. Your role is to compare academic engineering programs, evaluate employability scores, analyze average starting salaries per department, and benchmark program performance.
Rely strictly on provided database context. Output clean Markdown comparisons.
CRITICAL RULE: NEVER output template placeholders or bracketed variables like [Count], [Number], or [Insert value]. ALWAYS output exact real figures and department metrics.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a structured departmental benchmark analysis with exact real numbers. Do NOT use bracket placeholders.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
