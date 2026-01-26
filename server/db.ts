import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
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

// Graceful shutdown: close pool when process terminates
process.on("SIGTERM", async () => {
  console.log("[DB] SIGTERM received, closing connection pool...");
  try {
    await pool.end();
    console.log("[DB] Connection pool closed successfully");
    process.exit(0);
  } catch (error) {
    console.error("[DB] Error closing pool:", error);
    process.exit(1);
  }
});

// Log pool errors
pool.on("error", (err) => {
  console.error("[DB] Unexpected pool error:", err);
});

export const db = drizzle(pool);
