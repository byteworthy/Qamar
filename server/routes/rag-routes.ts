import type { Express, Request, Response } from 'express';
import { queryIslamicKnowledge, RAG_READY, getDocumentCount } from '../services/rag-engine';
import { EMBEDDING_MODEL } from '../services/embedding-service';

/**
 * RAG API Routes
 *
 * Provides endpoints for querying the Islamic knowledge base
 * and checking RAG system status.
 */
export function registerRagRoutes(app: Express): void {
  // Query the Islamic knowledge base
  app.post('/api/rag/query', async (req: Request, res: Response) => {
    try {
      const { question, topK } = req.body;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        return res.status(400).json({ error: 'A non-empty "question" string is required.' });
      }

      const k = typeof topK === 'number' && topK > 0 ? Math.min(topK, 10) : 3;
      const result = await queryIslamicKnowledge(question.trim(), k);

      return res.json(result);
    } catch (error) {
      console.error('[RAG] Query error:', error);
      return res.status(500).json({ error: 'Failed to process RAG query.' });
    }
  });

  // Check RAG system status
  app.get('/api/rag/status', (_req: Request, res: Response) => {
    return res.json({
      ready: RAG_READY,
      documentsIndexed: getDocumentCount(),
      embeddingModel: EMBEDDING_MODEL,
    });
  });
}
