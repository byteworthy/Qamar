# App Store Networking Notes

**Purpose**: Networking requirements and common pitfalls for iOS/Android app submission  
**Last Updated**: 2026-01-19  
**Owner**: Platform Architecture

---

## Overview

Mobile apps submitted to Apple App Store and Google Play Store have strict networking requirements. This document outlines requirements and common rejection reasons to avoid delays in approval.

**Key Principle**: All network communication must be secure (HTTPS/TLS).

---

## iOS HTTPS Requirements

### Apple App Transport Security (ATS)

**What is ATS?**
- Security feature introduced in iOS 9
- Enforces secure connections for all network requests
- Blocks non-HTTPS (HTTP) connections by default
- Cannot be disabled for production apps

**ATS Requirements:**
- ✅ HTTPS only (no HTTP)
- ✅ TLS 1.2 or higher
- ✅ Valid SSL/TLS certificate
- ✅ Certificate from trusted Certificate Authority (CA)
- ✅ Forward secrecy ciphers
- ✅ SHA-256 or better certificate signature

### What ATS Blocks

**❌ Blocked by ATS:**
- HTTP connections (http://)
- Self-signed certificates
- Expired certificates
- Invalid certificate chains
- TLS 1.0 or 1.1
- Weak ciphers (RC4, DES, MD5)
- Localhost connections (except in development)

**✅ Allowed by ATS:**
- HTTPS connections (https://)
- Valid certificates from trusted CAs (Let's Encrypt, DigiCert, etc.)
- TLS 1.2+ with modern ciphers
- WebSocket Secure (wss://)

### ATS Configuration (Info.plist)

**Default (Recommended for Production):**
```xml
<!-- No ATS configuration needed - secure by default -->
<!-- All connections must use HTTPS -->
```

**Development Only (Never in production):**
```xml
<!-- For testing with localhost only -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsLocalNetworking</key>
  <true/>
</dict>
```

**⚠️ NEVER DO THIS (Will be rejected):**
```xml
<!-- This disables ATS - Apple will reject -->
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

---

## Android HTTPS Requirements

### Network Security Configuration

**Android 9+ (API 28+):**
- Cleartext (HTTP) traffic blocked by default
- HTTPS required for all network calls
- Similar to iOS ATS

**Network Security Config (res/xml/network_security_config.xml):**

**Default (Production - Recommended):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <!-- Default: Only HTTPS allowed -->
  <base-config cleartextTrafficPermitted="false"/>
</network-security-config>
```

**Development Only:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <!-- Allow localhost for development -->
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="true">localhost</domain>
    <domain includeSubdomains="true">10.0.2.2</domain>
  </domain-config>
  
  <!-- Production domains must use HTTPS -->
  <base-config cleartextTrafficPermitted="false"/>
</network-security-config>
```

---

## SSL/TLS Certificate Requirements

### Valid Certificate Checklist

- [ ] **Issued by trusted CA** (Let's Encrypt, DigiCert, Sectigo, etc.)
- [ ] **Not expired** (check expiry date)
- [ ] **Matches domain** (certificate CN/SAN matches your API domain)
- [ ] **Full certificate chain** (root + intermediate certificates)
- [ ] **TLS 1.2 or higher** (TLS 1.3 preferred)
- [ ] **Modern ciphers** (no RC4, DES, 3DES)
- [ ] **2048-bit key or stronger**

### Certificate Authorities (Trusted by iOS/Android)

**Free Options:**
- Let's Encrypt (auto-renewed, trusted by all platforms)
- ZeroSSL
- Cloudflare (with their proxy)

**Paid Options:**
- DigiCert
- Sectigo (formerly Comodo)
- GlobalSign
- GoDaddy

**Included with Hosting Platforms:**
- Railway: Automatic Let's Encrypt
- Heroku: Automatic Let's Encrypt
- Vercel: Automatic
- Netlify: Automatic
- AWS Certificate Manager (ACM): Free
- Google Cloud Certificate Manager: Free

### Testing SSL Certificate

**Check certificate validity:**
```bash
# Test SSL certificate
curl -v https://api.noorcbt.com

# Check certificate details
openssl s_client -connect api.noorcbt.com:443 -servername api.noorcbt.com

# Online tool
https://www.ssllabs.com/ssltest/
```

**Expected:**
- Grade A or A+ on SSL Labs
- TLS 1.2 or 1.3
- No certificate warnings
- Valid certificate chain

---

## Domain and DNS Requirements

### Domain Setup

**Requirements:**
- Own domain (e.g., noorcbt.com)
- Subdomain for API (e.g., api.noorcbt.com)
- DNS properly configured
- SSL certificate for domain

**DNS Records:**
```
# A record (IPv4)
api.noorcbt.com. 300 IN A 192.0.2.1

# AAAA record (IPv6, optional but recommended)
api.noorcbt.com. 300 IN AAAA 2001:db8::1

# CNAME record (if using platform like Railway)
api.noorcbt.com. 300 IN CNAME your-app.railway.app.
```

### Platform-Specific Domain Setup

**Railway:**
1. Add custom domain in Railway dashboard
2. Update DNS CNAME to point to Railway
3. Railway auto-provisions SSL certificate
4. Wait for DNS propagation (5-30 minutes)

**Heroku:**
```bash
heroku domains:add api.noorcbt.com
# Follow instructions to update DNS
heroku certs:auto:enable
```

**Vercel/Netlify:**
- Add domain in dashboard
- Update DNS as instructed
- Auto SSL within minutes

---

## Common App Store Rejection Reasons

### iOS App Store Rejections

**1. HTTP Connections (ATS Violation)**
- **Reason**: App makes HTTP requests
- **Fix**: Ensure all API calls use HTTPS
- **Prevention**: Test with production backend before submission

**2. Invalid SSL Certificate**
- **Reason**: Certificate expired, self-signed, or untrusted
- **Fix**: Use certificate from trusted CA (Let's Encrypt, etc.)
- **Prevention**: Check certificate validity before submission

**3. Localhost/Development URLs**
- **Reason**: App configured with localhost or dev URLs
- **Fix**: Build with production URL (EXPO_PUBLIC_DOMAIN=api.noorcbt.com)
- **Prevention**: Use production build profile

**4. NSAllowsArbitraryLoads Exception**
- **Reason**: ATS disabled in Info.plist
- **Fix**: Remove exception, use HTTPS
- **Prevention**: Never disable ATS for production

**5. Privacy Policy Missing/Inaccessible**
- **Reason**: Privacy Policy URL not accessible or returns 404
- **Fix**: Publish privacy policy at provided URL
- **Prevention**: Verify URL is live before submission

**6. Subscription Billing Outside IAP**
- **Reason**: App uses external payment (Stripe web checkout)
- **Fix**: Only use Apple In-App Purchase for subscriptions
- **Prevention**: Remove all external payment flows on iOS

**7. Crash on Launch**
- **Reason**: App crashes when reviewer tests it
- **Fix**: Test thoroughly, check logs, fix bugs
- **Prevention**: TestFlight internal testing before submission

**8. Metadata Misleading**
- **Reason**: App description doesn't match functionality
- **Fix**: Ensure description accurately reflects features
- **Prevention**: Review metadata carefully

### Google Play Store Rejections

**1. Cleartext Traffic**
- **Reason**: App allows HTTP connections
- **Fix**: Set cleartextTrafficPermitted="false"
- **Prevention**: Test on Android 9+ devices

**2. Privacy Policy Missing**
- **Reason**: Privacy policy URL not provided or inaccessible
- **Fix**: Provide valid, accessible privacy policy URL
- **Prevention**: Verify URL works

**3. Data Safety Form Incomplete**
- **Reason**: Data collection disclosure incomplete or inaccurate
- **Fix**: Complete data safety questionnaire accurately
- **Prevention**: Match data safety to actual app behavior

**4. Billing Policy Violation**
- **Reason**: External payment processing for subscriptions
- **Fix**: Only use Google Play Billing
- **Prevention**: Remove external payment flows on Android

**5. Permissions Not Justified**
- **Reason**: Requesting permissions not used by app
- **Fix**: Remove unused permissions
- **Prevention**: Only request necessary permissions

**6. Crash or ANR (App Not Responding)**
- **Reason**: App crashes or freezes during testing
- **Fix**: Fix bugs, improve performance
- **Prevention**: Internal testing track before production

---

## Noor CBT Specific Checklist

### Pre-Submission Network Checklist

**Backend:**
- [ ] Backend deployed to production (Railway/Heroku/etc.)
- [ ] HTTPS enabled (automatic with most platforms)
- [ ] SSL certificate valid (not expired, trusted CA)
- [ ] Health check endpoint working: `curl https://api.noorcbt.com/health`
- [ ] All API endpoints return valid responses
- [ ] Domain DNS properly configured

**Mobile App:**
- [ ] Built with production profile: `npx eas build --profile production`
- [ ] EXPO_PUBLIC_DOMAIN set to production domain (api.noorcbt.com)
- [ ] No localhost or HTTP URLs in code
- [ ] Tested on real devices (iOS 13+, Android 9+)
- [ ] No ATS exceptions in Info.plist
- [ ] Network security config correct (Android)

**Testing:**
- [ ] Complete one full CBT journey with production backend
- [ ] Crisis detection works (test with crisis language)
- [ ] Subscription flow works (sandbox/test)
- [ ] History screen loads reflections
- [ ] No network errors in console logs
- [ ] App works offline (local storage)

---

## Development vs Production URLs

### Development (Local Testing)

**Backend:**
```bash
# Run local server
npm run server:dev
# Server at http://localhost:5000
```

**Mobile Client:**
```bash
# .env or eas.json
EXPO_PUBLIC_DOMAIN=localhost:5000

# iOS allows localhost in development
# Android emulator uses 10.0.2.2 for host machine
```

**Note:** ATS allows localhost for development automatically.

---

### Staging (Optional)

**Backend:**
```bash
https://noor-cbt-staging.railway.app
```

**Mobile Client:**
```bash
EXPO_PUBLIC_DOMAIN=noor-cbt-staging.railway.app
```

**Build:**
```bash
npx eas build --profile staging --platform ios
```

---

### Production (App Store/Play Store)

**Backend:**
```bash
https://api.noorcbt.com
```

**Mobile Client:**
```bash
EXPO_PUBLIC_DOMAIN=api.noorcbt.com
```

**Build:**
```bash
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

---

## Network Error Handling

### Handle Network Failures Gracefully

**Common Scenarios:**
1. **No internet connection**
2. **Backend down (5xx errors)**
3. **Slow network (timeouts)**
4. **SSL certificate errors**

**Implementation:**
```typescript
// client/lib/api.ts
import { Alert } from 'react-native';

async function apiCall(endpoint: string, data: any) {
  try {
    const response = await fetch(`https://${EXPO_PUBLIC_DOMAIN}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      timeout: 30000, // 30 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    // Handle different error types
    if (error.message.includes('Network request failed')) {
      Alert.alert(
        'No Internet',
        'Please check your connection and try again.'
      );
    } else if (error.message.includes('timeout')) {
      Alert.alert(
        'Request Timeout',
        'The server is taking too long to respond.'
      );
    } else {
      Alert.alert(
        'Error',
        'Something went wrong. Please try again later.'
      );
    }
    throw error;
  }
}
```

---

## Testing Checklist Before Submission

### iOS Testing

- [ ] Test on real iPhone (not just simulator)
- [ ] Test on iOS 13, 14, 15, 16, 17 if possible
- [ ] Verify HTTPS calls work
- [ ] Check console for ATS warnings
- [ ] Test airplane mode (offline functionality)
- [ ] Test slow network (throttle in Xcode)
- [ ] Submit to TestFlight for internal testing
- [ ] Have 3+ people test via TestFlight

### Android Testing

- [ ] Test on real Android device (not just emulator)
- [ ] Test on Android 9, 10, 11, 12, 13, 14
- [ ] Verify HTTPS calls work
- [ ] Check logcat for network errors
- [ ] Test airplane mode
- [ ] Test slow network (throttle in DevTools)
- [ ] Upload to Play Internal Testing
- [ ] Have 3+ people test via Internal Testing

---

## Quick Reference

### Valid Production URL
```
✅ https://api.noorcbt.com/api/analyze
```

### Invalid URLs (Will Cause Rejection)
```
❌ http://api.noorcbt.com/api/analyze  (HTTP)
❌ http://localhost:5000/api/analyze  (HTTP + localhost)
❌ https://192.168.1.100:5000/api/analyze  (IP address)
❌ https://self-signed.com/api/analyze  (Invalid cert)
```

### Certificate Checker
```bash
# Check your API certificate
curl -v https://api.noorcbt.com/health 2>&1 | grep -i "SSL certificate verify"

# Expected: "SSL certificate verify ok"
```

---

## Resources

**Apple Documentation:**
- App Transport Security: https://developer.apple.com/documentation/security/preventing_insecure_network_connections
- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

**Android Documentation:**
- Network Security Config: https://developer.android.com/training/articles/security-config
- Play Store Policies: https://play.google.com/about/developer-content-policy/

**SSL Testing:**
- SSL Labs Test: https://www.ssllabs.com/ssltest/
- What's My Chain Cert: https://whatsmychaincert.com/

---

**Last Updated**: 2026-01-19  
**Next Review**: Before app store submission
