/**
 * RAG Engine - Islamic Knowledge Retrieval
 *
 * Vector similarity search over Islamic documents using local embeddings.
 * Supports in-memory search (default) or Qdrant when QDRANT_URL is set.
 */

import { generateEmbedding, cosineSimilarity, EMBEDDING_MODEL, RAG_DEGRADED } from './embedding-service';
import * as fs from 'fs';
import * as path from 'path';

// =============================================================================
// TYPES
// =============================================================================

export interface Citation {
  type: 'quran' | 'hadith' | 'concept';
  reference: string;
  text: string;
  score: number;
  snippet: string;
}

export interface RAGResult {
  answer: string;
  citations: Citation[];
  confidence: number;
}

interface KnowledgeDocument {
  type: 'quran' | 'hadith' | 'concept';
  reference: string;
  text: string;
  keywords: string[];
}

interface IndexedDocument {
  embedding: number[];
  document: KnowledgeDocument;
}

// =============================================================================
// KNOWLEDGE BASE
// =============================================================================

// Core concepts always available (fallback if seed data fails to load)
const CORE_CONCEPTS: KnowledgeDocument[] = [
  {
    type: 'concept',
    reference: 'Sabr (Patience)',
    text: 'Sabr means patience, perseverance, and steadfastness in the face of difficulty. It is one of the highest virtues in Islam. The Quran mentions sabr over 90 times.',
    keywords: ['sabr', 'patience', 'perseverance', 'steadfast', 'endurance', 'waiting', 'difficult'],
  },
  {
    type: 'concept',
    reference: 'Tawakkul (Trust in Allah)',
    text: 'Tawakkul means placing complete trust in Allah while taking practical steps. It is not passive resignation but active reliance on Allah after doing one\'s best.',
    keywords: ['tawakkul', 'trust', 'reliance', 'allah', 'control', 'worry', 'future', 'uncertainty'],
  },
  {
    type: 'concept',
    reference: 'Tawbah (Repentance)',
    text: 'Tawbah means turning back to Allah with sincere repentance. It involves recognizing the wrong, feeling genuine remorse, stopping the sin, and resolving not to return to it.',
    keywords: ['tawbah', 'repentance', 'forgiveness', 'sin', 'guilt', 'shame', 'change', 'regret'],
  },
  {
    type: 'concept',
    reference: 'Dhikr (Remembrance of Allah)',
    text: 'Dhikr is the practice of remembering Allah through phrases like SubhanAllah, Alhamdulillah, and Allahu Akbar. It calms the heart and strengthens the connection with Allah.',
    keywords: ['dhikr', 'remembrance', 'meditation', 'calm', 'anxiety', 'peace', 'mindfulness', 'prayer'],
  },
  {
    type: 'concept',
    reference: 'Shukr (Gratitude)',
    text: 'Shukr means gratitude and thankfulness to Allah. It involves recognizing blessings, feeling grateful in the heart, and expressing thanks through words and actions.',
    keywords: ['shukr', 'gratitude', 'thankful', 'blessing', 'positive', 'appreciation', 'contentment'],
  },
];

// Dynamically loaded from seed data
let KNOWLEDGE_BASE: KnowledgeDocument[] = [...CORE_CONCEPTS];

/**
 * Load knowledge base from seed data JSON files.
 * Expands from ~5 core concepts to 6,236+ Quran verses + adhkar.
 */
