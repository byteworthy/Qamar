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

const KNOWLEDGE_BASE: KnowledgeDocument[] = [
  // --- Quran Verses ---
  {
    type: 'quran',
    reference: 'Al-Baqarah 2:286',
    text: 'Allah does not burden a soul beyond that it can bear.',
    keywords: ['burden', 'soul', 'bear', 'hardship', 'struggle', 'difficulty', 'capacity', 'overwhelm'],
  },
  {
    type: 'quran',
    reference: 'Ash-Sharh 94:5-6',
    text: 'Verily, with hardship comes ease. Verily, with hardship comes ease.',
    keywords: ['hardship', 'ease', 'difficulty', 'relief', 'patience', 'struggle', 'hope'],
  },
  {
    type: 'quran',
    reference: 'Al-Baqarah 2:153',
    text: 'O you who believe, seek help through patience and prayer. Indeed, Allah is with the patient.',
    keywords: ['patience', 'prayer', 'sabr', 'help', 'salah', 'steadfast', 'perseverance'],
  },
  {
    type: 'quran',
    reference: "Ar-Ra'd 13:28",
    text: 'Verily, in the remembrance of Allah do hearts find rest.',
    keywords: ['remembrance', 'dhikr', 'heart', 'rest', 'peace', 'calm', 'tranquility', 'anxiety'],
  },
  {
    type: 'quran',
    reference: 'At-Talaq 65:2-3',
    text: 'And whoever fears Allah, He will make for him a way out. And will provide for him from where he does not expect.',
    keywords: ['taqwa', 'fear', 'allah', 'provision', 'trust', 'way out', 'solution', 'hope'],
  },
  {
    type: 'quran',
    reference: 'Al-Ankabut 29:2-3',
    text: 'Do people think they will be left alone because they say "We believe" and will not be tested?',
    keywords: ['test', 'trial', 'faith', 'believe', 'struggle', 'tribulation', 'challenge'],
  },
  {
    type: 'quran',
    reference: 'Az-Zumar 39:53',
    text: 'Say, O My servants who have transgressed against themselves: do not despair of the mercy of Allah. Indeed, Allah forgives all sins.',
    keywords: ['mercy', 'forgiveness', 'sin', 'despair', 'hope', 'guilt', 'repentance', 'tawbah'],
  },
  {
    type: 'quran',
    reference: 'Al-Imran 3:139',
    text: 'Do not lose heart and do not grieve, for you will have the upper hand if you are believers.',
    keywords: ['grief', 'sadness', 'heart', 'believe', 'hope', 'strength', 'depression', 'loss'],
  },
  {
    type: 'quran',
    reference: 'Al-Hadid 57:22-23',
    text: 'No calamity befalls on the earth or in yourselves but it is inscribed in the Book of Decrees before We bring it into existence.',
    keywords: ['qadr', 'decree', 'calamity', 'destiny', 'predestination', 'acceptance', 'fate'],
  },
  {
    type: 'quran',
    reference: 'Taha 20:46',
    text: 'Allah said: Fear not. Indeed, I am with you both; I hear and I see.',
    keywords: ['fear', 'anxiety', 'allah', 'presence', 'comfort', 'support', 'alone', 'lonely'],
  },

  // --- Hadiths ---
  {
    type: 'hadith',
    reference: 'Sahih Muslim 2999',
    text: 'How wonderful is the affair of the believer, for his affairs are all good. If something good happens to him, he is thankful and that is good for him. If something bad happens, he bears it with patience and that is good for him.',
    keywords: ['patience', 'gratitude', 'shukr', 'sabr', 'good', 'bad', 'believer', 'trial'],
  },
  {
    type: 'hadith',
    reference: 'Sahih Bukhari 5641',
    text: 'No fatigue, illness, anxiety, sorrow, harm, or sadness afflicts any Muslim, even the prick of a thorn, but that Allah will expiate some of his sins because of it.',
    keywords: ['fatigue', 'illness', 'anxiety', 'sorrow', 'sadness', 'sin', 'expiation', 'suffering', 'pain'],
  },
  {
    type: 'hadith',
    reference: 'Jami at-Tirmidhi 2398',
    text: 'When Allah loves a servant, He tests him.',
    keywords: ['test', 'trial', 'love', 'allah', 'difficulty', 'purpose', 'meaning'],
  },
  {
    type: 'hadith',
    reference: 'Sahih Bukhari 6011',
    text: 'The believers, in their mutual love, mercy, and compassion, are like one body. When one limb aches, the whole body reacts with sleeplessness and fever.',
    keywords: ['community', 'ummah', 'love', 'mercy', 'compassion', 'support', 'connection', 'loneliness'],
  },
  {
    type: 'hadith',
    reference: 'Sahih Muslim 2713',
    text: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and being overpowered by men.',
    keywords: ['dua', 'prayer', 'anxiety', 'sorrow', 'weakness', 'supplication', 'refuge', 'stress'],
  },
  {
    type: 'hadith',
    reference: 'Sunan Ibn Majah 3866',
    text: 'The supplication of a distressed person: O Allah, I hope for Your mercy. Do not leave me to myself even for the blink of an eye. Rectify all my affairs.',
    keywords: ['dua', 'distress', 'mercy', 'supplication', 'help', 'crisis', 'desperate'],
  },

  // --- Islamic Concepts ---
  {
    type: 'concept',
    reference: 'Sabr (Patience)',
    text: 'Sabr means patience, perseverance, and steadfastness in the face of difficulty. It is one of the highest virtues in Islam. The Quran mentions sabr over 90 times. It includes patience in obedience, patience in avoiding sin, and patience during trials.',
    keywords: ['sabr', 'patience', 'perseverance', 'steadfast', 'endurance', 'waiting', 'difficult'],
  },
  {
    type: 'concept',
    reference: 'Tawakkul (Trust in Allah)',
    text: 'Tawakkul means placing complete trust in Allah while taking practical steps. It is not passive resignation but active reliance on Allah after doing one\'s best. The Prophet said: "Tie your camel and then trust in Allah."',
    keywords: ['tawakkul', 'trust', 'reliance', 'allah', 'control', 'worry', 'future', 'uncertainty'],
  },
  {
    type: 'concept',
    reference: 'Tawbah (Repentance)',
    text: 'Tawbah means turning back to Allah with sincere repentance. It involves recognizing the wrong, feeling genuine remorse, stopping the sin, and resolving not to return to it. Allah loves those who repent.',
    keywords: ['tawbah', 'repentance', 'forgiveness', 'sin', 'guilt', 'shame', 'change', 'regret'],
  },
  {
    type: 'concept',
    reference: 'Dhikr (Remembrance of Allah)',
    text: 'Dhikr is the practice of remembering Allah through phrases like SubhanAllah, Alhamdulillah, and Allahu Akbar. It calms the heart, reduces anxiety, and strengthens the connection with Allah. It can be done at any time.',
    keywords: ['dhikr', 'remembrance', 'meditation', 'calm', 'anxiety', 'peace', 'mindfulness', 'prayer'],
  },
  {
    type: 'concept',
    reference: 'Shukr (Gratitude)',
    text: 'Shukr means gratitude and thankfulness to Allah. It involves recognizing blessings, feeling grateful in the heart, and expressing thanks through words and actions. Gratitude increases blessings and improves mental well-being.',
    keywords: ['shukr', 'gratitude', 'thankful', 'blessing', 'positive', 'appreciation', 'contentment'],
  },
];

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
    if (!Array.isArray(data) || data.length !== KNOWLEDGE_BASE.length) return false;

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
