import { getApiUrl, apiRequest } from "./query-client";
import type {
  ApiResponse,
  ApiError,
  isApiError,
} from "../../shared/types/api";

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
  level?: "emergency" | "urgent" | "concern";
  resources?: CrisisData;
}

export interface AnalyzeParams {
  thought: string;
  emotionalIntensity?: number; // 1-5 scale from emotional anchoring
  somaticAwareness?: string; // Body sensation from somatic prompt
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
// REFLECTION TYPES
// =============================================================================

/**
 * Represents a single reflection session
 */
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

export interface CanReflectResponse {
  canReflect: boolean;
  remaining: number | null;
  isPaid: boolean;
}

export interface ReflectionHistoryResponse {
  history: ReflectionHistoryItem[];
  isLimited: boolean;
  limit: number | null;
}

export interface AssumptionLibraryResponse {
  assumptions: AssumptionResult[];
  total: number;
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
  somaticAwareness?: string,
): Promise<AnalysisResult> {
  const response = await apiRequest("POST", "/api/analyze", {
    thought,
    emotionalIntensity,
    somaticAwareness,
  });
  return response.json() as Promise<AnalysisResult>;
}

/**
 * Generate a cognitive reframe for the thought
 */
export async function generateReframe(
  thought: string,
  distortions: string[],
  analysis: string,
  emotionalIntensity?: number,
  emotionalState?: string,
): Promise<ReframeResult> {
  const response = await apiRequest("POST", "/api/reframe", {
    thought,
    distortions,
    analysis,
    emotionalIntensity,
    emotionalState,
  });
  return response.json() as Promise<ReframeResult>;
}

/**
 * Generate a calming practice based on the reframe
 */
export async function generatePractice(
  reframe: string,
): Promise<PracticeResult> {
  const response = await apiRequest("POST", "/api/practice", { reframe });
  return response.json() as Promise<PracticeResult>;
}

/**
 * Get a contextual dua based on emotional state (PRO ONLY)
 */
export async function getContextualDua(state: string): Promise<DuaResult> {
  const response = await apiRequest("POST", "/api/duas/contextual", { state });
  return response.json() as Promise<DuaResult>;
}

/**
 * Get insight summary for the user (PRO ONLY)
 */
export async function getInsightSummary(): Promise<InsightSummaryResult> {
  const response = await apiRequest("GET", "/api/insights/summary");
  return response.json() as Promise<InsightSummaryResult>;
}

/**
 * Get assumption library for the user (PRO ONLY)
 */
export async function getAssumptionLibrary(): Promise<AssumptionLibraryResponse> {
  const response = await apiRequest("GET", "/api/insights/assumptions");
  return response.json() as Promise<AssumptionLibraryResponse>;
}

/**
 * Check if user can reflect today (free tier limits)
 */
export async function canReflectToday(): Promise<CanReflectResponse> {
  const response = await apiRequest("GET", "/api/reflection/can-reflect");
  return response.json() as Promise<CanReflectResponse>;
}

/**
 * Save a completed reflection
 */
export async function saveReflection(
  data: SaveReflectionData,
): Promise<SaveReflectionResponse> {
  const response = await apiRequest("POST", "/api/reflection/save", data);
  return response.json() as Promise<SaveReflectionResponse>;
}

/**
 * Get reflection history for the current user
 * @returns Object containing history array, limitation status, and limit count
 */
export async function getReflectionHistory(): Promise<ReflectionHistoryResponse> {
  const response = await apiRequest("GET", "/api/reflection/history");
  return response.json() as Promise<ReflectionHistoryResponse>;
}

// Re-export shared types for convenience
export type { ApiResponse, ApiError };
export { isApiError };
