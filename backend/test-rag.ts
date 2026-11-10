import { RAGKnowledgeService } from './src/modules/ai/infrastructure/services/RAGKnowledgeService';
import { PublicKnowledgeAssistantService } from './src/modules/ai/infrastructure/services/PublicKnowledgeAssistantService';

async function main() {
  console.log('--- Testing RAG bootstrap & search ---');
  await RAGKnowledgeService.ensureBootstrapKnowledge();

  const testQueries = [
    'How do I request my academic transcript?',
    'Where is ASTU located and what are the campus facilities?',
    'What are the ASTU graduate employment and salary statistics?',
    'How do I register on the portal as an alumnus?',
    'Who are the top hiring employers for ASTU graduates?',
    'Hello ASTU assistant',
  ];

  for (const q of testQueries) {
    console.log(`\n========================================`);
    console.log(`QUERY: "${q}"`);
    const ragResult = await RAGKnowledgeService.queryAndGenerate(q);
    console.log(`IS GROUNDED:`, ragResult.isGrounded);
    console.log(`CITATIONS (${ragResult.citations.length}):`, ragResult.citations.map((c: any) => c.title));
    console.log(`ACTIONS (${ragResult.actions.length}):`, ragResult.actions.map((a: any) => a.label));
    console.log(`RESPONSE:\n${ragResult.response}`);
  }
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
