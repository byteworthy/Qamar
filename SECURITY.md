# Noor Security Policy

**Last Updated:** January 31, 2026
**Version:** 1.0.0

## Reporting a Vulnerability

If you discover a security vulnerability in Noor, please report it responsibly:

- **Email:** security@getbyteworthy.com (from app.json support email)
- **Response Time:** Within 48 hours
- **Resolution Time:** Critical issues within 7 days

**Please include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact on user data
- Suggested fix (if any)
- Platform affected (iOS/Android/Both/Backend)

**DO NOT** publicly disclose security issues before we've had a chance to address them. We take user privacy and security very seriously.

---

## Security Measures

### 1. Data Protection

#### Encryption at Rest
- **Client-Side:**
  - Journal entries stored in iOS Keychain (iOS) / Android Keystore (Android)
  - Push notification tokens stored in secure storage
  - Session data encrypted in device secure storage
  - No plaintext storage of sensitive data in AsyncStorage
- **Server-Side:**
  - AES-256-GCM encryption for all stored reflections
  - Unique IV (Initialization Vector) per record
  - Encrypted fields: thought, reframe, intention
  - ENCRYPTION_KEY required in production environment

#### Encryption in Transit
- **HTTPS-only:** All API calls use TLS 1.3
- **Certificate Validation:** Server certificates validated on every request
- **No Mixed Content:** HTTP endpoints blocked at application level
- **API Domain:** noor-production-9ac5.up.railway.app

### 2. Authentication & Authorization

#### Session Management

- **Signed Tokens:** HMAC-SHA256 signed session tokens
- **Timing-Safe Comparison:** Prevents timing attacks on token verification
- **Mandatory Secret:** SESSION_SECRET environment variable required (no fallback)
- **Cookie Security:**
  - HTTP-only cookies (not accessible via JavaScript)
  - Secure flag enabled (HTTPS-only)
  - SameSite policy enforced
- **Session Duration:** 30 days with automatic renewal
- **Automatic Cleanup:** Sessions deleted after expiration

#### Biometric Authentication
- **Supported:**
  - iOS: Face ID, Touch ID
  - Android: Fingerprint, Face Recognition
- **Fallback:** Device passcode when biometric unavailable
- **Re-authentication:** Required after 5 minutes in background
- **User Control:** Can be enabled/disabled in settings

#### Password Security
- **Hashing:** bcrypt with cost factor 12
- **No Storage:** Passwords never stored in plaintext
- **Reset Flow:** Secure email-based password reset (when implemented)

### 3. Device Security

#### Jailbreak/Root Detection
- **Detection:** Active monitoring for compromised devices
- **Warning:** User notified about potential data exposure risks
- **Graceful UX:** User can choose to continue or exit
- **Continuous:** Checked on app launch and periodically

#### Screenshot Prevention
- **Sensitive Screens Protected:**
  - Journal entry screen (ThoughtCaptureScreen)
  - History screen (all past reflections)
  - Insights screen (AI-generated summaries)
- **Educational Content Unprotected:**
  - Quran verses (users can share Islamic knowledge)
  - Islamic guidance content
  - Prayer times
  - App settings
- **Platform Support:**
  - iOS: Prevents screenshots and screen recording
  - Android: Prevents screenshots and screen recording
  - Web: Not available (browser limitation)

### 4. Network Security

#### API Security
- **Rate Limiting:**
  - General endpoints: 100 requests/15 minutes (production)
  - AI endpoints: 10 requests/minute
  - Auth endpoints: 5 attempts/15 minutes
  - Health endpoint: 60 requests/minute
  - Prevents brute force and DoS attacks
- **Security Headers:** Comprehensive headers via Helmet
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  - Content-Security-Policy (see below)
- **Content-Security-Policy (CSP):**
  - default-src: 'self' (only load resources from same origin)
  - connect-src: 'self' https://api.anthropic.com (allow API calls to Claude AI)
  - frame-src: 'none' (block all iframe embedding)
  - Prevents XSS attacks and unauthorized resource loading
- **Request Body Size Limits:**
  - JSON requests: 10MB limit
  - URL-encoded requests: 10MB limit
  - Prevents Denial of Service attacks via large payloads
- **Input Validation:** All inputs validated with Zod schemas
- **Output Sanitization:** All responses sanitized before sending
- **CORS:** Properly configured for mobile apps and approved web origins

#### Request Security

- **CSRF Protection:** Double-submit cookie pattern
  - CSRF token generated per session
  - Token in both cookie and X-CSRF-Token header
  - Timing-safe comparison using crypto.timingSafeEqual
  - Protects all POST, PUT, DELETE requests
  - Prevents Cross-Site Request Forgery attacks

- **Bearer Tokens:** Authentication tokens in headers only
- **No URL Parameters:** Sensitive data never in URL query strings
- **Request Signing:** HMAC-based verification
- **Replay Prevention:** Timestamp validation

### 5. Privacy Protection

#### Data Minimization
- **Only Essential Data:**
  - Email (for account)
  - Journal entries (user-generated)
  - Usage analytics (anonymized)
- **No Collection:**
  - Real name (optional only)
  - Location data
  - Contacts
  - Photos (unless user adds to journal)
  - Browsing history

#### User Control
- **Export:** Users can export all their data (JSON format)
- **Delete:** Users can delete journal entries individually
- **Account Deletion:** Full account and data deletion available
- **Opt-out:** Analytics can be disabled in settings
- **Audit:** Users can request data audit

