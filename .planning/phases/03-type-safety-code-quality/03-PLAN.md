---
phase: 03-type-safety-code-quality
plan: 03
type: execute
wave: 2
depends_on: [03-01, 03-02]
files_modified:
  - shared/types/api.ts
  - server/routes.ts
  - client/utils/api.ts
  - server/__tests__/**/*.test.ts
autonomous: true

must_haves:
  truths:
    - "All API responses have proper TypeScript interfaces"
    - "API client uses typed response interfaces"
    - "Server routes return typed responses"
    - "Test files use `unknown` instead of `any` where appropriate"
    - "TypeScript strict mode passes"
  artifacts:
    - path: "shared/types/api.ts"
      provides: "Comprehensive API type definitions"
      contains: "interface.*Response"
    - path: "client/utils/api.ts"
      provides: "Type-safe API client"
      contains: "ApiResponse"
    - path: "server/routes.ts"
      provides: "Type-safe route handlers"
      contains: "Response<.*>"
  key_links:
    - from: "API client"
      to: "shared types"
      via: "typed request/response"
      pattern: "import.*api.ts"
---

<objective>
Create proper TypeScript interfaces for all API responses and use `unknown` instead of `any` in test files.

Purpose: Establish type-safe API contract between client and server, eliminating type safety gaps.

Output: Centralized API type definitions, type-safe API client, and improved test file types.
</objective>

<context>
@.planning/ROADMAP.md
@server/routes.ts
@client/utils/api.ts
@server/__tests__/**/*.test.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create comprehensive API type definitions</name>
  <files>shared/types/api.ts</files>
  <action>
Create `shared/types/api.ts` with all API request/response types:

```typescript
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
```
  </action>
  <verify>
- File created with comprehensive type definitions
- TypeScript compilation passes: `npx tsc --noEmit`
- All API endpoints have corresponding types
  </verify>
  <done>Comprehensive API type definitions created in shared/types/api.ts</done>
</task>

<task type="auto">
  <name>Task 2: Update API client to use typed responses</name>
  <files>client/utils/api.ts</files>
  <action>
Update the API client to use the new type definitions:

```typescript
import {
  ApiResponse,
  isApiError,
  UserResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  CreateReflectionRequest,
  CreateReflectionResponse,
  GetReflectionsResponse,
  GetReflectionResponse,
  DeleteReflectionResponse,
  AnalyzeThoughtRequest,
  AnalyzeThoughtResponse,
  ReframeRequest,
  ReframeResponse,
  PracticeRequest,
  PracticeResponse,
  InsightsSummaryRequest,
  InsightsSummaryResponse,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  HealthCheckResponse,
} from '../../shared/types/api';

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'Request failed',
          code: data.code,
          details: data.details,
        };
      }

      return data as T;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // User endpoints
  async getUser(): Promise<ApiResponse<UserResponse>> {
    return this.request<UserResponse>('/api/user');
  }

  async updateSettings(
    request: UpdateSettingsRequest
  ): Promise<ApiResponse<UpdateSettingsResponse>> {
    return this.request<UpdateSettingsResponse>('/api/user/settings', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async deleteUser(): Promise<ApiResponse<{ success: boolean }>> {
    return this.request<{ success: boolean }>('/api/user', {
      method: 'DELETE',
    });
  }

  // Reflection endpoints
  async createReflection(
    request: CreateReflectionRequest
  ): Promise<ApiResponse<CreateReflectionResponse>> {
    return this.request<CreateReflectionResponse>('/api/reflections', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getReflections(
    limit?: number,
    offset?: number
  ): Promise<ApiResponse<GetReflectionsResponse>> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    return this.request<GetReflectionsResponse>(
      `/api/reflections?${params.toString()}`
    );
  }

  async getReflection(id: string): Promise<ApiResponse<GetReflectionResponse>> {
    return this.request<GetReflectionResponse>(`/api/reflections/${id}`);
  }

  async deleteReflection(
    id: string
  ): Promise<ApiResponse<DeleteReflectionResponse>> {
    return this.request<DeleteReflectionResponse>(`/api/reflections/${id}`, {
      method: 'DELETE',
    });
  }

  // AI endpoints
  async analyzeThought(
    request: AnalyzeThoughtRequest
  ): Promise<ApiResponse<AnalyzeThoughtResponse>> {
    return this.request<AnalyzeThoughtResponse>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async reframe(request: ReframeRequest): Promise<ApiResponse<ReframeResponse>> {
    return this.request<ReframeResponse>('/api/reframe', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getPractice(
    request: PracticeRequest
  ): Promise<ApiResponse<PracticeResponse>> {
    return this.request<PracticeResponse>('/api/practice', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getInsightsSummary(
    request: InsightsSummaryRequest
  ): Promise<ApiResponse<InsightsSummaryResponse>> {
    return this.request<InsightsSummaryResponse>('/api/insights/summary', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Billing endpoints
  async createCheckoutSession(
    request: CreateCheckoutSessionRequest
  ): Promise<ApiResponse<CreateCheckoutSessionResponse>> {
    return this.request<CreateCheckoutSessionResponse>('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.request<HealthCheckResponse>('/api/health');
  }
}

export const api = new ApiClient(
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
);

export { isApiError };
```
  </action>
  <verify>
