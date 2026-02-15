/**
 * Pre-compute embeddings for all Islamic content.
 *
 * Usage: npx tsx server/scripts/index-islamic-content.ts
 *
 * Generates server/data/embeddings.json for fast startup.
 */

import { initializeRAG, getRAGStatus } from '../services/rag-engine';

async function main() {
  console.log('[Index] Starting embedding generation...');
  const start = Date.now();

  await initializeRAG();

  const status = getRAGStatus();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log(`[Index] Done in ${elapsed}s`);
  console.log(`[Index] Documents: ${status.documentCount}`);
  console.log(`[Index] Model: ${status.embeddingModel}`);
  console.log(`[Index] Degraded: ${status.degraded}`);
}

main().catch((err) => {
  console.error('[Index] Fatal error:', err);
  process.exit(1);
});
