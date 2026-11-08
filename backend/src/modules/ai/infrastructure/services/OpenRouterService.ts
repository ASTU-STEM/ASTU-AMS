import axios from 'axios';

export class OpenRouterService {
  private static async getApiKey(): Promise<string | null> {
    if (process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.trim() !== '') {
      return process.env.OPENROUTER_API_KEY.trim();
    }
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
    return null;
  }

  private static async getModel(): Promise<string> {
    if (process.env.OPENROUTER_MODEL && process.env.OPENROUTER_MODEL.trim() !== '') {
      let m = process.env.OPENROUTER_MODEL.trim();
      if (m === 'deepseek/deepseek-r1:free' || m === 'deepseek/deepseek-chat') m = 'meta-llama/llama-3.3-70b-instruct';
      return m;
    }
    return 'meta-llama/llama-3.3-70b-instruct';
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
      'meta-llama/llama-3.3-70b-instruct',
      'google/gemini-2.5-flash',
      'qwen/qwen-2.5-72b-instruct',
      'mistralai/mistral-small-24b-instruct-2501',
      'meta-llama/llama-3.1-8b-instruct',
    ]));

    for (const currentModel of candidateModels) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: currentModel,
            max_tokens: 2500,
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
            timeout: 3000,
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          return response.data.choices[0].message.content;
        }
      } catch (error: any) {
        console.warn(`OpenRouter model [${currentModel}] call notice:`, error.response?.data?.error?.message || error.message);
        const code = error?.code || error?.cause?.code;
        if (code === 'ENOTFOUND' || code === 'ECONNREFUSED' || code === 'EAI_AGAIN') {
          break; // Stop immediately if network/domain is unreachable
        }
      }
    }

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
      'meta-llama/llama-3.3-70b-instruct',
    ]));

    for (const currentModel of candidateModels) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: currentModel,
            max_tokens: 1500,
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
            timeout: 6000,
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content) as T;
        }
      } catch (error: any) {
        console.warn(`OpenRouter JSON model [${currentModel}] call notice:`, error.response?.data?.error?.message || error.message);
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
- Overall Employment Rate: 55.0%
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
  - Employment Rate: 63.0%
  - Average Salary: ETB 23,400 / month
  - Top Skills: React, Node.js, TypeScript
- **Computer Science / ECE**:
  - Employment Rate: 75.0%
  - Average Salary: ETB 22,000 / month

**Summary**: Software Engineering registers competitive overall employment and higher starting salaries. ECE has 75% placement rate.`;
    }

    if (lowPrompt.includes('tracer')) {
      return `### TRACER STUDY REPORT

#### Summary of Outcomes
- Survey Completion Rate: 100.0%
- Response Rate: 13.6%
- Key Outcome: Graduates rated curriculum relevance highly.`;
    }

    if (lowPrompt.includes('executive summary') || lowPrompt.includes('university summary')) {
      return `### UNIVERSITY EXECUTIVE SUMMARY

#### Overall Highlights
- Graduate Employment Rate: 55.0%
- Time to Hire: 16.3 months
- Average Salary: ETB 19,185 / month
- Top Employer: Safaricom Ethiopia
- Key Skill Gap: Cloud Computing`;
    }

    if (lowPrompt.includes('location') || lowPrompt.includes('where is') || lowPrompt.includes('address') || lowPrompt.includes('campus')) {
      return `Adama Science and Technology University (ASTU) Location:
• City: Adama (Nazret), Oromia Region, Ethiopia (~100km southeast of Addis Ababa along the expressway).
• Main Campus: Houses central administration, faculties, library, and student dining facilities.
• Research Complex: Houses robotics, artificial intelligence, and renewable energy labs.
• Convocation Hall: Hosts graduation ceremonies, research symposiums, and career fairs.`;
    }

    if (lowPrompt.includes('transcript') || (lowPrompt.includes('request') && lowPrompt.includes('document'))) {
      return `How to Request Official Transcripts and Academic Documents:
1. Sign in to your verified Alumni account on the ASTU Portal.
2. Go to Document Services -> Request Document.
3. Select the document: Official Transcript, Degree Certificate Copy, or English Medium of Instruction Letter.
4. Provide the delivery recipient information and submit.
5. Standard processing SLA is 24 to 48 business hours by the Registrar Directorate.
6. Track progress under My Document Requests.`;
    }

    if (lowPrompt.includes('register') || lowPrompt.includes('create account') || lowPrompt.includes('sign up')) {
      return `How to Register on the ASTU-AMS Portal:
1. Click the Register button in the top navigation bar.
2. Select your role: Alumni, Student, or Partner Employer.
3. Enter your full name, student ID / graduation year, and email address.
4. Set a secure password and submit the registration form.
5. Verify the code sent to your email to activate your account.`;
    }

    if (lowPrompt.includes('hello') || lowPrompt.includes('hi') || lowPrompt.includes('hey') || lowPrompt.includes('who are you') || lowPrompt.includes('what are you')) {
      return `Hello! I am ASTU AI, the official verified assistant for Adama Science and Technology University (ASTU).

I can assist you with:
• Requesting official transcripts and academic documents
• Completing graduate tracer surveys and reviewing employment telemetry
• Finding jobs and browsing partner employer vacancies
• Registering as alumni or employer
• Campus locations, academic programs, and department information

How may I help you today?`;
    }

    return `ASTU Assistant Guidance:
Adama Science and Technology University (ASTU) is Ethiopia's premier center of excellence for Science, Technology, Engineering, and Mathematics (STEM).

Core Services Available:
• Official Transcripts: Submit online via Document Services (24-48h SLA).
• Career Center: Browse openings from Safaricom, Ethio Telecom, Sunshine Construction, and INSA.
• Tracer Studies: Complete active surveys to update university accreditation benchmarks.
• Registration: Create verified Alumni or Employer accounts from the homepage.

Please feel free to ask any specific question about ASTU or portal navigation.`;
  }

  private static generateMockJsonResponse<T>(prompt: string): T {
    const lowPrompt = prompt.toLowerCase();
    
    if (lowPrompt.includes('routing') || lowPrompt.includes('intent') || lowPrompt.includes('router')) {
      let intent = 'general';
      if (lowPrompt.includes('user') || lowPrompt.includes('account') || lowPrompt.includes('profile') || lowPrompt.includes('wabi') || lowPrompt.includes('search') || lowPrompt.includes('find') || lowPrompt.includes('employment') || lowPrompt.includes('unemployed')) intent = 'database';
      else if (lowPrompt.includes('company') || lowPrompt.includes('employer') || lowPrompt.includes('hire')) intent = 'employer';
      else if (lowPrompt.includes('department') || lowPrompt.includes('compare') || lowPrompt.includes('cs') || lowPrompt.includes('swe') || lowPrompt.includes('se')) intent = 'department';
      else if (lowPrompt.includes('skill') || lowPrompt.includes('teach') || lowPrompt.includes('technology') || lowPrompt.includes('curriculum')) intent = 'skill_gap';
      else if (lowPrompt.includes('report') || lowPrompt.includes('executive') || lowPrompt.includes('accreditation') || lowPrompt.includes('tracer')) intent = 'report';
      
      return { intent } as any as T;
    }

    return {} as any as T;
  }
}

