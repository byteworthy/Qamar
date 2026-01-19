# Chunk 2: CI Diagnosis and Fix

## CI Configuration

**File Path:** `.github/workflows/ci.yml`

**Failing Job:** `verify`

**Failing Step:** "Run release gate" (line 24)

**Exact Error:**
```
Run npm run release:check
npm ERR! Missing script: "release:check"
```

## Root Cause

**CI references `npm run release:check` which does not exist in package.json.**

## Available Validation Scripts

From package.json, these scripts exist:
- `check:types` - TypeScript type checking with tsc
- `lint` - ESLint checking via expo lint
- `test` - Jest test suite (79 tests)
- `verify:local` - Runs check:types && test (pre-commit hook uses this)

## Solution

Create `release:check` script that orchestrates all validations:
1. Type checking (`check:types`)
2. Linting (`lint`)
3. Tests (`test`)

This ensures CI validates the same things locally and in GitHub Actions.

## Implementation

Add to package.json scripts:
```json
"release:check": "npm run check:types && npm run lint && npm test"
```

This matches the verification order: types → lint → tests.

## Verification Steps

1. Add script to package.json
2. Run locally: `npm run release:check`
3. Confirm all checks pass
4. Commit and push
5. Verify CI passes on GitHub

---

**Status:** Ready to implement  
**Date:** 2026-01-18
