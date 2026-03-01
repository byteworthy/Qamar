/**
 * Halaqah Session Store
 *
 * In-memory session management for halaqah (learning circle) conversations.
 * Tracks conversation history, topics explored, and follow-up depth per session.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface HalaqahSessionContext {
  history: { role: "user" | "assistant"; content: string }[];
  topicsExplored: string[];
  scholarlyNotesCount: number;
  lastAccess: number;
}

// =============================================================================
// SESSION STORE
// =============================================================================

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

const sessions = new Map<string, HalaqahSessionContext>();

/**
 * Get or create a halaqah session by ID
 */
export function getOrCreateHalaqahSession(
  sessionId: string,
): HalaqahSessionContext {
  const existing = sessions.get(sessionId);
  if (existing) {
    existing.lastAccess = Date.now();
    return existing;
  }

  const session: HalaqahSessionContext = {
    history: [],
    topicsExplored: [],
    scholarlyNotesCount: 0,
    lastAccess: Date.now(),
  };
  sessions.set(sessionId, session);
  return session;
}

/**
 * Update a halaqah session's context
 */
export function updateHalaqahSession(
  sessionId: string,
  updates: Partial<HalaqahSessionContext>,
): void {
  const session = sessions.get(sessionId);
  if (!session) return;

  Object.assign(session, updates, { lastAccess: Date.now() });
}

/**
 * Clean up expired halaqah sessions
 */
export function cleanupHalaqahSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastAccess > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupHalaqahSessions, 5 * 60 * 1000);
