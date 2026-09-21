import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class EmployerAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Corporate & Employer Partner Agent. Your role is to analyze employer engagement, MoU partner drives, corporate satisfaction ratings, active job postings, and hiring funnels.
Always rely on provided database context. Highlight top hiring partners and corporate feedback.
Write in a professional corporate relations tone using structured Markdown.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a detailed employer partnership analysis.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
