// Qamar Web App API Client
// Adapted from client/lib/api.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// =============================================================================
// ANALYSIS TYPES
// =============================================================================

export interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
  crisis?: boolean;
  level?: "emergency" | "urgent" | "concern";
}

// =============================================================================
// REFRAME TYPES
// =============================================================================

export interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

// =============================================================================
// REFLECTION TYPES
// =============================================================================

export interface ReflectionHistoryItem {
  id: string;
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
  keyAssumption?: string;
  detectedState?: string;
  anchor?: string;
  userId: string;
  createdAt: Date | string;
}

export interface SaveReflectionData {
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
  anchor: string;
}

export interface SaveReflectionResponse {
  success: boolean;
  detectedState?: string;
}

export interface ReflectionHistoryResponse {
  history: ReflectionHistoryItem[];
  isLimited: boolean;
  limit: number | null;
}

// =============================================================================
// INSIGHTS TYPES
// =============================================================================

export interface InsightSummaryResult {
  available: boolean;
  summary?: string;
  reflectionCount: number;
  generatedAt?: string;
  message?: string;
  requiredCount?: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Analyze a thought for cognitive distortions
 */
export async function analyzeThought(
  thought: string,
  emotionalIntensity?: number,
  somaticAwareness?: string,
): Promise<AnalysisResult> {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // CRITICAL for session cookies
    body: JSON.stringify({ thought, emotionalIntensity, somaticAwareness }),
  });

  if (!res.ok) {
    throw new Error(`Analysis failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Generate a cognitive reframe for the thought
 */
export async function reframeThought(
  thought: string,
  distortions: string[],
  analysis: string,
  emotionalIntensity?: number,
  emotionalState?: string,
): Promise<ReframeResult> {
  const res = await fetch(`${API_URL}/api/reframe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      thought,
      distortions,
      analysis,
      emotionalIntensity,
      emotionalState,
    }),
  });

  if (!res.ok) {
    throw new Error(`Reframe failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Save a completed reflection
 */
export async function saveReflection(
  data: SaveReflectionData,
): Promise<SaveReflectionResponse> {
  const res = await fetch(`${API_URL}/api/reflection/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Save failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get reflection history for the current user
 */
export async function getHistory(): Promise<ReflectionHistoryResponse> {
  const res = await fetch(`${API_URL}/api/reflection/history`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Get history failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Get insight summary (PRO feature)
 */
export async function getInsights(): Promise<InsightSummaryResult> {
  const res = await fetch(`${API_URL}/api/insights/summary`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Get insights failed: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Health check endpoint
 */
export async function healthCheck(): Promise<{
  status: string;
  database?: string;
}> {
  const res = await fetch(`${API_URL}/api/health`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }

  return res.json();
}
