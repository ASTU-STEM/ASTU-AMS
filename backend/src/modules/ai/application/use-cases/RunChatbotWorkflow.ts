import { StateGraph, START, END, Annotation } from '@langchain/langgraph';
import { AnalyticsContextProvider } from '../context/AnalyticsContextProvider';
import { OpenRouterService } from '../../infrastructure/services/OpenRouterService';
import { DatabaseQueryTool, DatabaseQueryResult } from '../../infrastructure/tools/DatabaseQueryTool';
import { EmploymentAgent } from '../agents/EmploymentAgent';
import { EmployerAgent } from '../agents/EmployerAgent';
import { DepartmentAgent } from '../agents/DepartmentAgent';
import { SkillGapAgent } from '../agents/SkillGapAgent';
import { ReportAgent } from '../agents/ReportAgent';
import { UniversalDataQueryAgent } from '../agents/UniversalDataQueryAgent';

export const ChatbotStateAnnotation = Annotation.Root({
  query: Annotation<string>,
  intent: Annotation<string>,
  context: Annotation<string>,
  dbSummary: Annotation<string>,
  dbQueryResult: Annotation<any>,
  response: Annotation<string>,
});

export type ChatbotState = typeof ChatbotStateAnnotation.State;

export class RunChatbotWorkflow {
  private compiledGraph;

  constructor() {
    this.compiledGraph = this.setupGraph();
  }

  private setupGraph() {
    return new StateGraph(ChatbotStateAnnotation)
      // 1. Classification node
      .addNode('classifier', async (state) => {
        const prompt = `Classify the following user question into exactly one of these categories:
- "database": questions asking for direct PostgreSQL records, live counts, student profiles, job postings list, or document SLAs.
- "employment": questions about employment/unemployment rates, salaries, trends, or predictions.
- "employer": questions about top companies, active employers, satisfaction, or demand.
- "department": questions comparing departments or benchmarking specific engineering programs.
- "skill_gap": questions about missing skills, emerging technologies, or curriculum improvements.
- "report": requests to generate tracer, accreditation, executive, curriculum, or department reports.
- "general": any other questions.

USER QUESTION: "${state.query}"

Return a JSON object with a single field "intent" containing one of the string keys above.`;

        try {
          const result = await OpenRouterService.generateJson<{ intent: string }>(prompt);
          const intent = result.intent || 'general';
          return { intent };
        } catch {
          return { intent: 'general' };
        }
      })

      // 2. Parallel / Merged Data Retrieval Nodes
      .addNode('db_retrieval_node', async (state) => {
        const dbResult: DatabaseQueryResult = await DatabaseQueryTool.searchDatabase(state.query);
        return {
          dbSummary: dbResult.summaryText,
          dbQueryResult: dbResult,
        };
      })

      .addNode('analytics_rag_node', async (state) => {
        const ragContext = await AnalyticsContextProvider.getContextForIntent(state.intent || 'general');
        return { context: ragContext };
      })

      // 3. Specialized Agent execution nodes
      .addNode('database_node', async (state) => {
        const response = await UniversalDataQueryAgent.execute(
          state.query,
          state.context || '',
          state.dbSummary || ''
        );
        return { response };
      })

      .addNode('employment_node', async (state) => {
        const mergedContext = `[LIVE DATABASE SUMMARY]\n${state.dbSummary || ''}\n\n[RAG CONTEXT]\n${state.context || ''}`;
        const response = await EmploymentAgent.execute(state.query, mergedContext);
        return { response };
      })

      .addNode('employer_node', async (state) => {
        const mergedContext = `[LIVE DATABASE SUMMARY]\n${state.dbSummary || ''}\n\n[RAG CONTEXT]\n${state.context || ''}`;
        const response = await EmployerAgent.execute(state.query, mergedContext);
        return { response };
      })

      .addNode('department_node', async (state) => {
        const mergedContext = `[LIVE DATABASE SUMMARY]\n${state.dbSummary || ''}\n\n[RAG CONTEXT]\n${state.context || ''}`;
        const response = await DepartmentAgent.execute(state.query, mergedContext);
        return { response };
      })

      .addNode('skill_gap_node', async (state) => {
        const mergedContext = `[LIVE DATABASE SUMMARY]\n${state.dbSummary || ''}\n\n[RAG CONTEXT]\n${state.context || ''}`;
        const response = await SkillGapAgent.execute(state.query, mergedContext);
        return { response };
      })

      .addNode('report_node', async (state) => {
        let reportType = 'executive';
        const q = state.query.toLowerCase();
        if (q.includes('tracer')) reportType = 'tracer';
        else if (q.includes('accreditation')) reportType = 'accreditation';
        else if (q.includes('curriculum')) reportType = 'curriculum';
        else if (q.includes('employer')) reportType = 'employer';
        else if (q.includes('department')) reportType = 'department';

        const mergedContext = `[LIVE DATABASE SUMMARY]\n${state.dbSummary || ''}\n\n[RAG CONTEXT]\n${state.context || ''}`;
        const response = await ReportAgent.execute(reportType, mergedContext);
        return { response };
      })

      .addNode('general_node', async (state) => {
        const systemInstruction = `You are the specialized ASTU AI & Data Intelligence Agent. Answer the user's question clearly, concisely, and accurately based on live university data and analytical context.`;
        const prompt = `LIVE DATABASE SUMMARY:
${state.dbSummary || 'N/A'}

INSTITUTIONAL CONTEXT:
${state.context || 'N/A'}

USER QUESTION:
${state.query}`;
        const response = await OpenRouterService.generateText(prompt, systemInstruction);
        return { response };
      })

      // 4. Define Graph Routing
      .addEdge(START, 'classifier')
      .addEdge('classifier', 'db_retrieval_node')
      .addEdge('classifier', 'analytics_rag_node')

      // Conditional edges from classifier (which now branch to execution nodes after retrieval)
      .addConditionalEdges(
        'classifier',
        (state) => {
          switch (state.intent) {
            case 'database': return 'database_node';
            case 'employment': return 'employment_node';
            case 'employer': return 'employer_node';
            case 'department': return 'department_node';
            case 'skill_gap': return 'skill_gap_node';
            case 'report': return 'report_node';
            case 'general':
            default:
              return 'general_node';
          }
        },
        {
          database_node: 'database_node',
          employment_node: 'employment_node',
          employer_node: 'employer_node',
          department_node: 'department_node',
          skill_gap_node: 'skill_gap_node',
          report_node: 'report_node',
          general_node: 'general_node',
        }
      )

      .addEdge('database_node', END)
      .addEdge('employment_node', END)
      .addEdge('employer_node', END)
      .addEdge('department_node', END)
      .addEdge('skill_gap_node', END)
      .addEdge('report_node', END)
      .addEdge('general_node', END)
      .compile();
  }

  async execute(query: string): Promise<ChatbotState> {
    const initialState: ChatbotState = {
      query,
      intent: 'general',
      context: '',
      dbSummary: '',
      dbQueryResult: null,
      response: '',
    };

    return this.compiledGraph.invoke(initialState);
  }
}

