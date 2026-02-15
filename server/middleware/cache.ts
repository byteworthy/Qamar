import type { Request, Response, NextFunction } from 'express';
import { defaultLogger } from '../utils/logger';

/**
 * Simple in-memory cache for API responses
 *
 * Uses LRU (Least Recently Used) eviction strategy with TTL support.
 * Suitable for caching read-only reference data like Quran metadata.
 *
 * NOTE: This is an in-memory cache that resets on server restart.
 * For production with multiple server instances, consider Redis.
 */

interface CacheEntry {
  data: unknown;
  expiresAt: number;
  key: string;
}

class MemoryCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000;

  set(key: string, data: unknown, ttlSeconds: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt, key });
  }

  get(key: string): unknown | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache stats for monitoring
  getStats(): { size: number; maxSize: number } {
    // Clean up expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// Singleton cache instance
export const memoryCache = new MemoryCache();

/**
 * Cache middleware factory
 *
 * Creates middleware that caches GET request responses.
 *
 * @param ttlSeconds - Time to live in seconds
 * @param keyGenerator - Optional custom cache key generator (defaults to req.originalUrl)
 */
export function cacheMiddleware(
  ttlSeconds: number,
  keyGenerator?: (req: Request) => string
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : `cache:${req.originalUrl}`;

    // Try to get from cache
    const cachedData = memoryCache.get(cacheKey);

    if (cachedData) {
      req.logger?.debug('Cache hit', { cacheKey });
      res.json(cachedData);
      return;
    }

    // Cache miss - intercept res.json to cache the response
    const originalJson = res.json.bind(res);

    res.json = function (data: unknown): Response {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        memoryCache.set(cacheKey, data, ttlSeconds);
        req.logger?.debug('Cache miss - stored', { cacheKey, ttlSeconds });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache entries matching a pattern
 *
 * @param pattern - String or RegExp to match cache keys
 */
export function invalidateCache(pattern: string | RegExp): void {
  const stats = memoryCache.getStats();
  defaultLogger.info('Invalidating cache entries', {
    pattern: pattern.toString(),
    cacheSize: stats.size,
  });

  // Note: This requires accessing private cache which we'll add
  // For now, we'll just clear all cache on bookmark mutations
  memoryCache.clear();
}

/**
 * Cache TTL constants (in seconds)
 */
export const CACHE_TTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
} as const;
