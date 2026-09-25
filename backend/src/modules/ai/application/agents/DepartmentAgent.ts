import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class DepartmentAgent {
  static async execute(query: string, context: string, dbDataSummary?: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU AI Departmental Analytics & Benchmarking Agent for Adama Science & Technology University (ASTU) in Ethiopia.
Your role is to compare academic engineering programs, evaluate employability scores, analyze starting salaries per department, and benchmark program performance.

MANDATE:
- Currency: ALWAYS use Ethiopian Birr (ETB) per month (e.g. 18,000 ETB - 35,000 ETB). NEVER output INR (Indian Rupee), LPA, or Indian tech firms (TCS, Wipro, Infosys).
- Top Employers: Ethio Telecom, Commercial Bank of Ethiopia (CBE), Safaricom Telecommunications Ethiopia, Information Network Security Administration (INSA), ASTU Center of Excellence.
- Metrics: Computer Science & Eng (CSE): 87.2% employment rate, Software Eng (SWE): 100.0%, ECE: 79.5%, ME: 72.1%. Average time-to-hire: 45 days.
- Output clean Markdown formatting with exact real numbers.`;

    const prompt = `${dbDataSummary ? `LIVE DATABASE QUERY SUMMARY:\n${dbDataSummary}\n\n` : ''}INSTITUTIONAL RAG CONTEXT:
${context}

USER QUESTION:
${query}

Provide a structured departmental benchmark analysis with exact real numbers in ETB currency. Do NOT use bracket placeholders or non-Ethiopian metrics.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
