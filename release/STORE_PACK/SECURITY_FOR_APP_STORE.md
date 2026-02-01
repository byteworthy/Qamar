# Noor Security Summary for App Store Review

**App Name:** Noor - Islamic Reflection & Personal Growth
**Bundle ID:** com.noor.app
**Version:** 1.0.0
**Submission Date:** February 2026

---

## Security Overview for Reviewers

Noor is a **personal reflection and growth app** with **enterprise-grade mobile security** to protect users' private journal entries. This document summarizes our security implementation for App Store review.

---

## 1. Data Protection

### Encryption at Rest

**Client-Side (iOS Keychain):**
- Journal entries stored in iOS Keychain (via expo-secure-store)
- Push notification tokens in secure storage
- No plaintext sensitive data in app container

**Server-Side (AES-256-GCM):**
- All reflections encrypted with AES-256-GCM before database storage
- Unique IV (Initialization Vector) per record
- Encrypted fields: thought, reframe, intention

**Code Location:**
- Client: `client/lib/secure-storage.ts`
- Server: `server/encryption.ts`

### Encryption in Transit

- **HTTPS-only:** All API calls use TLS 1.3
- **Backend:** Railway.app (noor-production-9ac5.up.railway.app)
- **Certificate validation** enforced on every request

---

## 2. Mobile Security Features

### 2.1 Biometric Authentication (Optional)

**Supported:**
- iOS: Face ID, Touch ID
- Fallback: Device passcode

**Behavior:**
- **User-controlled:** Can be enabled/disabled in Settings
- **Background timeout:** Re-authentication required after 5 minutes in background
- **Immediate lock:** App locks when backgrounded (if biometric enabled)

**Permissions:** `NSFaceIDUsageDescription` in app.json

**Code Location:** `client/hooks/useBiometricAuth.ts`, `client/lib/biometric-auth.ts`

**Reviewer Note:** Biometric auth is **optional** and defaults to **off**. Users must explicitly enable it.

---

### 2.2 Screenshot Prevention

**Protected Screens:**
- Journal entry screen (ThoughtCaptureScreen)
- History screen (past reflections)
- AI analysis screen (ReframeScreen, IntentionScreen)
- Insights screen (pattern summaries)

**Unprotected Screens (Intentional):**
- Quranic verses and Islamic guidance (users can share)
- App settings
- Onboarding screens

**Behavior:**
- Screenshots return black screen on protected screens
- Screen recording blocked on sensitive screens
- Automatically re-enabled when leaving protected screen

**Code Location:** `client/hooks/useScreenshotPrevention.ts` (uses expo-screen-capture)

**Reviewer Note:** This prevents **accidental** sharing of personal reflections while allowing **intentional** sharing of Islamic educational content.

---

### 2.3 Jailbreak Detection

**Implementation:** jail-monkey library

**Behavior:**
- Detects jailbroken/rooted devices on app launch
- Shows **warning dialog** about data exposure risks
- **User can choose** to continue or exit (graceful UX)
- Warning displayed persistently (every launch)

**Code Location:** `client/lib/device-security.ts`

**Reviewer Note:** This is an **informational warning**, not a block. We respect user choice while informing them of risks.

---

## 3. Backend API Security

### 3.1 Session Management

**Implementation:**
- HMAC-SHA256 signed session tokens
- Timing-safe comparison (prevents timing attacks)
- 30-day expiration with automatic cleanup

**Cookie Security:**
- `HttpOnly` flag (not accessible via JavaScript)
- `Secure` flag (HTTPS-only)
- `SameSite: lax` (CSRF prevention)

**Code Location:** `server/middleware/auth.ts`

---

### 3.2 Rate Limiting

**Limits:**
- **Auth endpoints:** 5 requests / 15 minutes (prevents brute force)
- **AI endpoints:** 10 requests / minute (prevents abuse)
- **Health endpoint:** 60 requests / minute
- **General API:** 100 requests / 15 minutes

**Code Location:** `server/middleware/rate-limit.ts`, `server/middleware/ai-rate-limiter.ts`

**Reviewer Note:** Aggressive rate limiting protects against API abuse and DoS attacks.

---

### 3.3 CSRF Protection

**Implementation:** Double-submit cookie pattern
- CSRF token in cookie + request header
- Timing-safe comparison
- Required for all POST/PUT/DELETE requests

**Code Location:** `server/middleware/csrf.ts`

---

### 3.4 Input Validation

**Implementation:**
- Zod schemas for all API inputs
- Drizzle ORM (parameterized queries prevent SQL injection)
- 10MB request body limit (prevents DoS)
- XSS protection via Content-Security-Policy

**Code Location:** `server/routes/` (all route handlers)

---

## 4. Privacy & Compliance

### 4.1 Data Minimization

**What We Collect:**
- Email (optional, for account sync in future)
- Journal entries (user-generated content)
- Usage analytics (anonymized)

**What We DON'T Collect:**
- Real name (optional only)
- Location data
- Contacts
- Photos (unless user adds to journal)
- Browsing history

---

### 4.2 User Control

**Export:** Users can export all data as JSON
**Delete:** Individual reflections + full account deletion
**Retention:** 30-day automatic cleanup of expired sessions

**Privacy Policy:** https://byteworthy.github.io/noor-legal/privacy-policy.html

---

### 4.3 Compliance

- ✅ **GDPR** (EU): Data minimization, user consent, right to access/deletion, data portability
- ✅ **CCPA** (California): Privacy policy accessible, Do Not Sell disclosure, deletion honored
- ✅ **COPPA** (Under 13): Parental consent required, no targeted ads, minimal data collection

---

