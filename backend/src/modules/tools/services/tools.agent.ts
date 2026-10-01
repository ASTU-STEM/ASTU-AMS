import { agentRegistry } from '../agents/agentRegistry';

export class ToolsAIAgent {
  static async executeToolAI(
    toolId: string,
    inputs: Record<string, any>,
    userProfile?: any
  ): Promise<{ text: string; summary: string }> {
    // Determine the array of agents for parallel execution
    // The main agent is the requested toolId
    // We add contextual agents to fulfill the parallel execution requirement for all 50 tools
    const contextualAgents = ['alumni-directory-search-assistant', 'profile-strength-checker'];
    const parallelIds = Array.from(new Set([toolId, ...contextualAgents]));
    
    const results = await agentRegistry.executeParallelAgents(parallelIds, inputs, userProfile);
    
    // Combine the results
    const mainResult = results.find(r => r.agentId === toolId) || results[0];
    const otherResults = results.filter(r => r.agentId !== toolId);
    
    let combinedText = `### PARALLEL AGENT EXECUTION OVERVIEW\n`;
    combinedText += `Main Task: ${mainResult.agentName}\n`;
    combinedText += `Supporting Agents: ${otherResults.map(r => r.agentName).join(', ')}\n\n`;
    
    results.forEach((res) => {
      combinedText += `===================================================================\n`;
      combinedText += `AGENT: ${res.agentName.toUpperCase()} [ID: ${res.agentId}]\n`;
      combinedText += `===================================================================\n`;
      combinedText += `${res.text}\n\n`;
    });
    
    return {
      text: combinedText.trim(),
      summary: mainResult.summary + ' (Enhanced by parallel contextual agents)'
    };
  }

  static async executeParallelTools(
    toolIds: string[],
    inputs: Record<string, any>,
    userProfile?: any
  ) {
    return agentRegistry.executeParallelAgents(toolIds, inputs, userProfile);
  }

  static getRegisteredAgentCount(): number {
    return agentRegistry.getRegisteredCount();
  }
}
