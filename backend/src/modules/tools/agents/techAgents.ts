import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU Systems Architecture & Software Engineering AI Specialist Agent powered by LangChain & LangGraph. Provide production-grade database schemas, API specs, CI/CD pipeline blueprints, architecture outlines, and technical documentation.`;

const buildAgent = (id: string, name: string, category: string, promptBuilder: (inp: any, prof: any) => string): ToolAgent => ({
  id,
  name,
  category,
  async execute(inputs, profile): Promise<ToolAgentResult> {
    const pipeline = createLangGraphAgentPipeline(id, name, sysInstruction, promptBuilder);
    const res: any = await pipeline.invoke({ inputs, profile });
    return {
      text: typeof res?.resultText === 'string' ? res.resultText : String(res?.resultText || ''),
      summary: typeof res?.resultSummary === 'string' ? res.resultSummary : String(res?.resultSummary || ''),
      agentId: id,
      agentName: name,
      timestamp: new Date().toLocaleString(),
      engine: 'LangGraph / LangChain StateGraph'
    };
  }
});

export const techAgents: ToolAgent[] = [
  buildAgent('software-architecture-outline', 'Software Architecture Outline Agent', 'tech', (inp, prof) =>
    `Generate software architecture document (System Components, Tech Stack, Data Flow, Security) for system: ${inp.systemName || 'Distributed Telemetry & Payment Platform'}.`
  ),
  buildAgent('database-schema-assistant', 'Database Schema Assistant Agent', 'tech', (inp, prof) =>
    `Design PostgreSQL database schema SQL with relations and indexes for domain: ${inp.domain || 'E-Commerce / Student Management'}.`
  ),
  buildAgent('api-endpoint-spec-generator', 'API Endpoint Spec Generator Agent', 'tech', (inp, prof) =>
    `Generate REST API OpenAPI/Swagger specification (Methods, Headers, Payloads, Error Codes) for resource: ${inp.resource || 'User Profile & Verification'}.`
  ),
  buildAgent('tech-stack-evaluator', 'Tech Stack Evaluator Agent', 'tech', (inp, prof) =>
    `Evaluate and compare Next.js vs Vite/React and PostgreSQL vs MongoDB for high-scale enterprise apps in Ethiopia.`
  ),
  buildAgent('git-commit-pr-formatter', 'Git Commit & PR Formatter Agent', 'tech', (inp, prof) =>
    `Format git commit message and Pull Request (PR) description using Conventional Commits standard (feat, fix, docs).`
  ),
  buildAgent('bug-report-builder', 'Bug Report & Issue Builder Agent', 'tech', (inp, prof) =>
    `Format structured bug report (Steps to Reproduce, Expected vs Actual Result, System Logs, Stack Trace).`
  ),
  buildAgent('code-review-feedback-formatter', 'Code Review Feedback Formatter Agent', 'tech', (inp, prof) =>
    `Format constructive code review feedback highlighting security, performance, readability, and test coverage improvements.`
  ),
  buildAgent('devops-pipeline-blueprint', 'DevOps & CI/CD Pipeline Blueprint Agent', 'tech', (inp, prof) =>
    `Generate GitHub Actions CI/CD workflow YAML pipeline (Lint, Test, Build Docker image, Deploy to server).`
  ),
  buildAgent('tech-docs-outline', 'Technical Documentation Outline Agent', 'tech', (inp, prof) =>
    `Outline developer documentation structure (Quickstart, Installation, Environment Config, API Reference, Troubleshooting).`
  ),
  buildAgent('open-source-contribution-selector', 'Open Source Contribution Selector Agent', 'tech', (inp, prof) =>
    `Recommend 3 open-source repositories suitable for ${prof?.department?.name} graduates to make first GitHub pull requests.`
  )
];
