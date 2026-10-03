import prisma from '../../../../core/config/db';
import { OpenRouterService } from './OpenRouterService';

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  triggerKeywords: string[];
  systemPrompt: string;
  toolCode?: string;
  capabilities: string[];
  createdBy: string;
  createdAt: string;
  executionCount: number;
  status: 'ACTIVE' | 'DRAFT';
}

export class DynamicAgentRegistry {
  private static defaultAgents: CustomAgent[] = [
    {
      id: 'agent-01',
      name: 'Research Publication & Patent Tracker Agent',
      description: 'Tracks ASTU faculty research publications, citation indexes, and patent filings.',
      triggerKeywords: ['patent', 'research publication', 'citation', 'journal', 'faculty research'],
      systemPrompt: 'You are the ASTU Research & Patent Agent. Analyze faculty publications, citation indexes, and patent filings at ASTU.',
      capabilities: ['Track Journal Papers', 'Calculate Citation Metrics', 'Monitor Patent Filings'],
      createdBy: 'Autonomous AI Factory',
      createdAt: '2026-09-24',
      executionCount: 14,
      status: 'ACTIVE',
    },
    {
      id: 'agent-02',
      name: 'Alumni Mentorship & Internship Matcher Agent',
      description: 'Pairs graduating senior students with verified alumni mentors based on industry skills.',
      triggerKeywords: ['mentor', 'mentorship', 'internship match', 'alumni mentor', 'guidance'],
      systemPrompt: 'You are the ASTU Alumni Mentorship Agent. Pair graduating students with alumni mentors in industry.',
      capabilities: ['Skill Matching', 'Automated Mentorship Requests', 'Industry Guidance'],
      createdBy: 'Autonomous AI Factory',
      createdAt: '2026-09-24',
      executionCount: 9,
      status: 'ACTIVE',
    },
  ];

  static async listAgents(): Promise<CustomAgent[]> {
    try {
      const setting = await (prisma as any).systemSetting.findUnique({ where: { key: 'custom_ai_agents' } }).catch(() => null);
      if (setting && setting.value && Array.isArray(setting.value)) {
        return [...this.defaultAgents, ...setting.value];
      }
    } catch {
      /* ignore */
    }
    return this.defaultAgents;
  }

  static async findMatchingAgent(query: string): Promise<CustomAgent | null> {
    const q = query.toLowerCase();
    const agents = await this.listAgents();

    for (const agent of agents) {
      if (agent.triggerKeywords.some((kw) => q.includes(kw.toLowerCase()))) {
        return agent;
      }
    }
    return null;
  }

  static async synthesizeAndStoreAgent(
    userRequirement: string,
    createdBy = 'SuperAdmin AI System'
  ): Promise<{ agent: CustomAgent; executionOutput: string; isNew: boolean }> {
    const existing = await this.findMatchingAgent(userRequirement);
    if (existing) {
      existing.executionCount += 1;
      const resultText = await OpenRouterService.generateText(
        `Execute custom agent task for query: "${userRequirement}".`,
        existing.systemPrompt
      );
      await this.saveAgent(existing);
      return { agent: existing, executionOutput: resultText, isNew: false };
    }

    // Autonomously synthesize new Agent prompt & capabilities using LLM
    const synthPrompt = `A user requested a new system feature that no current agent performs: "${userRequirement}".
Generate a JSON object with the structure for a new autonomous AI Agent:
{
  "name": "Short Professional Agent Name (e.g. Tuition Fee Audit Agent)",
  "description": "Clear 1-sentence description of what this agent does",
  "triggerKeywords": ["keyword1", "keyword2", "keyword3"],
  "systemPrompt": "System prompt for this specialized agent...",
  "capabilities": ["Capability 1", "Capability 2", "Capability 3"]
}`;

    let synthesized: any = {};
    try {
      synthesized = await OpenRouterService.generateJson(synthPrompt);
    } catch {
      synthesized = {
        name: `Custom Agent (${userRequirement.slice(0, 20)})`,
        description: `Autonomous agent created to handle "${userRequirement}".`,
        triggerKeywords: userRequirement.toLowerCase().split(' ').filter((w) => w.length > 3).slice(0, 4),
        systemPrompt: `You are a specialized ASTU agent handling: ${userRequirement}.`,
        capabilities: ['Custom Data Processing', 'Automated Execution', 'PostgreSQL Logging'],
      };
    }

    const newAgent: CustomAgent = {
      id: `agent-${Date.now()}`,
      name: synthesized.name || 'Custom Dynamic Agent',
      description: synthesized.description || `Autonomously built for: ${userRequirement}`,
      triggerKeywords: synthesized.triggerKeywords || ['custom', 'agent'],
      systemPrompt: synthesized.systemPrompt || `You are an AI agent designed to execute: ${userRequirement}`,
      capabilities: synthesized.capabilities || ['Autonomous Processing', 'DB Integration'],
      createdBy,
      createdAt: new Date().toISOString().split('T')[0],
      executionCount: 1,
      status: 'ACTIVE',
    };

    // Execute new Agent for the first time
    const initialExecution = await OpenRouterService.generateText(
      `Execute initial task: "${userRequirement}".`,
      newAgent.systemPrompt
    );

    // Save to PostgreSQL DB
    await this.saveAgent(newAgent);

    return {
      agent: newAgent,
      executionOutput: initialExecution,
      isNew: true,
    };
  }

  private static async saveAgent(agent: CustomAgent): Promise<void> {
    try {
      const agents = await this.listAgents();
      const filtered = agents.filter((a) => !this.defaultAgents.some((d) => d.id === a.id));

      const updated = filtered.some((a) => a.id === agent.id)
        ? filtered.map((a) => (a.id === agent.id ? agent : a))
        : [...filtered, agent];

      await (prisma as any).systemSetting.upsert({
        where: { key: 'custom_ai_agents' },
        update: { value: updated, updatedAt: new Date() },
        create: { key: 'custom_ai_agents', value: updated },
      }).catch(() => null);
    } catch {
      /* ignore */
    }
  }
}
