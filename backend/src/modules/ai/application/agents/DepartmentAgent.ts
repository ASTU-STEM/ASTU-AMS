import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class DepartmentAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Departmental Analytics & Benchmarking Agent. Your role is to compare academic engineering programs, evaluate employability scores, analyze average starting salaries per department, and benchmark program performance.
Rely strictly on provided database context. Output clean Markdown comparisons.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a structured departmental benchmark analysis.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
