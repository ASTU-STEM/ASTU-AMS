import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class EmploymentAgent {
  static async execute(query: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Employment AI Agent. Your role is to analyze graduate employment trends, rates, salaries, and time-to-hire.
Always base your responses on the provided database context.
Do NOT calculate raw metrics yourself. Highlight insights, summarize outcomes, and make predictions based on graduation year patterns.
Write in a professional, consulting tone. Use bullet points where appropriate.`;

    const prompt = `DATABASE CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
