import axios from 'axios';

export class OpenRouterService {
  private static async getApiKey(): Promise<string | null> {
    try {
      const prisma = require('../../../../core/config/db').default;
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'integrations' } });
      if (setting && setting.value) {
        const val = setting.value as any;
        if (val.openRouterApiKey && val.openRouterApiKey.trim() !== '') {
          return val.openRouterApiKey.trim();
        }
      }
    } catch (_) {}
    return process.env.OPENROUTER_API_KEY || null;
  }

  private static async getModel(): Promise<string> {
    try {
      const prisma = require('../../../../core/config/db').default;
      const setting = await prisma.systemSetting.findUnique({ where: { key: 'integrations' } });
      if (setting && setting.value) {
        const val = setting.value as any;
        if (val.openRouterModel && val.openRouterModel.trim() !== '') {
          let m = val.openRouterModel.trim();
          if (m === 'deepseek/deepseek-r1:free') m = 'deepseek/deepseek-r1';
          return m;
        }
      }
    } catch (_) {}
    let envModel = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat';
    if (envModel === 'deepseek/deepseek-r1:free') envModel = 'deepseek/deepseek-r1';
    return envModel;
  }

  static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = await this.getApiKey();
    const primaryModel = await this.getModel();
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not configured. Falling back to Mock LLM response.');
      return this.generateMockResponse(prompt, systemInstruction);
    }

    const candidateModels = Array.from(new Set([
      primaryModel,
      'deepseek/deepseek-chat',
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'openai/gpt-3.5-turbo',
    ]));

    for (const currentModel of candidateModels) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: currentModel,
            max_tokens: 4000,
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'HTTP-Referer': 'https://github.com/astu-ams',
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          return response.data.choices[0].message.content;
        }
      } catch (error: any) {
        console.warn(`OpenRouter model [${currentModel}] call failed:`, error.response?.data?.error?.message || error.message);
      }
    }

    console.warn('All OpenRouter model candidates failed. Falling back to institutional mock intelligence.');
    return this.generateMockResponse(prompt, systemInstruction);
  }

  static async generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const apiKey = await this.getApiKey();
    const primaryModel = await this.getModel();
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not configured. Falling back to Mock LLM JSON response.');
      return this.generateMockJsonResponse<T>(prompt);
    }

    const candidateModels = Array.from(new Set([
      primaryModel,
      'deepseek/deepseek-chat',
      'deepseek/deepseek-r1',
      'meta-llama/llama-3.3-70b-instruct:free',
      'google/gemini-2.0-flash-exp:free',
      'openai/gpt-3.5-turbo',
    ]));

    for (const currentModel of candidateModels) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: currentModel,
            max_tokens: 4000,
            response_format: { type: 'json_object' },
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt + '\nReturn your response strictly in valid JSON format.' },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as T;
        }
      } catch (error: any) {
        console.warn(`OpenRouter JSON model [${currentModel}] call failed:`, error.response?.data?.error?.message || error.message);
      }
    }

    console.warn('All OpenRouter JSON model candidates failed. Falling back to mock JSON response.');
    return this.generateMockJsonResponse<T>(prompt);
  }

  private static generateMockResponse(prompt: string, systemInstruction?: string): string {
    const lowPrompt = prompt.toLowerCase();
    
    if (lowPrompt.includes('accreditation')) {
      return `### ASTU ACCREDITATION REPORT
      
**Overall Status**: EXCELLENT

#### Executive Summary
Adama Science and Technology University has successfully demonstrated strong alignment with national education standards. Graduate tracer survey data indicates high quality training and favorable employability outcomes.

#### Core Outcomes
- Overall Employment Rate: 80.0%
- Curriculum Relevance: High Relevance (85.0%)
- Employer Satisfaction: 8.2/10

#### Recommendation
Maintain strong industry partnerships and continuously integrate emerging technical skills.`;
    }

    if (lowPrompt.includes('curriculum') || lowPrompt.includes('improve')) {
      return `### CURRICULUM RECOMMENDATION REPORT

#### Core Gaps Identified
1. **Cloud Computing**: Low graduate profile coverage compared to high employer demands.
2. **DevOps / CI-CD**: Employers requested Cloud Computing/DevOps as missing tools.

#### Recommended Actions
- **Action 1**: Add 3 credits on Cloud Computing principles to Software Engineering.
- **Action 2**: Embed DevOps labs into existing Web Programming and Software Engineering courses.
- **Action 3**: Expand structured internships with Safaricom and Ethio Telecom.`;
    }

    if (lowPrompt.includes('compare') || (lowPrompt.includes('cs') && lowPrompt.includes('software')) || (lowPrompt.includes('cs') && lowPrompt.includes('se'))) {
      return `### DEPARTMENT COMPARISON (CS vs Software Engineering)

- **Software Engineering (SWE)**:
  - Employment Rate: 100.0%
  - Average Salary: 23,000 ETB
  - Top Skills: React, Node.js, TypeScript
- **Computer Science / ECE**:
  - Employment Rate: 50.0%
  - Average Salary: 22,000 ETB

**Summary**: Software Engineering registers higher overall employment and slightly better starting salaries. ECE has lower employment but remains competitive.`;
    }

    if (lowPrompt.includes('tracer')) {
      return `### TRACER STUDY REPORT

#### Summary of Outcomes
- Survey Completion Rate: 100.0%
- Response Rate: 100.0%
- Key Outcome: Graduates rated curriculum relevance highly.`;
    }

    if (lowPrompt.includes('executive summary') || lowPrompt.includes('university summary')) {
      return `### UNIVERSITY EXECUTIVE SUMMARY

#### Overall Highlights
- Graduate Employment Rate: 80.0%
- Self-Employment Rate: 20.0%
- Top Employer: Safaricom Ethiopia
- Key Skill Gap: Cloud Computing`;
    }

    return `This is a mock response from the ASTU AI Assistant. To view live AI responses, configure OPENROUTER_API_KEY in the .env file.
    
Prompt analyzed: "${prompt.slice(0, 100)}..."`;
  }

  private static generateMockJsonResponse<T>(prompt: string): T {
    const lowPrompt = prompt.toLowerCase();
    
    if (lowPrompt.includes('routing') || lowPrompt.includes('intent') || lowPrompt.includes('router')) {
      let intent = 'general';
      if (lowPrompt.includes('employment') || lowPrompt.includes('unemployed')) intent = 'employment';
      else if (lowPrompt.includes('company') || lowPrompt.includes('employer') || lowPrompt.includes('hire')) intent = 'employer';
      else if (lowPrompt.includes('department') || lowPrompt.includes('compare') || lowPrompt.includes('cs') || lowPrompt.includes('swe') || lowPrompt.includes('se')) intent = 'department';
      else if (lowPrompt.includes('skill') || lowPrompt.includes('teach') || lowPrompt.includes('technology') || lowPrompt.includes('curriculum')) intent = 'skill_gap';
      else if (lowPrompt.includes('report') || lowPrompt.includes('executive') || lowPrompt.includes('accreditation') || lowPrompt.includes('tracer')) intent = 'report';
      
      return { intent } as any as T;
    }

    return {} as any as T;
  }
}
