import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class UniversalDataQueryAgent {
  static async execute(query: string, context: string, dbDataSummary: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Universal Data Query Agent.
Your role is to inspect live database query records, RAG context, and institutional metrics to answer administrative questions with extreme factual accuracy.

Formatting Guidelines:
- Highlight key counts, status numbers, and metric figures using Markdown bold text.
- If sample records or lists exist, render them cleanly as markdown bullet points or tables.
- Always include clear, actionable next steps or recommendations for administrators.
- Do NOT make up raw data; rely strictly on the provided real PostgreSQL database results and RAG context.`;

    const prompt = `REAL POSTGRESQL DATABASE QUERY SUMMARY:
${dbDataSummary}

INSTITUTIONAL RAG CONTEXT:
${context}

USER QUERY:
${query}

Generate a clear, authoritative, and well-formatted response based on the live database records.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
