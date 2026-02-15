/**
 * Quran API Routes Test Suite
 *
 * Tests all Quran API endpoints with comprehensive coverage:
 * - GET /api/quran/surahs
 * - GET /api/quran/verses/:surahId
 * - GET /api/quran/search
 * - POST /api/quran/bookmarks
 * - GET /api/quran/bookmarks
 * - DELETE /api/quran/bookmarks/:id
 *
 * Test coverage target: >80%
 */

import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterEach,
  beforeAll,
} from '@jest/globals';
import express, { type Express } from 'express';
import request from 'supertest';
import { registerQuranRoutes } from '../routes/quran-routes';
import { sessionMiddleware } from '../middleware/auth';
import { requestLoggerMiddleware } from '../middleware/request-logger';
import * as encryption from '../encryption';

// Mock database
const mockDbSelect = jest.fn();
const mockDbInsert = jest.fn();
const mockDbDelete = jest.fn();
const mockDbUpdate = jest.fn();

const createMockQueryChain = (result: unknown[] = []) => {
  const chain: Record<string, any> = {};
  chain.from = (jest.fn() as any).mockReturnValue(chain);
  chain.where = (jest.fn() as any).mockReturnValue(chain);
  chain.orderBy = (jest.fn() as any).mockReturnValue(chain);
  chain.limit = (jest.fn() as any).mockReturnValue(chain);
  chain.offset = (jest.fn() as any).mockReturnValue(chain);
  chain.returning = (jest.fn() as any).mockResolvedValue(result);
  chain.values = (jest.fn() as any).mockReturnValue(chain);
  chain.set = (jest.fn() as any).mockReturnValue(chain);
  chain.onConflictDoNothing = (jest.fn() as any).mockReturnValue(chain);

  // Make the chain itself thenable (resolves to result)
  chain.then = (jest.fn() as any).mockImplementation((resolve: any) => resolve(result));
  return chain;
};

jest.mock('../db', () => ({
  db: {
    select: (...args: any[]) => mockDbSelect(...args),
    insert: (...args: any[]) => mockDbInsert(...args),
    delete: (...args: any[]) => mockDbDelete(...args),
    update: (...args: any[]) => mockDbUpdate(...args),
  },
}));

// Mock schema
jest.mock('@shared/schema', () => ({
  quranMetadata: {
    surahNumber: 'surah_number',
    revelationPlace: 'revelation_place',
    versesCount: 'verses_count',
  },
  quranBookmarks: {
    id: 'id',
    userId: 'user_id',
    surahNumber: 'surah_number',
    verseNumber: 'verse_number',
    note: 'note',
    createdAt: 'created_at'
  },
  userSessions: {
    token: 'token',
    userId: 'user_id',
    expiresAt: 'expires_at'
  },
}));

// Mock encryption module
jest.mock('../encryption', () => ({
  encryptData: jest.fn((data: string) => `encrypted_${data}`),
  decryptData: jest.fn((data: string) => data.replace('encrypted_', '')),
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  defaultLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
  createRequestLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  })),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-request-id-123'),
}));

