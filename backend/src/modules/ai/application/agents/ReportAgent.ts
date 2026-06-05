import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class ReportAgent {
  static async execute(reportType: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Academic Report AI Agent. Your role is to generate professional, well-structured, and comprehensive reports based on database context.
Supported Report Types:
- EXECUTIVE: Consolidates employment, departments, curriculum relevance, and employer satisfaction.
- TRACER: Analyzes tracer survey response rates, participation rates, and longitudinal survey results.
- ACCREDITATION: Outlines tracer outcomes, employment rates, and quality of hands-on training to meet ETA standards.
- CURRICULUM: Outlines skill gaps, emerging technical demands, and concrete course recommendations.
- EMPLOYER: Summarizes hiring patterns, demand forecasting, and company feedback.
- DEPARTMENT: Benchmarks department outcomes, average salaries, and cgpas.

Always write in a highly professional, academic format. Do NOT make up raw numbers; rely strictly on the provided database context. Output structured markdown.`;

    const prompt = `DATABASE CONTEXT:
${context}

REPORT TYPE REQUESTED:
${reportType.toUpperCase()} REPORT

Generate a structured academic report containing an Executive Summary, Detailed Outcomes Section, and actionable Recommendations.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
