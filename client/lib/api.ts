import { getApiUrl, apiRequest } from "./query-client";

// =============================================================================
// CRISIS DETECTION TYPES
// =============================================================================

export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
}

export interface CrisisData {
  title: string;
  message: string;
  resources: CrisisResource[];
  islamicContext: string;
}

// =============================================================================
// ANALYSIS TYPES
// =============================================================================

export interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
  // Crisis detection fields
  crisis?: boolean;
  level?: 'emergency' | 'urgent' | 'concern';
  resources?: CrisisData;
}

export interface AnalyzeParams {
  thought: string;
  emotionalIntensity?: number;  // 1-5 scale from emotional anchoring
  somaticAwareness?: string;    // Body sensation from somatic prompt
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

export interface ReframeParams {
  thought: string;
  distortions: string[];
  analysis: string;
  emotionalIntensity?: number;
  emotionalState?: string;
}

// =============================================================================
// PRACTICE TYPES
// =============================================================================

export interface PracticeResult {
  title: string;
  steps: string[];
  reminder: string;
  duration: string;
}

// =============================================================================
// DUA TYPES (PRO ONLY)
// =============================================================================

export interface DuaResult {
  state: string;
  dua: {
    arabic: string;
    transliteration: string;
    meaning: string;
  };
}

// =============================================================================
// INSIGHTS TYPES (PRO ONLY)
// =============================================================================

export interface InsightSummaryResult {
  available: boolean;
  summary?: string;
  reflectionCount: number;
  generatedAt?: string;
  message?: string;
  requiredCount?: number;
}

export interface AssumptionResult {
  text: string;
  count: number;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Analyze a thought for cognitive distortions
 * Includes crisis detection - will return crisis resources if detected
 */
export async function analyzeThought(
  thought: string,
  emotionalIntensity?: number,
  somaticAwareness?: string
): Promise<AnalysisResult> {
  const response = await apiRequest("POST", "/api/analyze", { 
    thought,
    emotionalIntensity,
    somaticAwareness,
  });
  return response.json();
}

/**
 * Generate a cognitive reframe for the thought
 */
export async function generateReframe(
  thought: string,
  distortions: string[],
  analysis: string,
  emotionalIntensity?: number,
  emotionalState?: string
): Promise<ReframeResult> {
  const response = await apiRequest("POST", "/api/reframe", {
    thought,
    distortions,
    analysis,
    emotionalIntensity,
    emotionalState,
  });
  return response.json();
}

/**
 * Generate a calming practice based on the reframe
 */
export async function generatePractice(reframe: string): Promise<PracticeResult> {
  const response = await apiRequest("POST", "/api/practice", { reframe });
  return response.json();
}

/**
 * Get a contextual dua based on emotional state (PRO ONLY)
 */
export async function getContextualDua(state: string): Promise<DuaResult> {
  const response = await apiRequest("POST", "/api/duas/contextual", { state });
  return response.json();
}

/**
 * Get insight summary for the user (PRO ONLY)
 */
export async function getInsightSummary(): Promise<InsightSummaryResult> {
  const response = await apiRequest("GET", "/api/insights/summary");
  return response.json();
}

/**
 * Get assumption library for the user (PRO ONLY)
 */
export async function getAssumptionLibrary(): Promise<{ assumptions: AssumptionResult[]; total: number }> {
  const response = await apiRequest("GET", "/api/insights/assumptions");
  return response.json();
}

/**
 * Check if user can reflect today (free tier limits)
 */
export async function canReflectToday(): Promise<{ canReflect: boolean; remaining: number | null; isPaid: boolean }> {
  const response = await apiRequest("GET", "/api/reflection/can-reflect");
  return response.json();
}

/**
 * Save a completed reflection
 */
export async function saveReflection(data: {
  thought: string;
  distortions: string[];
  reframe: string;
  intention: string;
  practice: string;
  anchor: string;
}): Promise<{ success: boolean; detectedState?: string }> {
  const response = await apiRequest("POST", "/api/reflection/save", data);
  return response.json();
}

/**
 * Get reflection history
 */
export async function getReflectionHistory(): Promise<{
  history: any[];
  isLimited: boolean;
  limit: number | null;
}> {
  const response = await apiRequest("GET", "/api/reflection/history");
  return response.json();
}
