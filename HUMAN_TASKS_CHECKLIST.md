# 🧑 HUMAN TASKS CHECKLIST

**Status**: 3 tasks requiring human action (4 tasks completed ✅)
**Priority**: Organized by criticality and dependencies

**✅ Completed Development Tasks**: Export reflections, Cancel buttons, Loading timeouts, AI prompt extraction

---

## ⚠️ CRITICAL - BLOCKING LAUNCH

### 1. Scholar Review of Islamic Content

**Why**: Theological validation required before public launch.

**Status**: [server/islamic-content-mapper.ts:869](server/islamic-content-mapper.ts#L869) shows `reviewStatus: "PENDING_INITIAL_REVIEW"`

**Action Steps**:
- [ ] Identify qualified Islamic scholar (credentials in aqeedah, fiqh, contemporary issues)
- [ ] Compile review packet:
  - [ ] All Quran ayat from [shared/islamic-framework.ts](shared/islamic-framework.ts)
  - [ ] All Hadith references
  - [ ] Reframing logic examples
  - [ ] Scrupulosity handling approach
  - [ ] Crisis intervention framework
- [ ] Send packet to scholar for review
- [ ] Schedule follow-up meeting to answer questions
- [ ] Incorporate feedback into code
- [ ] Get written approval/sign-off
- [ ] Update code: `reviewStatus: "APPROVED"`, add `reviewedBy` with scholar credentials

**Time**: 2-6 weeks (depends on scholar availability)
**Cost**: $500-$2,000
**Blocks**: Public launch, closed beta (TestFlight okay without this)

---

### 2. ✅ COMPLETED - Finalize Legal Documents (No Attorney Needed!)

**Why**: ToS and Privacy Policy required for store submission.

**Status**: ✅ COMPLETE - Finalized and ready for hosting

**Completed Steps**:
- [x] Finalized Privacy Policy (legal/PRIVACY_POLICY.md)
- [x] Finalized Terms of Service (legal/TERMS_OF_SERVICE.md)
- [x] Removed all `[PLACEHOLDER]` tags
- [x] Added ByteWorthy LLC details
- [x] Added CCPA compliance for California users
- [x] Created HTML versions for web hosting
- [x] Updated app.json with legal URLs
- [x] Prepared GitHub Pages deployment

**Remaining Steps**:
- [ ] Deploy to GitHub Pages (5 minutes - see [docs/DEPLOY_GITHUB_PAGES.md](docs/DEPLOY_GITHUB_PAGES.md))
- [ ] Verify URLs return 200 status
- [ ] Update App Store Connect with URLs
- [ ] Update Google Play Console with URLs

**Time**: 5 minutes (just deployment)
**Cost**: $0 (GitHub Pages is free)
**Legal URLs**:
  - Privacy: https://byteworthy.github.io/Noor/legal/privacy.html
  - Terms: https://byteworthy.github.io/Noor/legal/terms.html

---

### 3. Backend Deployment to Production

**Why**: App cannot function without live backend API.

**Recommended Host**: Railway or Render (fastest MVP deployment)

**Action Steps**:
- [ ] **Select hosting provider**: Create account on Railway or Render
- [ ] **Add payment method**: Credit card for billing
- [ ] **Provision PostgreSQL database**:
  - [ ] Choose smallest tier ($7-10/month)
  - [ ] Note connection string (DATABASE_URL)
- [ ] **Deploy backend**:
  - [ ] Connect GitHub repo
  - [ ] Set build command: `npm run server:build`
  - [ ] Set start command: `npm run server:prod`
- [ ] **Set environment variables** (20+ vars from [docs/SECRETS_AND_CONFIG.md](docs/SECRETS_AND_CONFIG.md)):
  - [ ] `NODE_ENV=production`
  - [ ] `DATABASE_URL=<postgres-connection-string>`
  - [ ] `ENCRYPTION_KEY=<generate-32-byte-hex>` (CRITICAL - use `openssl rand -hex 32`)
  - [ ] `SESSION_SECRET=<generate-secret>` (use `openssl rand -hex 32`)
  - [ ] `DATA_RETENTION_DRY_RUN=false` (enables actual deletion)
  - [ ] Skip `AI_INTEGRATIONS_OPENAI_API_KEY` for now (set later)
  - [ ] Skip `STRIPE_SECRET_KEY` for now (set later)
- [ ] **Apply database schema**:
  - [ ] Connect to prod DB via Railway/Render shell
  - [ ] Run: `npm run db:push`
  - [ ] Verify tables created: `\dt` in psql
  - [ ] Verify foreign keys: `\d sessions` in psql
  - [ ] Verify indexes: `\di` in psql
- [ ] **Configure custom domain** (optional but recommended):
  - [ ] Purchase domain (e.g., api.noorapp.com)
  - [ ] Add DNS records
  - [ ] Enable managed SSL/TLS
- [ ] **Verify deployment**:
  - [ ] Visit backend URL in browser
  - [ ] Should see "Cannot GET /" (expected - no root route)
  - [ ] Check logs for startup errors

**Time**: 1 week
**Cost**: $15-30/month (hosting + database)
**Blocks**: All user testing, internal alpha, closed beta

---

## 🔴 HIGH PRIORITY - IMPROVES UX

### 4. ✅ COMPLETED - Implement Export Reflections UI

**Why**: Users expect to export their data (GDPR/CCPA requirement).

**Status**: ✅ COMPLETE - Implemented in HistoryScreen.tsx with react-native-share

**Action Steps**:
- [ ] Install React Native Share: `npm install react-native-share`
- [ ] Add export button to HistoryScreen header
- [ ] Implement export logic:

```typescript
// In client/screens/HistoryScreen.tsx
import Share from 'react-native-share';

const handleExport = async () => {
  // Format as markdown
  const markdown = sessions.map(s =>
    `## ${new Date(s.timestamp).toLocaleDateString()}\n\n` +
    `**Thought**: ${s.thought}\n\n` +
    `**Reframe**: ${s.reframe}\n\n` +
    `**Intention**: ${s.intention}\n\n` +
    `---\n\n`
  ).join('');

  // Share via native share sheet
  await Share.open({
    message: markdown,
    title: 'My Noor Reflections',
    subject: 'Noor Reflections Export',
  });
};
```

- [ ] Add export button UI:

```typescript
<Pressable
  onPress={handleExport}
  style={styles.exportButton}
