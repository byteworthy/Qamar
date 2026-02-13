/**
 * Embedding Service for RAG System
 *
 * Provides text embedding generation and similarity computation.
 * Currently returns mock embeddings; designed for easy swap to
 * Ollama's nomic-embed-text when ready.
 */

// TODO: Replace with Ollama client import when vector DB is connected
// import { OllamaClient } from './ollama-client';

export const EMBEDDING_MODEL = 'nomic-embed-text';
export const VECTOR_DIM = 768;

/**
 * Generate an embedding vector for the given text.
 *
 * TODO: Replace mock with real Ollama call:
 *   const response = await ollama.embeddings({ model: EMBEDDING_MODEL, prompt: text });
 *   return response.embedding;
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Deterministic mock: hash characters into a 768-dim unit vector
  const vector = new Array(VECTOR_DIM).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) * (i + 1) * 31) % VECTOR_DIM;
      vector[idx] += 1;
    }
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(vector.reduce((sum: number, v: number) => sum + v * v, 0)) || 1;
  return vector.map((v: number) => v / magnitude);
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical direction).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  const denominator = Math.sqrt(magA) * Math.sqrt(magB);
  return denominator === 0 ? 0 : dot / denominator;
}
