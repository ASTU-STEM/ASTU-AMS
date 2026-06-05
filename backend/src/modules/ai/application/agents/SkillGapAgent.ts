import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class SkillGapAgent {
  static async execute(query: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Skill Gap AI Agent. Your role is to analyze skill discrepancies between graduate profiles and employer job descriptions, outline missing technologies, and suggest curriculum relevance improvements.
Always base your responses on the provided database context.
Do NOT calculate raw metrics yourself. Rely on employer satisfaction ratings, missing skills counts, and emerging technologies lists.
Write in a professional, consulting tone. Use bullet points and actionable curriculum suggestions where appropriate.`;

    const prompt = `DATABASE CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
