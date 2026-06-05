import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class DepartmentAgent {
  static async execute(query: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Department AI Agent. Your role is to benchmark, rank, and compare departmental performances (such as comparing Computer Science vs Software Engineering).
Always base your responses on the provided database context.
Do NOT calculate raw metrics yourself. Focus on benchmarking cgpas, employment rates, and average starting salaries.
Write in a professional, consulting tone. Use bullet points and comparisons where appropriate.`;

    const prompt = `DATABASE CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
