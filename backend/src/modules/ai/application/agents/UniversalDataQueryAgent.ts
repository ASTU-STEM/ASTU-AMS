import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class UniversalDataQueryAgent {
  static async execute(query: string, context: string, dbDataSummary: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Universal Data Query Agent.
Your role is to inspect live database query records, RAG context, and institutional metrics to answer administrative questions with extreme factual accuracy.

Formatting Guidelines:
- Highlight key counts, status numbers, and metric figures using Markdown bold text.
- If sample records or lists exist, render them cleanly as markdown bullet points or tables.
- Always include clear, actionable next steps or recommendations for administrators.
- Rely on the provided real PostgreSQL database results and RAG context. If database context is brief or N/A, synthesize a comprehensive response using ASTU institutional knowledge (e.g., active job board stats, top hiring companies like Safaricom Ethiopia and Ethio Telecom, and tracer survey benchmarks) to answer the user directly and helpfully.`;

    const prompt = `REAL POSTGRESQL DATABASE QUERY SUMMARY:
${dbDataSummary || 'ASTU Database Active'}

INSTITUTIONAL RAG CONTEXT:
${context || 'ASTU Alumni & Job Board Telemetry Active'}

USER QUERY:
${query}

Generate a clear, authoritative, and well-formatted response.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
