# Chunk 1 Truth Audit

## Scope
Features audited per request:
- Encryption at rest
- Retention policy
- Hashed logging
- Implemented vs pending claims

## Evidence Table

| Feature | Docs claiming implemented (files) | Docs claiming pending (files) | What code actually shows (paths) | Truth conclusion |
| --- | --- | --- | --- | --- |
| Encryption at rest | STEP4_ENCRYPTION_VERIFICATION.md; STEP7_E2E_TESTING_COMPLETE.md; PROJECT_STATUS_REPORT.md; PROJECT_STATUS.md; HARDENING_COMPLETE.md; CHANGELOG.md | PROJECT_OVERVIEW.md (roadmap shows encryption as to-do); PROGRESS_SUMMARY.md (notes integration pending) | `server/encryption.ts` implements AES-256-GCM encrypt/decrypt; `server/routes.ts` encrypts thought/reframe/intention on save and decrypts on history read | **Implemented (app-layer encryption at rest).** Docs claiming “pending” are outdated. |
| Retention policy / auto-deletion | STEP5_DATA_RETENTION_COMPLETE.md; PROJECT_STATUS_REPORT.md (claims auto-deletion, 90-day policy); PROJECT_STATUS.md; CHANGELOG.md; PRODUCTION_READINESS.md | STEP1_REPO_SCAN_REPORT.md (not integrated at that time); PROJECT_OVERVIEW.md (retention cron as to-do); PROGRESS_SUMMARY.md (integration pending) | `server/data-retention.ts` defines service, but deletion methods are TODO and only log intent. `server/storage.ts` has **no** deleteExpiredReflections/deleteExpiredInsightSummaries. `server/routes.ts` exposes manual cleanup endpoint. `server/index.ts` integration not verified in this audit. | **Partial / missing**: retention job exists but **actual deletion is not implemented** and cron integration not confirmed. Docs claiming auto-deletion as complete are overstated. |
| Hashed logging (user IDs) | PROJECT_STATUS_REPORT.md (hash-based logging); PROJECT_OVERVIEW.md (hashed user IDs) | None explicitly | `server/ai-safety.ts` `createSafeLogEntry` uses `hashUserId` (simple hash) for crisis logs; `server/encryption.ts` provides `hashValue` utility but not used in logs. No centralized logging of hashed IDs beyond crisis logging. | **Partial**: hashed logging exists for safety events only; not system-wide. Docs implying broad hashed logging are overstated. |
| Implemented vs pending labels (general) | STEP4_ENCRYPTION_VERIFICATION.md; STEP5_DATA_RETENTION_COMPLETE.md; PROJECT_STATUS_REPORT.md | PROJECT_OVERVIEW.md; PROGRESS_SUMMARY.md; STEP1_REPO_SCAN_REPORT.md | Encryption is active; retention deletion is stubbed; hashed logging limited to safety logs. | **Mixed**: encryption implemented; retention and hashed logging partially implemented. Update docs to align. |

## Code Confirmation Notes
- **Encryption**: `server/encryption.ts` implements AES-256-GCM. `server/routes.ts` encrypts thought/reframe/intention on save and decrypts on history read.
- **Retention**: `server/data-retention.ts` logs deletion intent and returns 0 deleted. `server/storage.ts` lacks deletion methods. The service start is defined, but execution of real deletions is not implemented.
- **Hashed logging**: `server/ai-safety.ts` `createSafeLogEntry()` hashes userId for crisis logs only. No evidence of hashed logging for general requests.

## Required Doc Alignments
- Update docs claiming **90-day auto-deletion** to reflect the actual 30-day configuration and that deletion is not implemented yet.
- Update docs claiming **“comprehensive” retention** to **“service present, deletion pending”**.
- Update docs that describe **hash-based logging** as globally implemented to **“safety event logs only”**.
- Update PROJECT_STATUS_REPORT.md to be canonical and aligned to code.