function loadSeedData(): void {
  const seedDir = path.join(__dirname, '..', '..', 'shared', 'seed-data');

  // Load Quran verses
  try {
    const versesPath = path.join(seedDir, 'verses.json');
    if (fs.existsSync(versesPath)) {
      const verses: Array<{ surahNumber: number; verseNumber: number; translationEn: string; arabicText: string }> =
        JSON.parse(fs.readFileSync(versesPath, 'utf-8'));
      const surahsPath = path.join(seedDir, 'surahs.json');
      const surahs: Array<{ number: number; nameEnglish: string }> = fs.existsSync(surahsPath)
        ? JSON.parse(fs.readFileSync(surahsPath, 'utf-8'))
        : [];
      const surahMap = new Map(surahs.map(s => [s.number, s.nameEnglish]));

      for (const v of verses) {
        if (!v.translationEn) continue;
        const surahName = surahMap.get(v.surahNumber) || `Surah ${v.surahNumber}`;
        KNOWLEDGE_BASE.push({
          type: 'quran',
          reference: `${surahName} ${v.surahNumber}:${v.verseNumber}`,
          text: v.translationEn,
          keywords: extractKeywords(v.translationEn),
        });
      }
      console.log(`[RAG] Loaded ${verses.length} Quran verses from seed data`);
    }
  } catch (err) {
    console.warn('[RAG] Failed to load Quran verses:', err);
  }

  // Load adhkar
  try {
    const adhkarPath = path.join(seedDir, 'adhkar.json');
    if (fs.existsSync(adhkarPath)) {
      const adhkar: Array<{ category: string; arabic: string; transliteration: string; translation: string; reference: string }> =
        JSON.parse(fs.readFileSync(adhkarPath, 'utf-8'));
      for (const d of adhkar) {
        if (!d.translation) continue;
        KNOWLEDGE_BASE.push({
          type: 'concept',
          reference: `Dhikr: ${d.reference || d.category}`,
          text: `${d.translation} (${d.transliteration || ''})`.trim(),
          keywords: extractKeywords(d.translation),
        });
      }
      console.log(`[RAG] Loaded ${adhkar.length} adhkar from seed data`);
    }
  } catch (err) {
    console.warn('[RAG] Failed to load adhkar:', err);
  }

  console.log(`[RAG] Total knowledge base: ${KNOWLEDGE_BASE.length} documents`);
}

/** Extract simple keywords from text for keyword-based fallback search */
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but', 'or', 'nor', 'not', 'so', 'yet', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same', 'than', 'too', 'very', 'just', 'because', 'if', 'when', 'while', 'how', 'all', 'any', 'about', 'up', 'there', 'their', 'them', 'they', 'this', 'that', 'these', 'those', 'he', 'she', 'it', 'his', 'her', 'its', 'who', 'whom', 'which', 'what', 'where', 'why', 'you', 'your', 'we', 'our', 'i', 'my', 'me']);
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w)).slice(0, 10);
}

// Load seed data on module import
loadSeedData();

// =============================================================================
// STATE
// =============================================================================

const documentIndex = new Map<string, IndexedDocument>();
let indexReady = false;
let indexing = false;
const EMBEDDINGS_PATH = path.join(__dirname, '..', 'data', 'embeddings.json');

// =============================================================================
// INITIALIZATION
// =============================================================================

export async function initializeRAG(): Promise<void> {
  if (indexReady || indexing) return;
  indexing = true;

  try {
    if (loadCachedEmbeddings()) {
      indexReady = true;
      indexing = false;
      console.log(`[RAG] Loaded ${documentIndex.size} cached embeddings`);
      return;
    }

    console.log(`[RAG] Indexing ${KNOWLEDGE_BASE.length} documents...`);
    for (const doc of KNOWLEDGE_BASE) {
      const embedding = await generateEmbedding(doc.text);
      documentIndex.set(doc.reference, { embedding, document: doc });
    }

    saveCachedEmbeddings();
    indexReady = true;
    console.log(`[RAG] Indexed ${documentIndex.size} documents`);
  } catch (err) {
    console.error('[RAG] Indexing failed:', err);
  } finally {
    indexing = false;
  }
}

// =============================================================================
// QUERY ENGINE
// =============================================================================

export async function queryIslamicKnowledge(
  question: string,
  topK: number = 5,
): Promise<RAGResult> {
  if (!question.trim()) {
    return { answer: 'Please ask a question about Islamic teachings.', citations: [], confidence: 0 };
  }

  // If Qdrant is configured, use it
  if (process.env.QDRANT_URL) {
    return queryViaQdrant(question, topK);
  }

  // Otherwise use in-memory vector search
  return queryInMemory(question, topK);
}

async function queryInMemory(question: string, topK: number): Promise<RAGResult> {
  if (!indexReady) {
    await initializeRAG();
  }

  if (documentIndex.size === 0) {
    return {
      answer: 'The knowledge base is still loading. Please try again in a moment.',
      citations: [],
      confidence: 0,
    };
  }

  const queryEmbedding = await generateEmbedding(question);

  const scored: { doc: KnowledgeDocument; score: number }[] = [];
  for (const indexed of Array.from(documentIndex.values())) {
    const score = cosineSimilarity(queryEmbedding, indexed.embedding);
    scored.push({ doc: indexed.document, score });
  }

  scored.sort((a, b) => b.score - a.score);
  const topDocs = scored.slice(0, topK).filter((s) => s.score > 0.1);

  if (topDocs.length === 0) {
    return {
      answer: 'I could not find specific Islamic references for that question. Try asking about patience, anxiety, gratitude, prayer, or forgiveness.',
      citations: [],
      confidence: 0,
    };
  }

  const citations: Citation[] = topDocs.map(({ doc, score }) => ({
    type: doc.type,
    reference: doc.reference,
    text: doc.text,
    score: Math.round(score * 1000) / 1000,
    snippet: doc.text.length > 120 ? doc.text.slice(0, 120) + '...' : doc.text,
  }));

  const confidence = topDocs[0].score;
  const answer = buildAnswer(citations);

  return { answer, citations, confidence };
}