>
  <Feather name="download" size={20} />
  <ThemedText>Export</ThemedText>
</Pressable>
```

- [ ] Test on iOS and Android
- [ ] Verify share sheet appears with markdown content

**Time**: 2-3 hours
**Impact**: GDPR/CCPA compliance, user trust

---

### 5. ✅ COMPLETED - Implement Cancel/Exit Buttons in Reflection Flow

**Why**: Users should be able to exit mid-flow without force-quitting app.

**Status**: ✅ COMPLETE - All reflection screens now have cancel buttons with ExitConfirmationModal

**Action Steps**:
- [x] Add cancel button to each reflection screen:
  - [x] ThoughtCaptureScreen
  - [x] DistortionScreen
  - [x] ReframeScreen
  - [x] RegulationScreen
  - [x] IntentionScreen
- [ ] Implement confirmation modal (shared component):

```typescript
// Create client/components/ExitConfirmationModal.tsx
export const ExitConfirmationModal = ({ visible, onConfirm, onCancel }) => (
  <Modal visible={visible} transparent>
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <ThemedText type="h4">Exit reflection?</ThemedText>
        <ThemedText>Progress will be lost.</ThemedText>
        <View style={styles.buttons}>
          <Button onPress={onCancel}>Stay</Button>
          <Button onPress={onConfirm} destructive>Exit</Button>
        </View>
      </View>
    </View>
  </Modal>
);
```

- [ ] Add to each reflection screen:

```typescript
// Example: ThoughtCaptureScreen.tsx
const [showExitModal, setShowExitModal] = useState(false);

useLayoutEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <Pressable onPress={() => setShowExitModal(true)}>
        <ThemedText>Cancel</ThemedText>
      </Pressable>
    ),
  });
}, [navigation]);

const handleExit = () => {
  setShowExitModal(false);
  navigation.navigate('Home');
};

// In render:
<ExitConfirmationModal
  visible={showExitModal}
  onConfirm={handleExit}
  onCancel={() => setShowExitModal(false)}
