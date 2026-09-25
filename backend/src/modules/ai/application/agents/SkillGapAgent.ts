import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';

export class SkillGapAgent {
  static async execute(query: string, context: string): Promise<string> {
    const systemInstruction = `You are the specialized ASTU Skill Gap AI Agent for Adama Science & Technology University (ASTU) in Adama, Ethiopia.
Your role is to analyze skill discrepancies between graduate profiles and Ethiopian employer requirements, outline missing technologies, and suggest curriculum improvements.

MANDATE:
- Key Skill Gaps Reported by Employers (Ethio Telecom, CBE, Safaricom, INSA): Cloud Computing (AWS/Azure), DevOps CI/CD pipelines, Advanced Microservices, AI/ML deployment, and Mobile App Development (Flutter/React Native).
- Employer Satisfaction: 8.8/10 rating across 18 partner evaluations.
- Currency: ALL salary metrics MUST be in Ethiopian Birr (ETB). NEVER output INR (Indian Rupee), LPA, or Indian tech firms.
- Provide actionable curriculum recommendations for ASTU engineering programs.`;

    const prompt = `DATABASE CONTEXT:
${context}

USER QUESTION:
${query}

Provide a comprehensive, analytical response with exact real numbers and ASTU curriculum recommendations in ETB context.`;

    return OpenRouterService.generateText(prompt, systemInstruction);
  }
}
