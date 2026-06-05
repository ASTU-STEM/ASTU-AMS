import axios from 'axios';

export class OpenRouterService {
  private static getApiKey(): string | null {
    return process.env.OPENROUTER_API_KEY || null;
  }

  private static getModel(): string {
    return process.env.OPENROUTER_MODEL || 'google/gemini-2.5-flash';
  }

  static async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not configured. Falling back to Mock LLM response.');
      return this.generateMockResponse(prompt, systemInstruction);
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.getModel(),
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
          timeout: 30000,
        }
      );

      return response.data.choices[0].message.content || '';
    } catch (error: any) {
      console.error('OpenRouter API call failed:', error.response?.data || error.message);
      throw new Error(`AI generation failed: ${error.message}`);
    }
  }

  static async generateJson<T>(prompt: string, systemInstruction?: string): Promise<T> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not configured. Falling back to Mock LLM JSON response.');
      return this.generateMockJsonResponse<T>(prompt);
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: this.getModel(),
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
          timeout: 30000,
        }
      );

      const content = response.data.choices[0].message.content || '{}';
      return JSON.parse(content) as T;
    } catch (error: any) {
      console.error('OpenRouter JSON API call failed:', error.response?.data || error.message);
      throw new Error(`AI JSON generation failed: ${error.message}`);
    }
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
