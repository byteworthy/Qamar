# Step 1: Repo Sanity Scan Report

**Date:** 2026-01-17  
**Status:** ✅ COMPLETE

## File Path Inventory

### TypeScript Configuration
- **Main tsconfig:** `tsconfig.json`
  - Extends: `expo/tsconfig.base.json`
  - Configured for both client (Expo) and server (Node)
  - Path aliases: `@/*` → `./client/*`, `@shared/*` → `./shared/*`
  - Types: `node` included
  - **No separate client/server tsconfig files found**

### Server Entry Points
- **Server Entry:** `server/index.ts`
  - Imports and registers routes via `registerRoutes()`
  - Sets up Express with CORS, body parsing, session middleware
  - Integrates billing routes and Stripe webhooks
  - **NO data retention startup integration yet**

### Routes and API Endpoints
- **Main Routes:** `server/routes.ts`
  - Contains all AI interaction endpoints:
    - POST `/api/analyze` - Thought analysis
    - POST `/api/reframe` - Cognitive reframe
    - POST `/api/practice` - Grounding practice
    - POST `/api/reflection/save` - Save reflection (ENCRYPTED)
    - GET `/api/reflection/history` - History retrieval (DECRYPTED)
    - GET `/api/reflection/can-reflect` - Rate limiting check
    - GET `/api/reflection/patterns` - Pattern insights (Pro)
    - GET `/api/insights/summary` - Insight summary (Pro)
    - GET `/api/insights/assumptions` - Assumption library (Pro)
    - POST `/api/duas/contextual` - Contextual dua (Pro)
  - **CRITICAL FINDING:** Routes call OpenAI directly, NOT through canonical orchestrator
  - Encryption is applied at save/retrieve time in routes

### Canonical Orchestrator
- **Location:** `server/canonical-orchestrator.ts`
  - Implements `CanonicalOrchestrator.orchestrate()` method
  - Enforces safety pipeline: charter, tone, state, pacing, Islamic governance
  - Has audit logging via `OrchestrationAuditLogger`
  - **ISSUE:** Not currently invoked by any route - bypass exists

### Encryption Module
- **Location:** `server/encryption.ts`
  - Functions: `encryptData()`, `decryptData()`, `hashValue()`
  - Algorithm: AES-256-GCM with unique IVs
  - Encryption prefix: `enc:iv:tag:encrypted`
  - Helper functions: `encryptReflection()`, `decryptReflection()`, `redactForLogging()`
  - **STATUS:** Implemented and used in routes.ts for thought, reframe, intention

### Data Retention Module
- **Location:** `server/data-retention.ts`
  - Class: `DataRetentionService` with start/stop/runCleanup methods
  - Configuration: 30-day retention, 24-hour cleanup interval
  - Export: `dataRetentionService` singleton, `initializeDataRetention()` function
  - **ISSUE:** Not integrated into server startup (server/index.ts)
  - **ISSUE:** Storage methods for deletion not implemented (marked as TODO)

### Islamic Content Mapper Module
- **Location:** `server/islamic-content-mapper.ts`
  - Class: `IslamicContentMapper` with intelligent content selection
  - Methods: `selectContent()`, `selectConcept()`, `selectQuran()`, `selectHadith()`
  - Enforces: distress-level restrictions, charter part 8, no verse after crisis
  - Validation: `validateContent()`, `verifyAuthenticity()`
  - **ISSUE:** Not used in reframe route - direct QURAN_BY_STATE/HADITH_BY_STATE access instead
  - Routes have TODO comment: "TODO: Integrate IslamicContentMapper"

### Test Suite
- **Location:** `server/__tests__/safety-system.test.ts`
  - Only one test file found
  - **MISSING:** End-to-end journey tests
  - **MISSING:** Crisis path tests
  - **MISSING:** Encryption tests
  - **MISSING:** Data retention tests

### Supporting Infrastructure Modules
- ✅ `server/ai-safety.ts` - Crisis detection, scrupulosity, validators
- ✅ `server/safety-integration.ts` - Safety pipeline
- ✅ `server/charter-compliance.ts` - Charter validation
- ✅ `server/tone-compliance-checker.ts` - Tone analysis
- ✅ `server/conversation-state-machine.ts` - State transitions
- ✅ `server/pacing-controller.ts` - Response pacing
- ✅ `server/failure-language.ts` - Fallback language
- ✅ `server/safety-telemetry.ts` - Safety metrics
- ✅ `shared/islamic-framework.ts` - Islamic content definitions

## Package Configuration

### Dependencies Present
- ✅ TypeScript: 5.9.2
- ✅ @types/node: 24.10.0
- ✅ Express: 4.21.2
- ✅ OpenAI: 6.15.0
- ✅ Drizzle ORM: 0.39.3
- ✅ pg (PostgreSQL): 8.16.3
- ✅ tsx (TypeScript execution): 4.20.6
- ✅ All necessary type packages installed

### Scripts Available
```json
{
  "server:dev": "NODE_ENV=development tsx server/index.ts",
  "server:build": "esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=server_dist",
  "server:prod": "NODE_ENV=production node server_dist/index.js",
  "check:types": "tsc --noEmit",
  "expo:dev": "...",
  "db:push": "drizzle-kit push"
}
```

## Critical Findings

### 🔴 BLOCKERS (Must Fix Before Production)

1. **Canonical Orchestrator Bypass**
   - All AI endpoints in `routes.ts` call OpenAI directly
   - Canonical orchestrator exists but is not enforced
   - Safety pipeline can be circumvented

2. **IslamicContentMapper Not Integrated**
   - Reframe route has TODO comment for integration
   - Direct static lookup via `QURAN_BY_STATE` and `HADITH_BY_STATE`
   - Islamic governance constraints not fully enforced

3. **Data Retention Not Started**
   - `initializeDataRetention()` not called in `server/index.ts`
   - Storage deletion methods marked as TODO

4. **Test Coverage Gaps**
   - No end-to-end journey tests
   - No crisis path verification
   - No encryption verification tests
   - Only one test file exists

### ⚠️ WARNINGS (Should Address)

1. **Single tsconfig.json**
   - One config for both client (Expo) and server (Node)
   - May cause conflicts if ES target differs
   - Current target depends on expo base config

2. **Encryption Key Management**
   - Uses `process.env.ENCRYPTION_KEY` with fallback to random
   - No verification that key is set in production

3. **No Build Verification**
   - Haven't verified TypeScript compilation succeeds
   - Need to run `npm run check:types` and `npm run server:build`

## Next Steps Required

**Step 2:** Fix TypeScript configuration issues  
**Step 3:** Audit and enforce canonical orchestrator in all AI routes  
**Step 4:** Verify encryption end-to-end integration  
**Step 5:** Integrate data retention cron into startup  
**Step 6:** Replace direct Islamic content lookups with IslamicContentMapper  
**Step 7:** Add comprehensive end-to-end test coverage  
**Step 8:** Create production readiness checklist

---
**Report Generated:** Step 1 Complete ✅
