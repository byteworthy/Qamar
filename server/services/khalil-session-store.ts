/**
 * Khalil Session Store
 *
 * In-memory session management for Khalil conversations.
 * Tracks conversation history and state per session with TTL cleanup.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface KhalilSessionContext {
  history: { role: "user" | "assistant"; content: string }[];
  state: "listening" | "exploring" | "basira" | "dhikr" | "muhasaba";
  whispersFound: string[];
  clarityGained: string[];
  lastAccess: number;
}

// =============================================================================
// SESSION STORE
// =============================================================================

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const sessions = new Map<string, KhalilSessionContext>();

/**
 * Get or create a session by ID
 */
export function getOrCreateSession(sessionId: string): KhalilSessionContext {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.lastAccess = Date.now();
    return existing;
  }

  const session: KhalilSessionContext = {
    history: [],
    state: "listening",
    whispersFound: [],
    clarityGained: [],
    lastAccess: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

/**
 * Update a session's context
 */
export function updateSession(
  sessionId: string,
  updates: Partial<KhalilSessionContext>,
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  Object.assign(session, updates, { lastAccess: Date.now() });
}

/**
 * Clean up expired sessions
 */
export function cleanupSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastAccess > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupSessions, 5 * 60 * 1000);
