# Chunk 1 Baseline Verification

**Repo:** C:\Dev\Noor-CBT  
**Date:** 2026-01-18  
**Notes:** Initial `npm ci` failed on Windows with file lock (EBUSY). Node modules were removed and `npm install` used to regenerate `package-lock.json` as approved. `npm ci` then succeeded.

## Command Outputs

### npm ci
```
[See terminal] npm ci initially failed with EBUSY (locked files in node_modules). After removing node_modules and regenerating package-lock.json via npm install, npm ci completed successfully with deprecation warnings.
```

### npm run check:types
```
> my-app@1.0.0 check:types
> tsc --noEmit
```

### npm test
```
> my-app@1.0.0 test
> jest

Test Suites: 2 passed, 2 total
Tests:       79 passed, 79 total
Snapshots:   0 total
Time:        12.348 s
Ran all test suites.
```

### npm run lint
```
> my-app@1.0.0 lint
> npx expo lint

✖ 78 problems (0 errors, 78 warnings)

Notes: Lint now completes with warnings only. Initial run failed due to Prettier CRLF/formatting. Added prettier endOfLine auto and ran `npm run format` to align formatting.
```