## 5. Third-Party Services

### 5.1 Anthropic Claude AI

**Usage:** Cognitive distortion analysis for reflections

**Security:**
- API key stored **server-side only** (never in client)
- Client calls Noor backend; backend calls Anthropic
- Rate-limited (10 req/min) to prevent quota abuse
- No training on user data (Anthropic policy)

**Data Sent:** User's reflection text (encrypted in transit via HTTPS)

**Reviewer Note:** AI analysis happens **server-side**. Client never accesses Anthropic API directly.

---

### 5.2 RevenueCat (IAP)

**Usage:** Subscription management (Plus $6.99/mo, Pro $11.99/mo)

**Security:**
- Receipt validation server-side
- API key in environment variable (not hardcoded)
- Test key used until production ready

**Code Location:** `client/hooks/useSubscription.ts`

---

### 5.3 Railway (Backend Hosting)

**Security:**
- Automatic HTTPS/TLS 1.3
- Environment variables for secrets
- Structured logging with PII redaction

**Monitoring:** Sentry for error tracking (PII scrubbed)

---

## 6. App Store Specific Information

### 6.1 Safety Disclaimers

**Prominent Disclaimers:**
- Onboarding screen: "Noor is for reflection, not crises"
- Safety screen (before first use): "This is not therapy, medical advice, or emergency support"
- App Store description: Clear positioning as personal growth tool

**Crisis Resources:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741
- Emergency services: 911

**Reviewer Note:** We make it **very clear** that Noor is not a substitute for professional mental health care.

---

### 6.2 Age Rating

**Recommended:** 17+ (Frequent/Intense Medical/Treatment Information)

**Rationale:**
- App deals with mental health themes (rumination, distress)
- AI provides cognitive reframing (not medical advice, but therapy-adjacent)
- Requires maturity to understand limitations

---

### 6.3 Data Collection Disclosure

**App Privacy Questionnaire:**
- ✅ Contact Info: Email (optional)
- ✅ User Content: Journal entries
- ✅ Usage Data: Screen views, interactions (anonymized)
- ✅ Diagnostics: Crash reports (PII scrubbed)

**Not Linked to User:**
- Usage analytics (anonymized)

**Not Collected:**
- Financial Info (handled by Apple IAP)
- Location
- Contacts
- Browsing History

---

### 6.4 Testing Instructions for Reviewers

**No Login Required:**
- App uses anonymous sessions (no credentials needed)
- Reviewer can immediately start using app

**Test Flow:**
1. Open Noor → Complete onboarding (3 screens)
2. Read safety disclaimer → Acknowledge
3. Create reflection → Enter thought → View AI analysis
4. Check history screen → See past reflections
5. (Optional) Enable biometric auth in Settings → Test Face ID

**Test Accounts:** Not needed (anonymous sessions)

---

## 7. Security Testing Results

### Automated Verification

**Script:** `scripts/verify-security.sh`

**Last Run:** 2026-02-01

**Results:** ✅ All 35+ security checks passed
- ✅ No hardcoded API keys
- ✅ Biometric auth configured
- ✅ Screenshot prevention active
- ✅ Jailbreak detection working
- ✅ Secure storage implemented
- ✅ HTTPS-only communication
- ✅ Security documentation complete

---

### OWASP Mobile Top 10 Compliance

| Risk | Status | Mitigation |
|------|--------|------------|
| M1: Improper Platform Usage | ✅ PASS | All platform APIs used correctly |
| M2: Insecure Data Storage | ✅ PASS | iOS Keychain + AES-256-GCM encryption |
| M3: Insecure Communication | ✅ PASS | HTTPS-only, TLS 1.3 |
| M4: Insecure Authentication | ✅ PASS | HMAC-signed tokens + biometric option |
| M5: Insufficient Cryptography | ✅ PASS | AES-256-GCM, unique IVs |
| M6: Insecure Authorization | ✅ PASS | Server-side authorization checks |
| M7: Client Code Quality | ✅ PASS | TypeScript strict mode, 277 tests passing |
| M8: Code Tampering | ⚠️ PARTIAL | Jailbreak detection (RN limitation) |
| M9: Reverse Engineering | ⚠️ PARTIAL | API keys server-side (RN limitation) |
| M10: Extraneous Functionality | ✅ PASS | No debug code in production |

**8/10 Full Pass, 2/10 Partial (acceptable limitations of React Native architecture)**

---

## 8. Security Contact

**Security Issues:** security@getbyteworthy.com
**Privacy Questions:** privacy@getbyteworthy.com
**General Support:** scale@getbyteworthy.com

**Response Time:** Within 48 hours
**Critical Issue Resolution:** Within 7 days

---

## 9. Conclusion

**Noor implements enterprise-grade mobile security** to protect users' personal reflections:

✅ **Data Protection:** AES-256-GCM encryption (server) + iOS Keychain (client)
✅ **Mobile Hardening:** Biometric auth, screenshot prevention, jailbreak detection
✅ **API Security:** Rate limiting, CSRF protection, HMAC-signed sessions, input validation
✅ **Privacy Compliance:** GDPR, CCPA, COPPA compliant with full user control
✅ **Third-Party Security:** Claude API key server-side only, RevenueCat receipt validation

**Security is a core feature of Noor, not an afterthought.**

We welcome any questions from the App Store review team about our security implementation.

---

**Last Updated:** 2026-02-01
**Documentation:** [SECURITY.md](../../SECURITY.md), [PRIVACY_POLICY.md](../../PRIVACY_POLICY.md)
**Security Testing:** [SECURITY_TESTING_CHECKLIST.md](../SECURITY_TESTING_CHECKLIST.md)
