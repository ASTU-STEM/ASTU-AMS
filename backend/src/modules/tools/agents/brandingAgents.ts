import { ToolAgent, ToolAgentResult, createLangGraphAgentPipeline } from './agentInterface';

const sysInstruction = `You are an expert Personal Branding & Executive Presence AI Advisory Agent powered by LangChain & LangGraph. Provide public speaking bios, elevator pitches, personal brand audits, conference proposals, and thought leadership outlines.`;

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

export const brandingAgents: ToolAgent[] = [
  buildAgent('public-speaking-bio', 'Public Speaking Bio Agent', 'personal', (inp, prof) =>
    `Generate 50-word, 100-word, and 200-word speaker bios for ASTU graduate presenting at tech conferences.`
  ),
  buildAgent('executive-elevator-pitch', 'Executive Elevator Pitch Agent', 'personal', (inp, prof) =>
    `Formulate 30-second verbal elevator pitch positioning ASTU ${prof?.department?.name} credentials to senior executives.`
  ),
  buildAgent('personal-brand-auditor', 'Personal Brand Auditor Agent', 'personal', (inp, prof) =>
    `Audit candidate online presence across LinkedIn, GitHub, and professional portfolio to optimize industry reputation.`
  ),
  buildAgent('conference-speaker-proposal', 'Conference Speaker Proposal Agent', 'personal', (inp, prof) =>
    `Write a Call-for-Papers (CFP) speaker proposal (Title, Abstract, Key Takeaways, Speaker Bio) for tech event.`
  ),
  buildAgent('networking-strategy-planner', 'Professional Networking Strategy Agent', 'personal', (inp, prof) =>
    `Build a 90-day networking plan targeting 10 key leaders in Ethiopia's engineering & technology ecosystem.`
  ),
  buildAgent('book-research-summary', 'Book & Research Summary Agent', 'personal', (inp, prof) =>
    `Summarize key concepts from technical book or research paper into 5 actionable insights for personal brand sharing.`
  ),
  buildAgent('mentorship-program-application', 'Mentorship Program Application Agent', 'personal', (inp, prof) =>
    `Write application text for joining formal industry mentorship programs as a mentee or youth mentor.`
  ),
  buildAgent('peer-feedback-request', 'Peer Feedback Request Agent', 'personal', (inp, prof) =>
    `Write a 360-degree peer feedback request note asking colleagues for constructive growth observations.`
  ),
  buildAgent('thought-leadership-outline', 'Thought Leadership Article Agent', 'personal', (inp, prof) =>
    `Outline a LinkedIn article on "${inp.topic || 'The Future of Software Engineering in Ethiopia'}" (Hook, 3 Core Arguments, Call-to-Action).`
  ),
  buildAgent('volunteer-community-plan', 'Community Volunteer Plan Agent', 'personal', (inp, prof) =>
    `Outline a community STEM volunteering initiative for ASTU alumni teaching high school students coding/robotics in Adama.`
  )
];
