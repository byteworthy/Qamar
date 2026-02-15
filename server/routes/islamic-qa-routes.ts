/**
 * Islamic Q&A API Routes
 *
 * Standalone endpoint for direct Islamic knowledge queries.
 * Works in two modes:
 *   - "search" (default): Pure keyword search, no AI needed, works offline/free
 *   - "ai": Uses Claude to synthesize an answer from retrieved citations
 */

import type { Express, Request, Response } from 'express';
import { z } from 'zod';
import {
  findRelevantContent,
  searchQuran,
  searchHadith,
  getKnowledgeBaseStats,
} from '../services/islamic-knowledge';
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from '../types/error-response';
import { VALIDATION_MODE, isAnthropicConfigured } from '../config';
import { getAnthropicClient } from './constants';

// =============================================================================
// VALIDATION
// =============================================================================

const islamicQaSchema = z.object({
  question: z.string().min(1).max(2000),
  mode: z.enum(['search', 'ai']).optional().default('search'),
  limit: z.number().int().min(1).max(20).optional().default(5),
  source: z.enum(['all', 'quran', 'hadith']).optional().default('all'),
});

// =============================================================================
// ROUTES
// =============================================================================

export function registerIslamicQaRoutes(app: Express): void {
  /**
   * POST /api/islamic-qa
   *
   * Query Islamic knowledge base.
   *
   * Body:
   *   question: string        - The question to search for
   *   mode: 'search' | 'ai'  - search = pure keyword, ai = Claude-synthesized
   *   limit: number           - Max results (1-20, default 5)
   *   source: 'all' | 'quran' | 'hadith' - Filter by source type
   *
   * Response:
   *   { response: string, citations: Array<{type, reference, text}>, mode: string }
   */
  app.post('/api/islamic-qa', async (req: Request, res: Response) => {
    try {
      const parsed = islamicQaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json(
          createErrorResponse(
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.VALIDATION_FAILED,
            req.id,
            'Invalid request',
            { validationErrors: parsed.error.issues },
          ),
        );
      }

      const { question, mode, limit, source } = parsed.data;

      // Get citations based on source filter
      let citations;
      let concepts: string[] = [];

      if (source === 'quran') {
        citations = searchQuran(question, limit);
      } else if (source === 'hadith') {
        citations = searchHadith(question, limit);
      } else {
        const result = findRelevantContent(question, limit);
        citations = result.citations;
        concepts = result.concepts;
      }

      // Format citations for response
      const formattedCitations = citations.map(c => ({
        type: c.type,
        reference: c.reference,
        text: c.english,
        arabic: c.arabic,
        score: c.score,
      }));

      // Search mode: return citations directly with a simple summary
      if (mode === 'search' || !isAnthropicConfigured() || VALIDATION_MODE) {
        const response = buildSearchResponse(formattedCitations, concepts, question);
        return res.json({
          response,
          citations: formattedCitations,
          concepts,
          mode: 'search',
        });
      }

      // AI mode: use Claude to synthesize an answer from citations
      const contextBlock = formattedCitations
        .map((c, i) => `[${i + 1}] ${c.type === 'quran' ? 'Quran' : 'Hadith'} (${c.reference}): "${c.text}"`)
        .join('\n');

      const conceptBlock = concepts.length > 0
        ? `\nRelevant Islamic concepts: ${concepts.join('; ')}`
        : '';

      const systemPrompt = `You are Noor, a knowledgeable Islamic companion. Answer the user's question using ONLY the provided Islamic sources. Cite references inline like (Surah Al-Baqarah 2:286). Be warm, conversational, and accurate. If the sources don't fully answer the question, say so honestly and suggest consulting a scholar.

SOURCES:
${contextBlock}
${conceptBlock}

RULES:
- Only reference information from the provided sources
- Cite each source you use with its reference
- Be conversational, not academic
- If sources are insufficient, acknowledge limitations
- Never fabricate quotes or references`;

      const aiResponse = await getAnthropicClient().messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: question }],
      });

      const firstBlock = aiResponse.content[0];
      const responseText = firstBlock?.type === 'text'
        ? firstBlock.text
        : 'I found some relevant sources but could not generate a full answer. Please review the citations below.';

      return res.json({
        response: responseText,
        citations: formattedCitations,
        concepts,
        mode: 'ai',
      });
    } catch (error) {
      const logger = req.logger || console;
      if (typeof logger.error === 'function') {
        logger.error('Islamic QA failed', error);
      }
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json(
        createErrorResponse(
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.INTERNAL_ERROR,
          req.id,
          'Failed to process Islamic QA query',
        ),
      );
    }
  });

  /**
   * GET /api/islamic-qa/stats
   *
   * Returns knowledge base statistics.
   */
  app.get('/api/islamic-qa/stats', (_req: Request, res: Response) => {
    const stats = getKnowledgeBaseStats();
    return res.json({
      ...stats,
      totalDocuments: stats.verses + stats.hadiths,
      searchMode: 'keyword',
    });
  });
}

// =============================================================================
// HELPERS
// =============================================================================

function buildSearchResponse(
  citations: Array<{ type: string; reference: string; text: string }>,
  concepts: string[],
  question: string,
): string {
  if (citations.length === 0) {
    return `I could not find specific Quran verses or hadiths matching "${question}". Try searching with different terms, or ask about topics like patience, gratitude, forgiveness, trust in Allah, or prayer.`;
  }

  const parts: string[] = [];

  if (concepts.length > 0) {
    parts.push(`Your question relates to: ${concepts.join('; ')}`);
    parts.push('');
  }

  parts.push('Here are relevant Islamic sources:');
  parts.push('');

  for (const cite of citations) {
    const label = cite.type === 'quran' ? `Quran (${cite.reference})` : `Hadith (${cite.reference})`;
    parts.push(`${label}: "${cite.text}"`);
    parts.push('');
  }

  parts.push('For detailed guidance, please consult a trusted scholar.');

  return parts.join('\n');
}