/>
```

- [ ] Test on each screen
- [ ] Verify navigation returns to Home
- [ ] Verify state is cleared (no stale data)

**Time**: 3-4 hours
**Impact**: Prevents user frustration, better UX

---

### 6. Set Up Sentry Error Tracking

**Why**: Cannot debug production issues without error tracking.

**Action Steps**:
- [ ] Create Sentry account at https://sentry.io (free tier: 5k events/month)
- [ ] Create two Sentry projects:
  - [ ] **Backend** (Node.js)
  - [ ] **Mobile** (React Native)
- [ ] Get DSN from each project dashboard
- [ ] **Backend integration** ([server/index.ts](server/index.ts)):

```typescript
import * as Sentry from "@sentry/node";

if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN_BACKEND) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN_BACKEND,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of requests
  });
}
```

- [ ] **Mobile integration** ([client/index.js](client/index.js)):

```typescript
import * as Sentry from "@sentry/react-native";

if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    enableNative: true,
  });
}
```

- [ ] Add to backend deployment env vars:
  - [ ] `SENTRY_DSN_BACKEND=<backend-dsn>`
- [ ] Add to EAS secrets:
  - [ ] `npx eas secret:create --name EXPO_PUBLIC_SENTRY_DSN --value "<mobile-dsn>"`
- [ ] Test error capture:
  - [ ] Trigger test error in backend: `throw new Error('Test error');`
  - [ ] Check Sentry dashboard for event
  - [ ] Trigger test crash in mobile
  - [ ] Check Sentry dashboard for event
- [ ] Configure source maps for mobile (in eas.json)
- [ ] Set up Sentry alerts (email when error spike)

**Time**: 1 day
**Cost**: $0 (free tier)
**Impact**: Production debugging capability

---

## 🟡 MEDIUM PRIORITY - NICE TO HAVE

### 7. ✅ COMPLETED - Implement Loading Timeouts

**Why**: Users shouldn't wait indefinitely for AI responses.

**Status**: ✅ COMPLETE - Implemented in DistortionScreen and ReframeScreen with 15s warning, 30s abort

**Action Steps**:
- [x] Add timeout state to DistortionScreen and ReframeScreen:

```typescript
const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);

useEffect(() => {
  let warningTimeout: NodeJS.Timeout;
  let abortTimeout: NodeJS.Timeout;

  if (loading) {
    // Show warning after 15 seconds
    warningTimeout = setTimeout(() => {
      setShowTimeoutWarning(true);
    }, 15000);

    // Abort after 30 seconds
    abortTimeout = setTimeout(() => {
      setError(ScreenCopy.distortion.errorTimeout);
      setLoading(false);
    }, 30000);
  }

  return () => {
    clearTimeout(warningTimeout);
    clearTimeout(abortTimeout);
  };
}, [loading]);
```

- [ ] Update loading UI to show timeout warning:

```typescript
{loading && (
  <View>
    <ActivityIndicator />
    <ThemedText>{ScreenCopy.distortion.loading}</ThemedText>
    {showTimeoutWarning && (
      <ThemedText style={{ color: theme.warning }}>
        This is taking longer than expected. Still working...
      </ThemedText>
    )}
  </View>
)}
```

- [ ] Test with slow network (Chrome DevTools throttling)
- [ ] Verify warning appears at 15s
- [ ] Verify error appears at 30s

**Time**: 2-3 hours
**Impact**: Better user feedback, prevents confusion

---

### 8. ✅ COMPLETED - Extract AI Prompts to Separate Files

**Why**: Easier to review, version control, and get scholar approval.

**Status**: ✅ COMPLETE - All prompts extracted to server/prompts/ with template system

**Action Steps**:
- [x] Create `server/prompts/` directory
- [x] Find all OpenAI calls:
  - [x] Search codebase for `openai.chat.completions.create`
  - [x] List files: (already found [server/returnSummaries.ts](server/returnSummaries.ts))
- [x] Extract system prompts to files:
  - [x] `server/prompts/analyze-distortions.txt`
  - [x] `server/prompts/generate-reframe.txt`
  - [x] `server/prompts/suggest-practice.txt`
  - [x] `server/prompts/generate-summary.txt`
- [x] Update code to read from files:

```typescript
import { readFileSync } from 'fs';
import { join } from 'path';

