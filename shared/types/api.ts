// shared/types/api.ts

// ============= Common Types =============

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// ============= User Types =============

export interface User {
  id: string;
  email: string;
  stripeCustomerId: string;
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'canceled' | 'inactive';
  stripeSubscriptionId?: string;
  subscriptionTier?: string;
  trialEndsAt?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserSettings {
  notifications: {
    enabled: boolean;
    email?: boolean;
    push?: boolean;
  };
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
}

export interface UserResponse {
  user: User;
}

export interface UpdateSettingsRequest {
  settings: UserSettings;
}

export interface UpdateSettingsResponse {
  success: boolean;
  settings: UserSettings;
}

// ============= Reflection Types =============

export interface Reflection {
  id: string;
  userId: string;
  thought: string;
  reframe: string;
  intention?: string;
  emotionalState: string;
  emotionalIntensity?: number;
  distortions: string[];
  islamicPerspective?: {
    verse: string;
    surah?: string;
    context: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReflectionRequest {
  thought: string;
  reframe: string;
  intention?: string;
  emotionalState: string;
  emotionalIntensity?: number;
  distortions: string[];
  islamicPerspective?: {
    verse: string;
    surah?: string;
    context: string;
  };
}

export interface CreateReflectionResponse {
  reflection: Reflection;
}

export interface GetReflectionsResponse extends PaginatedResponse<Reflection> {}

export interface GetReflectionResponse {
  reflection: Reflection;
}

export interface DeleteReflectionResponse {
  success: boolean;
}

// ============= Analysis Types =============

export interface ToneAnalysis {
  tone: string;
  empathy: number;
  clinical: number;
  supportive: number;
  judgment?: number;
  dismissiveness?: number;
}

export interface AnalyzeThoughtRequest {
  thought: string;
  context?: string;
}

export interface AnalyzeThoughtResponse {
  emotionalState: string;
  emotionalIntensity: number;
  distortions: Array<{
    type: string;
    confidence: number;
    evidence: string;
  }>;
  toneAnalysis: ToneAnalysis;
  crisisDetected?: boolean;
  resources?: Array<{
    name: string;
    phone: string;
    url?: string;
  }>;
}

// ============= Reframe Types =============

export interface ReframeRequest {
  thought: string;
  analysis: {
    emotionalState: string;
    distortions: string[];
    intensity?: number;
  };
  islamicContext?: boolean;
}

export interface ReframeResponse {
  reframe: string;
  islamicPerspective?: {
    verse: string;
    surah?: string;
    context: string;
    dua?: string;
  };
  tone: {
    compliant: boolean;
    score: number;
  };
}

// ============= Practice Types =============

export interface PracticeRequest {
  emotionalState: string;
  intensity: 'low' | 'medium' | 'high';
  preference?: 'breathing' | 'grounding' | 'mindfulness';
}

export interface Practice {
  type: string;
  title: string;
  description: string;
  steps: string[];
  duration: number;
  islamicElement?: {
    verse?: string;
    dua?: string;
  };
}

export interface PracticeResponse {
  practice: Practice;
  duration: number;
}

// ============= Insights Types =============

export interface InsightsSummaryRequest {
  reflectionIds?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
}

export interface InsightsSummaryResponse {
  summary: string;
  patterns: Array<{
    type: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
  progress: {
    emotionalRegulation: number;
    distortionAwareness: number;
    copingSkills: number;
  };
  recommendations: string[];
}

// ============= Billing Types =============

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface BillingPortalRequest {
  returnUrl: string;
}

export interface BillingPortalResponse {
  url: string;
}

// ============= Health Check =============

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  version?: string;
  database?: 'connected' | 'disconnected';
}

// ============= Generic API Response Wrapper =============

export type ApiResponse<T> = T | ApiError;

export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'error' in response &&
    typeof (response as ApiError).error === 'string'
  );
}
