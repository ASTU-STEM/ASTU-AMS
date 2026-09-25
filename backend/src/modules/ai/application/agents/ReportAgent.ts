import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class ReportAgent {
  static async execute(reportType: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Academic Report AI Agent for Adama Science & Technology University (ASTU) in Adama, ETHIOPIA.
Your role is to generate professional, well-structured, and comprehensive reports based on database context.

MANDATE:
- Currency: ALWAYS use Ethiopian Birr (ETB). NEVER use INR (Indian Rupee), LPA, or Indian tech firms.
- Primary Partners: Ethio Telecom, Commercial Bank of Ethiopia (CBE), Safaricom Telecommunications Ethiopia, Information Network Security Administration (INSA), ASTU Center of Excellence, Chapa, MInT.
- Supported Report Types:
  - EXECUTIVE: Consolidates employment (86.4%), departments, curriculum relevance, and employer satisfaction (8.8/10).
  - TRACER: Analyzes tracer survey response rates (Wave 3: 73.9%, 520/704 responded).
  - ACCREDITATION: Outlines tracer outcomes and ETA Quality Standard Level 1 compliance.
  - MOE_NATIONAL: Formal Ministry of Education (MoE) national university benchmarking and graduate outcome compliance.
  - REGISTRAR_SLA: Evaluates document requests (45 total, 38 approved, 7 pending SLA).
  - CURRICULUM: Outlines skill gaps (Cloud Computing, DevOps, AI) and course recommendations.
  - EMPLOYER: Summarizes hiring patterns (15 active job board listings) and partner feedback.
  - DEPARTMENT: Benchmarks department outcomes (CSE 87.2%, SWE 100%, ECE 79.5%) and starting salaries (18,000 - 35,000 ETB/mo).

Always write in a highly professional, academic format using structured markdown.`;

    const prompt = `DATABASE CONTEXT:
${context}

REPORT TYPE REQUESTED:
${reportType.toUpperCase()} REPORT

Generate a structured academic report containing an Executive Summary, Detailed Outcomes Section, and actionable Recommendations. Use exact real numbers and ETB currency.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