const PROMPT_DIR = join(__dirname, 'prompts');

function loadPrompt(filename: string): string {
  return readFileSync(join(PROMPT_DIR, filename), 'utf-8');
}

// In OpenAI call:
const systemPrompt = loadPrompt('analyze-distortions.txt');
```

- [ ] Review each prompt for quality:
  - [ ] Clear instructions?
  - [ ] Appropriate constraints?
  - [ ] Islamic sensitivity?
- [ ] Send prompts to scholar for review (part of Scholar Review task)
- [ ] Commit prompts to version control

**Time**: 1-2 days (includes prompt quality review)
**Impact**: Easier prompt management, scholar can review in plain text

---

## 📋 SUMMARY

| Task | Priority | Time | Cost | Blocks | Status |
|------|----------|------|------|--------|--------|
| 1. Scholar Review | CRITICAL | 2-6 weeks | $500-2k | Public launch | 🔄 Pending |
| 2. Legal Documents | CRITICAL | 5 min | $0 | Store submission | ✅ Complete (deploy only) |
| 3. Backend Deployment | CRITICAL | 1 week | $15-30/mo | All testing | 🔄 Pending |
| 4. Export Reflections | HIGH | 2-3 hours | $0 | - | ✅ Complete |
| 5. Cancel/Exit Buttons | HIGH | 3-4 hours | $0 | - | ✅ Complete |
| 6. Sentry Setup | HIGH | 1 day | $0 | - | 🔄 Pending |
| 7. Loading Timeouts | MEDIUM | 2-3 hours | $0 | - | ✅ Complete |
| 8. Extract AI Prompts | MEDIUM | 1-2 days | $0 | - | ✅ Complete |

**Total One-Time Cost**: $500-$2,000 (scholar review only)
**Total Monthly Cost**: $15-30 (backend hosting only)
**Total Development Time**: ~1-2 weeks (excluding scholar review)

---

## ✅ QUICK WIN TASKS (Do These First)

If you want quick progress while waiting on legal/scholar reviews:

**Week 1 Quick Wins** (5-8 hours total):
1. **Day 1**: Export reflections (2-3 hours)
2. **Day 2**: Cancel/exit buttons (3-4 hours)
3. **Day 3**: Sentry setup (1 day)

**Week 2 While Waiting on Reviews**:
4. Backend deployment (1 week)
5. Loading timeouts (2-3 hours)
6. Extract AI prompts (1-2 days)

---

## 🚦 DEPENDENCY CHAIN

```
Legal Review ─┐
              ├──> Store Submission ──> Public Launch
IAP Config ───┤
              │
Screenshots ──┘

Scholar Review ─────> Closed Beta ──> Public Launch

Backend Deploy ─────> Internal Alpha ──> Closed Beta ──> Public Launch
```

**Critical Path**: Backend Deploy → Scholar Review → Legal Review → Public Launch

**Parallel Work**: While waiting on legal/scholar reviews, you can work on:
- Export reflections
- Cancel/exit buttons
- Sentry setup
- Loading timeouts
- Extract AI prompts

---

## 📞 RECOMMENDED ORDER

### Start Immediately (This Week)
1. ✅ **Hire attorney** - Send legal drafts (2-4 week turnaround)
2. ✅ **Contact scholar** - Send Islamic content (2-6 week turnaround)
3. ✅ **Deploy backend** - Unblocks all other work (1 week)

### Week 2-3 (While Waiting on Reviews)
4. Export reflections
5. Cancel/exit buttons
6. Sentry setup
7. Loading timeouts
8. Extract AI prompts

### Week 4-6 (Reviews Completing)
- Monitor legal review progress
- Monitor scholar review progress
- Incorporate feedback from both
- Begin IAP configuration (after legal review)
- Create store assets (after legal review)

### Week 7+ (Pre-Launch)
- Final testing with all features
- Internal alpha distribution
- Address any critical bugs
- Prepare for store submission

---

**End of Human Tasks Checklist**
Last Updated: 2026-01-21
