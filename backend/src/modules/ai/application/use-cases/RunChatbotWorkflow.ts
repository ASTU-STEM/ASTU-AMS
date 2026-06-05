import { StateGraph, START, END } from '../../infrastructure/agentic/StateGraph';
import { AnalyticsContextProvider } from '../context/AnalyticsContextProvider';
import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';
import { EmploymentAgent } from '../agents/EmploymentAgent';
import { EmployerAgent } from '../agents/EmployerAgent';
import { DepartmentAgent } from '../agents/DepartmentAgent';
import { SkillGapAgent } from '../agents/SkillGapAgent';
import { ReportAgent } from '../agents/ReportAgent';

export interface ChatbotState {
  query: string;
  intent: string;
  context: string;
  response: string;
}

export class RunChatbotWorkflow {
  private graph = new StateGraph<ChatbotState>();

  constructor() {
    this.setupGraph();
  }

  private setupGraph() {
    // 1. Classification node
    this.graph.addNode('classifier', async (state) => {
      const prompt = `Classify the following user question into exactly one of these categories:
- "employment": questions about employment/unemployment rates, salaries, trends, or predictions.
- "employer": questions about top companies, active employers, satisfaction, or demand.
- "department": questions comparing departments or benchmarking specific engineering programs.
- "skill_gap": questions about missing skills, emerging technologies, or curriculum improvements.
- "report": requests to generate tracer, accreditation, executive, curriculum, or department reports.
- "general": any other questions.

USER QUESTION: "${state.query}"

Return a JSON object with a single field "intent" containing one of the string keys above.`;

      const result = await OpenRouterService.generateJson<{ intent: string }>(prompt);
      const intent = result.intent || 'general';
      const context = await AnalyticsContextProvider.getContextForIntent(intent);

      return { intent, context };
    });

    // 2. Specialized Agent nodes
    this.graph.addNode('employment_node', async (state) => {
      const response = await EmploymentAgent.execute(state.query, state.context);
      return { response };
    });

    this.graph.addNode('employer_node', async (state) => {
      const response = await EmployerAgent.execute(state.query, state.context);
      return { response };
    });

    this.graph.addNode('department_node', async (state) => {
      const response = await DepartmentAgent.execute(state.query, state.context);
      return { response };
    });

    this.graph.addNode('skill_gap_node', async (state) => {
      const response = await SkillGapAgent.execute(state.query, state.context);
      return { response };
    });

    this.graph.addNode('report_node', async (state) => {
      // Extract report type from query
      let reportType = 'executive';
      const q = state.query.toLowerCase();
      if (q.includes('tracer')) reportType = 'tracer';
      else if (q.includes('accreditation')) reportType = 'accreditation';
      else if (q.includes('curriculum')) reportType = 'curriculum';
      else if (q.includes('employer')) reportType = 'employer';
      else if (q.includes('department')) reportType = 'department';

      const response = await ReportAgent.execute(reportType, state.context);
      return { response };
    });

    this.graph.addNode('general_node', async (state) => {
      const systemInstruction = `You are the general ASTU Alumni Intelligence Assistant. Answer the user's question using the provided university context. Keep responses concise and factual.`;
      const prompt = `CONTEXT:
${state.context}

USER QUESTION:
${state.query}`;
      const response = await OpenRouterService.generateText(prompt, systemInstruction);
      return { response };
    });

    // 3. Define Graph routing structure
    this.graph.addEdge(START, 'classifier');

    this.graph.addConditionalEdges(
      'classifier',
      (state) => {
        switch (state.intent) {
          case 'employment': return 'employment_node';
          case 'employer': return 'employer_node';
          case 'department': return 'department_node';
          case 'skill_gap': return 'skill_gap_node';
          case 'report': return 'report_node';
          case 'general':
          default:
            return 'general_node';
        }
      }
    );

    this.graph.addEdge('employment_node', END);
    this.graph.addEdge('employer_node', END);
    this.graph.addEdge('department_node', END);
    this.graph.addEdge('skill_gap_node', END);
    this.graph.addEdge('report_node', END);
    this.graph.addEdge('general_node', END);
  }

  async execute(query: string): Promise<ChatbotState> {
    const initialState: ChatbotState = {
      query,
      intent: 'general',
      context: '',
      response: '',
    };

    const compiledGraph = this.graph.compile();
    return compiledGraph.execute(initialState);
  }
}
