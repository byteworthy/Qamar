import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { defaultLogger } from "./utils/logger";
import { VALIDATION_MODE } from "./config";
const { Pool } = pkg;

/**
 * PostgreSQL connection pool with production-ready configuration
 * - Max 20 connections to prevent exhaustion
 * - 30s idle timeout to release unused connections
 * - 2s connection timeout for fail-fast behavior
 * - Graceful shutdown on SIGTERM
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Fail fast if can't connect within 2s
  // Railway PostgreSQL typically doesn't require SSL config
});

// Graceful shutdown: close pool when process terminates (5s timeout)
process.on("SIGTERM", async () => {
  defaultLogger.info("[DB] SIGTERM received, closing connection pool...");
  if (poolMonitorInterval) clearInterval(poolMonitorInterval);
  try {
    const SHUTDOWN_TIMEOUT_MS = 5000;
    await Promise.race([
      pool.end(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Pool shutdown timed out after 5s")),
          SHUTDOWN_TIMEOUT_MS,
        ),
      ),
    ]);
    defaultLogger.info("[DB] Connection pool closed successfully");
    process.exit(0);
  } catch (error) {
    defaultLogger.error(
      "[DB] Error closing pool",
      error instanceof Error ? error : new Error(String(error)),
    );
    process.exit(1);
  }
});

// Log pool errors
pool.on("error", (err) => {
  defaultLogger.error(
    "[DB] Unexpected pool error",
    err instanceof Error ? err : new Error(String(err)),
  );
});

// Pool health monitoring: log stats every 60s (skip in VALIDATION_MODE/tests)
let poolMonitorInterval: ReturnType<typeof setInterval> | undefined;
if (!VALIDATION_MODE) {
  poolMonitorInterval = setInterval(() => {
    defaultLogger.debug("[DB] Pool stats", {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
    });
  }, 60_000);
  poolMonitorInterval.unref(); // Don't prevent process exit
}

export const db = drizzle(pool);