- API client uses typed responses
- All methods have proper return types
- TypeScript compilation passes
- No `any` types in API client
  </verify>
  <done>API client is fully type-safe with typed responses</done>
</task>

<task type="auto">
  <name>Task 3: Replace `any` with `unknown` in test files</name>
  <files>server/__tests__/**/*.test.ts</files>
  <action>
Replace instances of `any` in test files with `unknown` where appropriate:

1. Search for `any` in test files:
   ```bash
   grep -r ": any" server/__tests__/
   ```

2. Replace with `unknown` following this pattern:

BEFORE:
```typescript
it("should handle error", () => {
  const error: any = { message: "test error" };
  expect(handleError(error)).toBeDefined();
});
```

AFTER:
```typescript
it("should handle error", () => {
  const error: unknown = { message: "test error" };
  expect(handleError(error)).toBeDefined();
});
```

BEFORE:
```typescript
const mockResponse: any = {
  status: 200,
  data: { id: "123" },
};
```

AFTER:
```typescript
const mockResponse: unknown = {
  status: 200,
  data: { id: "123" },
};
// Or better, use proper type:
const mockResponse: { status: number; data: { id: string } } = {
  status: 200,
  data: { id: "123" },
};
```

Guidelines:
- Use `unknown` for truly unknown external data
- Use proper types when structure is known
- Keep `any` only where Jest types require it (jest.Mock<any>)
- Add type guards when narrowing `unknown` to specific types
  </action>
  <verify>
- `any` replaced with `unknown` or proper types in test files
- TypeScript compilation passes
- All tests still pass
  </verify>
  <done>Test files use `unknown` instead of `any` where appropriate</done>
</task>

<task type="auto">
  <name>Task 4: Verify type safety across codebase</name>
  <files>shared/types/api.ts, client/utils/api.ts, server/__tests__/**/*.test.ts</files>
  <action>
1. Run TypeScript type check with strict mode:
   ```bash
   npx tsc --noEmit --strict
   ```

2. Search for remaining `any` types in production code:
   ```bash
   grep -r ": any" client/ server/ shared/ --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=__tests__
   ```

3. Run full test suite:
   ```bash
   npm test
   ```

4. Verify API type usage in both client and server:
   ```bash
   grep -r "import.*api" client/ server/
   ```
  </action>
  <verify>
- TypeScript strict mode passes
- Minimal `any` types in production code (document justification for each)
- All tests pass
- API types imported and used correctly
  </verify>
  <done>Codebase verified as type-safe with comprehensive API types</done>
</task>

</tasks>

<verification>
1. Confirm shared/types/api.ts created with comprehensive types
2. Verify client/utils/api.ts uses typed responses
3. Search for `any` in production code - should be minimal with justification
4. Run `npx tsc --noEmit --strict` - should pass
5. Run `npm test` - all tests should pass
</verification>

<success_criteria>
1. Comprehensive API type definitions created (shared/types/api.ts)
2. API client fully typed with proper return types
3. Server routes use typed responses (update if needed)
4. Test files use `unknown` instead of `any` where appropriate
5. Zero unjustified `any` types in production code
6. TypeScript strict mode compilation passes
7. All existing tests still pass
8. Code committed with clear commit message referencing TYPE-06, TYPE-07
</success_criteria>

<output>
After completion, create `.planning/phases/03-type-safety-code-quality/03-SUMMARY.md`
</output>
