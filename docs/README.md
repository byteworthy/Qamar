# Noor Documentation Index

Complete documentation for Noor - Islamic CBT mobile application.

---

## 📖 Quick Links

- [Main README](../README.md) - Project overview and quick start
- [Security Policy](../SECURITY.md) - Security measures and vulnerability reporting
- [Privacy Policy](../PRIVACY_POLICY.md) - GDPR/CCPA/COPPA compliant privacy policy
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute to Noor
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community guidelines
- [Changelog](../CHANGELOG.md) - Version history and updates

---

## 🚀 Development

### Getting Started
- [**Quick Start Guide**](development/QUICK_START.md) - Get Noor running in 10 minutes
- [Development Setup](development/SETUP.md) - Detailed development environment setup
- [Testing Guide](development/TESTING.md) - Run and write tests
- [Architecture Overview](development/ARCHITECTURE.md) - System design and component relationships

### Development Workflows
- [Git Workflow](development/GIT_WORKFLOW.md) - Branching strategy and commit guidelines
- [Code Review Process](development/CODE_REVIEW.md) - How to request and perform code reviews
- [Debugging Guide](development/DEBUGGING.md) - Common issues and debugging techniques
- [Performance Optimization](development/PERFORMANCE.md) - Profiling and optimization strategies

---

## 🏗️ Deployment

### Backend Deployment
- [**Railway Deployment**](deployment/RAILWAY.md) - Deploy backend to Railway
- [Environment Variables](deployment/ENVIRONMENT.md) - Required environment configuration
- [Database Setup](deployment/DATABASE.md) - Postgres configuration (if applicable)
- [Monitoring Setup](deployment/MONITORING.md) - Sentry error tracking and Winston logging

### Frontend Deployment
- [Expo Build](../mobile/EXPO_BUILD.md) - Build mobile apps for iOS/Android
- [EAS Build Configuration](deployment/EAS_CONFIG.md) - Expo Application Services setup
- [App Signing](deployment/APP_SIGNING.md) - iOS certificates and Android keystores

---

## 📱 Mobile Development

### Security Features
- [**Mobile Security Overview**](mobile/MOBILE_SECURITY.md) - Comprehensive security implementation
- [Biometric Authentication](mobile/BIOMETRIC_AUTH.md) - Face ID, Touch ID, Fingerprint setup
- [Screenshot Prevention](mobile/SCREENSHOT_PROTECTION.md) - Sensitive screen protection
- [Jailbreak Detection](mobile/JAILBREAK_DETECTION.md) - Device security checks
- [Secure Storage](mobile/SECURE_STORAGE.md) - iOS Keychain / Android Keystore usage

### Platform-Specific
- [iOS Development](mobile/IOS_DEVELOPMENT.md) - iOS-specific setup and configuration
- [Android Development](mobile/ANDROID_DEVELOPMENT.md) - Android-specific setup and configuration
- [Expo Configuration](mobile/EXPO_CONFIG.md) - app.json and expo modules

---

## 🏪 App Store Submission

### iOS App Store
- [**iOS App Store Guide**](store-submission/IOS_APP_STORE.md) - Complete submission guide
- [App Store Connect Setup](store-submission/APP_STORE_CONNECT.md) - Account configuration
- [TestFlight Beta Testing](store-submission/TESTFLIGHT.md) - Beta testing process
- [App Store Review Guidelines](store-submission/IOS_REVIEW_GUIDELINES.md) - What reviewers check

### Google Play Store
- [**Google Play Store Guide**](store-submission/GOOGLE_PLAY.md) - Complete submission guide
- [Play Console Setup](store-submission/PLAY_CONSOLE.md) - Account configuration
- [Internal Testing](store-submission/PLAY_INTERNAL_TESTING.md) - Internal testing process
- [Data Safety Form](store-submission/PLAY_DATA_SAFETY.md) - How to fill Data Safety section

### Required Assets
- [App Screenshots](store-submission/SCREENSHOTS.md) - Required sizes and guidelines
- [App Icons](store-submission/APP_ICONS.md) - Icon design and export
- [App Preview Videos](store-submission/APP_PREVIEW_VIDEOS.md) - Video requirements (optional)
- [Store Listing Content](store-submission/STORE_LISTING.md) - App descriptions and keywords

---

## 🔒 Security & Compliance

### Security Documentation
- [Security Policy](../SECURITY.md) - Comprehensive security measures
- [Security Verification](../scripts/verify-mobile-security.sh) - Automated security checks
- [Penetration Testing](development/PENETRATION_TESTING.md) - Security testing procedures
- [Security Incident Response](development/INCIDENT_RESPONSE.md) - How to handle security incidents

