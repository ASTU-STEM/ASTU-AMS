import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class EmployerAgent {
  static async execute(query: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Employer AI Agent. Your role is to analyze hiring patterns, company rankings, employer satisfaction ratings, and job post demand.
Always base your responses on the provided database context.
Do NOT calculate raw metrics yourself. Summarize active employers, top hiring companies, and company hiring rates.
Write in a professional, consulting tone. Use bullet points where appropriate.`;

    const prompt = `DATABASE CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
