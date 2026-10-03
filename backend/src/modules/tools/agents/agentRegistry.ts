import { ToolAgent, ToolAgentResult } from './agentInterface';

import { careerAgents } from './careerAgents';
import { cvAgents } from './cvAgents';
import { coverletterAgents } from './coverletterAgents';
import { interviewAgents } from './interviewAgents';
import { ethiopianJobAgents } from './ethiopianJobAgents';
import { academicAgents } from './academicAgents';
import { scholarshipAgents } from './scholarshipAgents';
import { financeAgents } from './financeAgents';
import { smeAgents } from './smeAgents';
import { freelanceAgents } from './freelanceAgents';
import { productivityAgents } from './productivityAgents';
import { techAgents } from './techAgents';
import { managementAgents } from './managementAgents';
import { legalAgents } from './legalAgents';
import { brandingAgents } from './brandingAgents';
import { alumniAgents } from './alumniAgents';

class AgentRegistry {
  private agents: Map<string, ToolAgent> = new Map();

  constructor() {
    this.registerAgents(careerAgents);
    this.registerAgents(cvAgents);
    this.registerAgents(coverletterAgents);
    this.registerAgents(interviewAgents);
    this.registerAgents(ethiopianJobAgents);
    this.registerAgents(academicAgents);
    this.registerAgents(scholarshipAgents);
    this.registerAgents(financeAgents);
    this.registerAgents(smeAgents);
    this.registerAgents(freelanceAgents);
    this.registerAgents(productivityAgents);
    this.registerAgents(techAgents);
    this.registerAgents(managementAgents);
    this.registerAgents(legalAgents);
    this.registerAgents(brandingAgents);
    this.registerAgents(alumniAgents);
  }

  private registerAgents(agentList: ToolAgent[]) {
    agentList.forEach((agent) => {
      this.agents.set(agent.id, agent);
    });
  }

  public getAgent(toolId: string): ToolAgent | undefined {
    return this.agents.get(toolId);
  }

  public getRegisteredCount(): number {
    return this.agents.size;
  }

  public async executeAgent(toolId: string, inputs: Record<string, any>, userProfile?: any): Promise<ToolAgentResult> {
    const agent = this.getAgent(toolId);
    if (agent) {
      return agent.execute(inputs, userProfile);
    }

    // Dynamic fallback for any unmatched ID
    return {
      text: `### ASTU AI AGENT ADVISORY
Executing general ASTU tool agent for tool ID: ${toolId}.
User: ${userProfile?.fullName || 'ASTU Graduate'} (${userProfile?.department?.name || 'Engineering'})`,
      summary: `AI Tool Agent executed for ${toolId}`,
      agentId: toolId,
      agentName: `${toolId} Agent`,
      timestamp: new Date().toLocaleString()
    };
  }

  // ─────────────────────────────────────────────────────────────
  // PARALLEL AGENT EXECUTION ENGINE (Multi-Agent Workflows)
  // ─────────────────────────────────────────────────────────────
  public async executeParallelAgents(
    toolIds: string[],
    inputs: Record<string, any>,
    userProfile?: any
  ): Promise<ToolAgentResult[]> {
    const promises = toolIds.map((id) => this.executeAgent(id, inputs, userProfile));
    return Promise.all(promises);
  }
}

export const agentRegistry = new AgentRegistry();