### Compliance
- [GDPR Compliance](deployment/GDPR.md) - EU data protection compliance
- [CCPA Compliance](deployment/CCPA.md) - California privacy compliance
- [COPPA Compliance](deployment/COPPA.md) - Children's privacy compliance (under 13)
- [HIPAA Alignment](deployment/HIPAA.md) - Mental health data protection (not certified)

---

## 🧪 Testing

### Testing Documentation
- [Testing Guide](development/TESTING.md) - Comprehensive testing overview
- [Unit Testing](development/UNIT_TESTING.md) - Writing Jest tests
- [Integration Testing](development/INTEGRATION_TESTING.md) - API endpoint testing
- [E2E Testing](development/E2E_TESTING.md) - End-to-end testing with Supertest
- [Mobile Testing](mobile/MOBILE_TESTING.md) - Testing on iOS/Android devices

### Quality Assurance
- [Code Coverage](development/CODE_COVERAGE.md) - Coverage requirements and tracking
- [Type Safety](development/TYPE_SAFETY.md) - TypeScript best practices
- [Code Quality](development/CODE_QUALITY.md) - ESLint, Prettier, and code standards

---

## 📚 API Documentation

### Backend APIs
- [API Overview](development/API_OVERVIEW.md) - RESTful API endpoints
- [Authentication API](development/API_AUTH.md) - Session management endpoints
- [Reflection API](development/API_REFLECTIONS.md) - Journal entry endpoints
- [AI API](development/API_AI.md) - Claude integration endpoints
- [Islamic Content API](development/API_ISLAMIC_CONTENT.md) - Quran/Hadith endpoints

### Error Handling
- [Error Codes](development/ERROR_CODES.md) - Standard error responses
- [Rate Limiting](development/RATE_LIMITING.md) - API rate limit policies

---

## 🎨 Design & UX

### Design System
- [UI Components](development/UI_COMPONENTS.md) - React Native Paper components
- [Color Palette](development/COLOR_PALETTE.md) - Brand colors and theming
- [Typography](development/TYPOGRAPHY.md) - Font usage and hierarchy
- [Iconography](development/ICONOGRAPHY.md) - Icon library and usage

### User Experience
- [User Flows](development/USER_FLOWS.md) - Key user journeys
- [Accessibility](development/ACCESSIBILITY.md) - WCAG compliance and screen readers
- [Internationalization](development/I18N.md) - Multi-language support (planned)

---

## 🗂️ Archive

Completed work, outdated documentation, and historical records:

- [Completed Work Archive](archive/COMPLETED_WORK/) - Finished phases and milestones
- [Security Audits](archive/audits/) - Historical security audits
- [Old Setup Guides](archive/setup/) - Legacy installation guides
- [Migration Docs](archive/migration/) - Database migration documentation
- [Stale Checklists](archive/checklists/) - Outdated task lists

---

## 📝 Recent Updates

### January 31, 2026 - Mobile Security Hardening (Phase 4)

- ✅ Implemented secure storage (iOS Keychain / Android Keystore)
- ✅ Added biometric authentication (Face ID, Touch ID, Fingerprint)
- ✅ Implemented jailbreak/root detection
- ✅ Added screenshot prevention for sensitive screens
- ✅ Created comprehensive security documentation (SECURITY.md, PRIVACY_POLICY.md)
- ✅ Built security verification script (28/28 checks passing)
- ✅ All 277 tests passing, type-safe codebase (zero `any` types)
- ✅ App Store submission-ready

**Status**: 95% complete - ready for device testing and App Store submission

---

## 🤔 Need Help?

### Common Questions
- "How do I set up my development environment?" → [Quick Start Guide](development/QUICK_START.md)
- "How do I deploy the backend?" → [Railway Deployment](deployment/RAILWAY.md)
- "How do I build for iOS/Android?" → [Expo Build](mobile/EXPO_BUILD.md)
- "What security measures are implemented?" → [Security Policy](../SECURITY.md)
- "How do I submit to App Store?" → [iOS App Store Guide](store-submission/IOS_APP_STORE.md)

### Support
- **Technical Issues**: Open a [GitHub Issue](https://github.com/yourusername/Noor-CBT/issues)
- **Security Concerns**: security@getbyteworthy.com
- **General Support**: scale@getbyteworthy.com

---

## 🙏 Contributing

We welcome contributions! See:
- [Contributing Guide](../CONTRIBUTING.md) - How to contribute
- [Code of Conduct](../CODE_OF_CONDUCT.md) - Community guidelines
- [Development Setup](development/SETUP.md) - Get started with development

---

**Last Updated**: January 31, 2026
**Documentation Version**: 1.0.0

_"Verily, with hardship comes ease."_ - Quran 94:6
