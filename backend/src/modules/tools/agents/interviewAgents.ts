import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert ASTU Technical & Behavioral Interview AI Coaching Agent powered by LangChain & LangGraph. Provide realistic interview questions, STAR story frameworks, system architecture answers, and evaluation criteria for ASTU engineering candidates.`;

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

export const interviewAgents: ToolAgent[] = [
  buildAgent('mock-interview-simulator', 'Mock Interview Simulator Agent', 'interviews', (inp, prof) =>
    `Position: ${inp.position || 'Software Engineer'}\nGenerate 5 interview questions (3 Technical, 2 Behavioral STAR) with ideal answers.`
  ),
  buildAgent('technical-interview-prep', 'Technical Interview Prep Agent', 'interviews', (inp, prof) =>
    `Generate 4 core technical interview questions for ASTU ${prof?.department?.name} with deep technical solution breakdowns.`
  ),
  buildAgent('behavioral-star-story-builder', 'Behavioral STAR Story Builder Agent', 'interviews', (inp, prof) =>
    `Format candidate situation "${inp.situation || 'ASTU Senior Project teamwork'}" into Situation, Task, Action, and Result (STAR) framework.`
  ),
  buildAgent('interview-salary-question-prep', 'Interview Salary Question Prep Agent', 'interviews', (inp, prof) =>
    `Provide 3 scripted responses to "What are your salary expectations in ETB?" for an ASTU graduate in Addis Ababa.`
  ),
  buildAgent('system-design-interview-outline', 'System Design Interview Outline Agent', 'interviews', (inp, prof) =>
    `Provide step-by-step system design interview blueprint for "${inp.system || 'Telebirr Payment / E-Commerce Backend'}".`
  ),
  buildAgent('code-challenge-breakdown', 'Code Challenge Breakdown Agent', 'interviews', (inp, prof) =>
    `Explain problem breakdown, optimal solution algorithm, and Time/Space complexity for coding challenge: ${inp.problem || 'Array Optimization'}.`
  ),
  buildAgent('salary-expectation-formulator', 'Salary Expectation Formulator Agent', 'interviews', (inp, prof) =>
    `Formulate realistic ETB salary bands for ${prof?.department?.name} graduate in Ethiopian market based on CGPA ${prof?.cgpa}.`
  ),
  buildAgent('recruiter-elevator-pitch', 'Recruiter Elevator Pitch Agent', 'interviews', (inp, prof) =>
    `Generate 30-second and 60-second verbal elevator pitches for ASTU graduate networking.`
  ),
  buildAgent('interview-self-debrief-log', 'Interview Self-Debrief Log Agent', 'interviews', (inp, prof) =>
    `Create a structured post-interview reflection log template to audit weak spots and plan follow-up action items.`
  ),
  buildAgent('interview-cheat-sheet', 'Interview Cheat Sheet Agent', 'interviews', (inp, prof) =>
    `Create a 1-page quick technical reference cheat sheet before entering an interview for ${prof?.department?.name}.`
  )
];
