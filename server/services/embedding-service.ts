/**
 * Embedding Service for RAG System
 *
 * Uses @xenova/transformers to run all-MiniLM-L6-v2 locally (384-dim, 22MB).
 * Falls back to deterministic mock embeddings if model fails to load.
 */

let pipeline: any = null;
let extractor: any = null;
let loadFailed = false;

export const EMBEDDING_MODEL = 'Xenova/all-MiniLM-L6-v2';
export const VECTOR_DIM = 384;
export let RAG_DEGRADED = false;

// ---------------------------------------------------------------------------
// Model Loading (lazy, cached)
// ---------------------------------------------------------------------------

async function getExtractor(): Promise<any> {
  if (extractor) return extractor;
  if (loadFailed) return null;

  try {
    if (!pipeline) {
      const transformers = await import('@xenova/transformers');
      pipeline = transformers.pipeline;
    }
    extractor = await pipeline('feature-extraction', EMBEDDING_MODEL, {
      quantized: true,
    });
    console.log('[Embedding] Model loaded:', EMBEDDING_MODEL);
    return extractor;
  } catch (err) {
    console.warn('[Embedding] Model load failed, using mock embeddings:', err);
    loadFailed = true;
    RAG_DEGRADED = true;
    return null;
  }
}

// ---------------------------------------------------------------------------
// Embedding Generation
// ---------------------------------------------------------------------------

export async function generateEmbedding(text: string): Promise<number[]> {
  const ext = await getExtractor();
  if (!ext) return mockEmbedding(text);

  try {
    const output = await ext(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data as Float32Array);
  } catch (err) {
    console.warn('[Embedding] Inference failed, falling back to mock:', err);
    RAG_DEGRADED = true;
    return mockEmbedding(text);
  }
}

// ---------------------------------------------------------------------------
// Cosine Similarity
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Mock Fallback (deterministic hash-based)
// ---------------------------------------------------------------------------

function mockEmbedding(text: string): number[] {
  const vector = new Array(VECTOR_DIM).fill(0);
  const words = text.toLowerCase().split(/\s+/);

  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) * (i + 1) * 31) % VECTOR_DIM;
      vector[idx] += 1;
    }
  }

  const magnitude = Math.sqrt(vector.reduce((sum: number, v: number) => sum + v * v, 0)) || 1;
  return vector.map((v: number) => v / magnitude);
}