#### Data Retention
- **Automatic Cleanup:** Sessions older than 30 days automatically deleted
- **User-Controlled:** Users decide when to delete reflections
- **Backups:** Encrypted with same security as production
- **No Selling:** We never sell user data, ever

### 6. Islamic Content Security

#### Content Integrity
- **Quran Text:**
  - Source: Verified authenticated databases
  - No modifications to original text
  - Offline availability
- **Hadith:**
  - Sources: Sahih Bukhari, Sahih Muslim, authenticated collections
  - Chain of narration preserved
  - Scholar verification

#### User Islamic Content
- **Duas:** Encrypted and kept private
- **Reflections:** End-to-end encrypted
- **Progress:** Securely tracked
- **Export:** Encrypted backups available

### 7. Third-Party Services

We use minimal third-party services, all vetted for security:

#### Error Tracking
- **Sentry:** Crash reporting and error tracking
- **Data Sent:** Error messages, stack traces (no personal data)
- **PII Scrubbing:** Automatic removal of sensitive information
- **Configuration:** Optional (can be disabled)

#### Analytics
- **Firebase Analytics:** Usage patterns (anonymized)
- **Data Sent:** Screen views, button clicks (no personal content)
- **Anonymized:** No user identification
- **Optional:** Can be disabled in settings

#### Billing
- **Stripe:** Server-side payment processing (web only)
- **Apple IAP:** In-app purchases (iOS)
- **Google Play Billing:** In-app purchases (Android)
- **No Card Storage:** All payment data handled by payment processors

### 8. Monitoring & Response

#### Error Monitoring
- **Sentry Integration:** Real-time error tracking
- **Structured Logging:** Winston with PII redaction
- **Alert System:** Immediate notification of critical errors
- **Audit Trail:** All security events logged

#### Incident Response
1. **Detection:** Automated monitoring and user reports
2. **Assessment:** Severity evaluation within 24 hours
3. **Containment:** Immediate user notification if data affected
4. **Remediation:** Patch deployed within 7 days for critical issues
5. **Post-Mortem:** Incident review and preventive measures documented

---

## Compliance

### GDPR (EU Users)
- ✅ Data minimization
- ✅ User consent required
- ✅ Right to access data
- ✅ Right to deletion
- ✅ Data portability
- ✅ Privacy by design

### CCPA (California Users)
- ✅ Privacy policy accessible
- ✅ Do Not Sell disclosure
- ✅ Data disclosure
- ✅ Deletion requests honored

### COPPA (Users Under 13)
- ✅ Parental consent required
- ✅ No targeted advertising
- ✅ Minimal data collection
- ✅ Parent controls available

### App Store Guidelines
- ✅ iOS App Store compliance
- ✅ Google Play Store compliance
- ✅ Privacy manifests complete (iOS)
- ✅ Data Safety form complete (Android)

---

## Security Testing

### Continuous Monitoring
- **Automated Scanning:** Daily security scans via GitHub Actions
- **Dependency Auditing:** npm audit on every commit
- **Code Quality:** TypeScript strict mode, ESLint
- **Pre-commit Hooks:** Prevent committing secrets

### Testing Schedule
- **Pre-Release:** Full security audit before each release
- **Monthly:** Dependency updates and vulnerability checks
- **Quarterly:** Security review and penetration testing (planned)
- **Annually:** Comprehensive security audit

---

## Platform-Specific Security

### iOS Security
- ✅ Keychain for credential storage
- ✅ Face ID / Touch ID integration
- ✅ App Transport Security configured
- ✅ Privacy manifest (PrivacyInfo.xcprivacy)
- ✅ Bitcode enabled (if not using New Architecture)
- ✅ Screenshot prevention

### Android Security
- ✅ Keystore for credential storage
- ✅ Fingerprint / Face Recognition integration
- ✅ Network Security Config
- ✅ ProGuard code obfuscation
- ✅ Debuggable flag disabled in production
- ✅ APK signing configured
- ✅ Screenshot prevention

---

## Contact

- **Security Issues:** security@getbyteworthy.com
- **Privacy Questions:** privacy@getbyteworthy.com
- **General Support:** scale@getbyteworthy.com

---

## Version History

- **1.1.0** (January 31, 2026): Backend Security Hardening
  - **CSRF Protection:** Implemented double-submit cookie pattern with timing-safe comparison
  - **Security Headers:** Added comprehensive Helmet configuration
    - Content-Security-Policy to prevent XSS attacks
    - HSTS with 1-year max-age and subdomains
    - X-Frame-Options to prevent clickjacking
    - X-Content-Type-Options to prevent MIME sniffing
  - **Request Body Limits:** Added 10MB size limits to prevent DoS attacks
  - **Health Endpoint Protection:** Added dedicated rate limiter (60 req/min)
  - **Session Secret Security:** Removed hardcoded fallback, now requires explicit SESSION_SECRET
  - **Input Validation:** Enhanced server-side validation with Zod schemas on all endpoints
  - **Production Logging:** Wrapped sensitive console.logs with DEV checks
  - **Security Verification:** Updated verification script with 11 new backend security checks

- **1.0.0** (January 31, 2026): Initial security policy
  - Implemented SecureStore for sensitive data
  - Added biometric authentication
  - Implemented jailbreak/root detection
  - Added screenshot prevention
  - Created comprehensive security documentation

---

**Note:** This security policy is reviewed and updated with each major release. Last reviewed: January 31, 2026.