async function queryViaQdrant(question: string, topK: number): Promise<RAGResult> {
  try {
    // @ts-ignore - optional dependency, only needed when QDRANT_URL is set
    const { QdrantClient } = await import('@qdrant/js-client-rest');
    const client = new QdrantClient({ url: process.env.QDRANT_URL });
    const queryEmbedding = await generateEmbedding(question);

    const results = await client.search('islamic_knowledge', {
      vector: queryEmbedding,
      limit: topK,
    });

    if (!results.length) {
      return {
        answer: 'I could not find specific Islamic references for that question.',
        citations: [],
        confidence: 0,
      };
    }

    const citations: Citation[] = results.map((r: any) => ({
      type: r.payload.type,
      reference: r.payload.reference,
      text: r.payload.text,
      score: Math.round(r.score * 1000) / 1000,
      snippet: r.payload.text.length > 120 ? r.payload.text.slice(0, 120) + '...' : r.payload.text,
    }));

    return {
      answer: buildAnswer(citations),
      citations,
      confidence: results[0].score,
    };
  } catch (err) {
    console.error('[RAG] Qdrant query failed, falling back to in-memory:', err);
    return queryInMemory(question, topK);
  }
}

// =============================================================================
// STATUS
// =============================================================================

export function getRAGStatus() {
  return {
    ready: indexReady,
    documentCount: documentIndex.size,
    embeddingModel: EMBEDDING_MODEL,
    mode: process.env.QDRANT_URL ? 'qdrant' as const : 'in-memory' as const,
    degraded: RAG_DEGRADED,
  };
}

export function getDocumentCount(): number {
  return documentIndex.size || KNOWLEDGE_BASE.length;
}

// Keep backward compat
export const RAG_READY = true;

// =============================================================================
// CACHE (embeddings.json)
// =============================================================================

function loadCachedEmbeddings(): boolean {
  try {
    if (!fs.existsSync(EMBEDDINGS_PATH)) return false;

    const data = JSON.parse(fs.readFileSync(EMBEDDINGS_PATH, 'utf-8'));
    if (!Array.isArray(data) || data.length === 0) return false;
    // If cached count differs from current knowledge base, re-index
    if (data.length !== KNOWLEDGE_BASE.length) return false;

    for (const entry of data) {
      const doc = KNOWLEDGE_BASE.find((d) => d.reference === entry.reference);
      if (!doc) continue;
      documentIndex.set(doc.reference, { embedding: entry.embedding, document: doc });
    }

    return documentIndex.size === KNOWLEDGE_BASE.length;
  } catch {
    return false;
  }
}

function saveCachedEmbeddings(): void {
  try {
    const dir = path.dirname(EMBEDDINGS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const entries: Array<[string, IndexedDocument]> = Array.from(documentIndex.entries() as any);
    const data = entries.map(([ref, indexed]) => ({
      reference: ref,
      embedding: indexed.embedding,
    }));

    fs.writeFileSync(EMBEDDINGS_PATH, JSON.stringify(data));
    console.log(`[RAG] Saved embeddings to ${EMBEDDINGS_PATH}`);
  } catch (err) {
    console.warn('[RAG] Failed to save embeddings cache:', err);
  }
}

// =============================================================================
// HELPERS
// =============================================================================

function buildAnswer(citations: Citation[]): string {
  const parts: string[] = ['Based on Islamic teachings:\n'];

  for (const citation of citations) {
    const label =
      citation.type === 'quran' ? `Quran (${citation.reference})`
      : citation.type === 'hadith' ? `Hadith (${citation.reference})`
      : citation.reference;

    parts.push(`- ${label}: "${citation.text}"`);
  }

  parts.push('\nMay Allah grant you peace and understanding.');
  return parts.join('\n');
}