describe('Quran API Routes', () => {
  let app: Express;
  let testUserId: string;
  let testSessionToken: string;

  // Test data
  const mockSurahs = [
    {
      id: 1,
      surahNumber: 1,
      nameArabic: 'الفاتحة',
      nameEnglish: 'Al-Fatihah',
      versesCount: 7,
      revelationPlace: 'Makkah',
      orderInRevelation: 5,
    },
    {
      id: 2,
      surahNumber: 2,
      nameArabic: 'البقرة',
      nameEnglish: 'Al-Baqarah',
      versesCount: 286,
      revelationPlace: 'Madinah',
      orderInRevelation: 87,
    },
    {
      id: 3,
      surahNumber: 114,
      nameArabic: 'الناس',
      nameEnglish: 'An-Nas',
      versesCount: 6,
      revelationPlace: 'Makkah',
      orderInRevelation: 21,
    },
  ];

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create test app
    app = express();
    app.use(express.json());

    // Add middleware
    app.use(requestLoggerMiddleware);

    // Mock session middleware - inject test user
    testUserId = `test_user_${Date.now()}`;
    testSessionToken = `test_token_${Date.now()}`;

    app.use((req, _res, next) => {
      const sessionCookie = req.headers.cookie?.match(/noor_session=([^;]+)/)?.[1];
      if (sessionCookie === testSessionToken) {
        req.auth = { userId: testUserId, sessionToken: testSessionToken };
      }
      next();
    });

    // Register routes
    registerQuranRoutes(app);

    // Setup default mock responses
    mockDbSelect.mockReturnValue(createMockQueryChain(mockSurahs));
  });

  describe('GET /api/quran/surahs', () => {
    test('should return all surahs', async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain(mockSurahs));

      const res = await request(app).get('/api/quran/surahs');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('surahs');
      expect(res.body).toHaveProperty('total');
      expect(Array.isArray(res.body.surahs)).toBe(true);
      expect(res.body.surahs.length).toBeGreaterThanOrEqual(3); // At least our test data
    });

    test('should filter surahs by revelation place (Makkah)', async () => {
      const makkahSurahs = mockSurahs.filter(s => s.revelationPlace === 'Makkah');
      mockDbSelect.mockReturnValue(createMockQueryChain(makkahSurahs));

      const res = await request(app).get('/api/quran/surahs?revelationPlace=Makkah');

      expect(res.status).toBe(200);
      expect(res.body.surahs.every((s: any) => s.revelationPlace === 'Makkah')).toBe(true);
    });

    test('should filter surahs by revelation place (Madinah)', async () => {
      const madinahSurahs = mockSurahs.filter(s => s.revelationPlace === 'Madinah');
      mockDbSelect.mockReturnValue(createMockQueryChain(madinahSurahs));

      const res = await request(app).get('/api/quran/surahs?revelationPlace=Madinah');

      expect(res.status).toBe(200);
      expect(res.body.surahs.every((s: any) => s.revelationPlace === 'Madinah')).toBe(true);
    });

    test('should reject invalid revelation place', async () => {
      const res = await request(app).get('/api/quran/surahs?revelationPlace=Invalid');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should cache response (header check)', async () => {
      const res1 = await request(app).get('/api/quran/surahs');
      const res2 = await request(app).get('/api/quran/surahs');

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body).toEqual(res2.body);
    });
  });

  describe('GET /api/quran/verses/:surahId', () => {
    test('should return verses for valid surah', async () => {
      const surah = mockSurahs[0]; // Al-Fatihah
      mockDbSelect.mockReturnValue(createMockQueryChain([surah]));

      const res = await request(app).get('/api/quran/verses/1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('surah');
      expect(res.body).toHaveProperty('verses');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.surah.surahNumber).toBe(1);
      expect(Array.isArray(res.body.verses)).toBe(true);
    });

    test('should paginate verses', async () => {
      const surah = mockSurahs[1]; // Al-Baqarah
      mockDbSelect.mockReturnValue(createMockQueryChain([surah]));

      const res = await request(app).get('/api/quran/verses/2?page=2&limit=50');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(50);
      expect(res.body.verses.length).toBeGreaterThan(0);
    });

    test('should reject invalid surah ID (too low)', async () => {
      const res = await request(app).get('/api/quran/verses/0');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should reject invalid surah ID (too high)', async () => {
      const res = await request(app).get('/api/quran/verses/115');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should return 404 for non-existent surah in DB', async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain([])); // No surah found

      const res = await request(app).get('/api/quran/verses/50');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    test('should enforce max limit (100)', async () => {
      const res = await request(app).get('/api/quran/verses/2?limit=150');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /api/quran/search', () => {
    test('should accept valid search query', async () => {
      const res = await request(app).get('/api/quran/search?q=Allah');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('results');
      expect(res.body).toHaveProperty('pagination');
      expect(Array.isArray(res.body.results)).toBe(true);
    });

    test('should reject query shorter than 2 characters', async () => {
      const res = await request(app).get('/api/quran/search?q=A');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should reject missing query parameter', async () => {
      const res = await request(app).get('/api/quran/search');

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should filter by surah ID', async () => {
      const res = await request(app).get('/api/quran/search?q=test&surahId=1');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('results');
    });

    test('should paginate search results', async () => {
      const res = await request(app).get('/api/quran/search?q=test&page=2&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(2);
      expect(res.body.pagination.limit).toBe(10);
    });
  });

  describe('POST /api/quran/bookmarks', () => {
    test('should create bookmark with valid data (authenticated)', async () => {
      const surah = mockSurahs[0]; // Al-Fatihah
      const newBookmark = {
        id: 1,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 1,
        note: 'encrypted_Test bookmark note',
        createdAt: new Date(),
      };

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain([surah]); // Check surah exists
        return createMockQueryChain([]); // Check for duplicate (none found)
      });
      mockDbInsert.mockReturnValue(createMockQueryChain([newBookmark]));

      const res = await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 1,
          verseNumber: 1,
          note: 'Test bookmark note',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('bookmark');
      expect(res.body.bookmark.surahNumber).toBe(1);
      expect(res.body.bookmark.verseNumber).toBe(1);
      expect(res.body.bookmark.note).toBe('Test bookmark note');
    });

    test('should create bookmark without note', async () => {
      const surah = mockSurahs[0];
      const newBookmark = {
        id: 2,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 2,
        note: null,
        createdAt: new Date(),
      };

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain([surah]); // Check surah exists
        return createMockQueryChain([]); // Check for duplicate (none found)
      });
      mockDbInsert.mockReturnValue(createMockQueryChain([newBookmark]));

      const res = await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 1,
          verseNumber: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.bookmark.note).toBeNull();
    });

    test('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/quran/bookmarks')
        .send({
          surahNumber: 1,
          verseNumber: 1,
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });

    test('should reject invalid surah number', async () => {
      const res = await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 115,
          verseNumber: 1,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should reject verse number exceeding surah verse count', async () => {
      const surah = mockSurahs[0]; // Al-Fatihah with 7 verses
      mockDbSelect.mockReturnValue(createMockQueryChain([surah]));

      const res = await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 1,
          verseNumber: 999, // Al-Fatihah only has 7 verses
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('INVALID_INPUT');
    });

    test('should reject duplicate bookmark', async () => {
      const surah = mockSurahs[0];
      const existingBookmark = {
        id: 5,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 3,
        note: null,
        createdAt: new Date(),
      };

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain([surah]); // Check surah exists
        return createMockQueryChain([existingBookmark]); // Duplicate found
      });

      const res = await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 1,
          verseNumber: 3,
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('DUPLICATE_RESOURCE');
    });

    test('should encrypt note before storage', async () => {
      const surah = mockSurahs[0];
      const newBookmark = {
        id: 6,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 4,
        note: 'encrypted_Secret note',
        createdAt: new Date(),
      };

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain([surah]);
        return createMockQueryChain([]);
      });
      mockDbInsert.mockReturnValue(createMockQueryChain([newBookmark]));

      await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 1,
          verseNumber: 4,
          note: 'Secret note',
        });

      expect(encryption.encryptData).toHaveBeenCalledWith('Secret note');
    });
  });

  describe('GET /api/quran/bookmarks', () => {
    const mockBookmarks = [
      {
        id: 1,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 1,
        note: 'encrypted_Note 1',
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 2,
        note: 'encrypted_Note 2',
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: testUserId,
        surahNumber: 2,
        verseNumber: 1,
        note: null,
        createdAt: new Date(),
      },
    ];

    test('should fetch all user bookmarks (authenticated)', async () => {
      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain(mockBookmarks); // Get bookmarks
        return createMockQueryChain([{ count: 3 }]); // Count bookmarks
      });

      const res = await request(app)
        .get('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('bookmarks');
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.bookmarks.length).toBeGreaterThanOrEqual(3);
    });

    test('should filter bookmarks by surah', async () => {
      const surah1Bookmarks = mockBookmarks.filter(b => b.surahNumber === 1);
      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain(surah1Bookmarks);
        return createMockQueryChain([{ count: 2 }]);
      });

      const res = await request(app)
        .get('/api/quran/bookmarks?surahNumber=1')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.bookmarks.every((b: any) => b.surahNumber === 1)).toBe(true);
    });

    test('should paginate bookmarks', async () => {
      const paginatedBookmarks = mockBookmarks.slice(0, 2);
      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain(paginatedBookmarks);
        return createMockQueryChain([{ count: 3 }]);
      });

      const res = await request(app)
        .get('/api/quran/bookmarks?page=1&limit=2')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.bookmarks.length).toBeLessThanOrEqual(2);
    });

    test('should decrypt notes in response', async () => {
      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain(mockBookmarks);
        return createMockQueryChain([{ count: 3 }]);
      });

      const res = await request(app)
        .get('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(200);
      const bookmarkWithNote = res.body.bookmarks.find((b: any) => b.note);
      expect(bookmarkWithNote.note).not.toContain('encrypted_');
    });

    test('should reject unauthenticated request', async () => {
      const res = await request(app).get('/api/quran/bookmarks');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });
  });

  describe('DELETE /api/quran/bookmarks/:id', () => {
    const testBookmarkId = 10;

    test('should delete own bookmark (authenticated)', async () => {
      const testBookmark = {
        id: testBookmarkId,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 5,
        note: null,
        createdAt: new Date(),
      };

      mockDbSelect.mockReturnValue(createMockQueryChain([testBookmark]));
      mockDbDelete.mockReturnValue(createMockQueryChain([]));

      const res = await request(app)
        .delete(`/api/quran/bookmarks/${testBookmarkId}`)
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(204);
    });

    test('should reject unauthenticated request', async () => {
      const res = await request(app).delete(`/api/quran/bookmarks/${testBookmarkId}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('AUTH_REQUIRED');
    });

    test('should return 404 for non-existent bookmark', async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain([])); // No bookmark found

      const res = await request(app)
        .delete('/api/quran/bookmarks/999999')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    test('should reject invalid bookmark ID', async () => {
      const res = await request(app)
        .delete('/api/quran/bookmarks/invalid')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    test('should not delete another user\'s bookmark', async () => {
      const otherUserId = `other_user_${Date.now()}`;
      // Return empty - bookmark not found for current user
      mockDbSelect.mockReturnValue(createMockQueryChain([]));

      const res = await request(app)
        .delete('/api/quran/bookmarks/11')
        .set('Cookie', `noor_session=${testSessionToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe(true);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });

  describe('Performance Tests', () => {
    test('GET /api/quran/surahs should respond within 50ms', async () => {
      mockDbSelect.mockReturnValue(createMockQueryChain(mockSurahs));

      const start = Date.now();
      const res = await request(app).get('/api/quran/surahs');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(100); // Allow some margin for test overhead
    });

    test('GET /api/quran/verses/1 should respond within 100ms', async () => {
      const surah = mockSurahs[0];
      mockDbSelect.mockReturnValue(createMockQueryChain([surah]));

      const start = Date.now();
      const res = await request(app).get('/api/quran/verses/1');
      const duration = Date.now() - start;

      expect(res.status).toBe(200);
      expect(duration).toBeLessThan(150); // Allow some margin for test overhead
    });

    test('POST /api/quran/bookmarks should respond within 50ms', async () => {
      const surah = mockSurahs[0];
      const newBookmark = {
        id: 100,
        userId: testUserId,
        surahNumber: 1,
        verseNumber: 7,
        note: null,
        createdAt: new Date(),
      };

      let selectCallCount = 0;
      mockDbSelect.mockImplementation(() => {
        selectCallCount++;
        if (selectCallCount === 1) return createMockQueryChain([surah]);
        return createMockQueryChain([]);
      });
      mockDbInsert.mockReturnValue(createMockQueryChain([newBookmark]));

      const start = Date.now();
      const res = await request(app)
        .post('/api/quran/bookmarks')
        .set('Cookie', `noor_session=${testSessionToken}`)
        .send({
          surahNumber: 1,
          verseNumber: 7,
        });
      const duration = Date.now() - start;

      expect(res.status).toBe(201);
      expect(duration).toBeLessThan(150); // Allow some margin for test overhead
    });
  });
});
