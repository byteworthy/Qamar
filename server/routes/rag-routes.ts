import type { Express, Request, Response } from 'express';
import { queryIslamicKnowledge, getRAGStatus, initializeRAG } from '../services/rag-engine';

/**
 * RAG API Routes
 *
 * Provides endpoints for querying the Islamic knowledge base
 * and checking RAG system status.
 */
export function registerRagRoutes(app: Express): void {
  // Start indexing on registration (non-blocking)
  initializeRAG().catch((err) => console.error('[RAG] Background init failed:', err));

  // Query the Islamic knowledge base
  app.post('/api/rag/query', async (req: Request, res: Response) => {
    try {
      const { question, topK } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'A non-empty "question" string is required.' });
      }

      const k = typeof topK === 'number' && topK > 0 ? Math.min(topK, 10) : 5;
      const result = await queryIslamicKnowledge(question.trim(), k);

      return res.json({
        answer: result.answer,
        citations: result.citations.map((c) => ({
          source: `${c.type}:${c.reference}`,
          score: c.score,
          snippet: c.snippet,
        })),
        confidence: result.confidence,
      });
    } catch (error) {
      console.error('[RAG] Query error:', error);
      return res.status(500).json({ error: 'Failed to process RAG query.' });
    }
  });

  // Check RAG system status
  app.get('/api/rag/status', (_req: Request, res: Response) => {
    return res.json(getRAGStatus());
  });
}
