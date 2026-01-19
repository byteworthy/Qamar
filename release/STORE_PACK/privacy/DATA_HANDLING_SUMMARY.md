# Data Handling Summary (Aligned to USER_TRANSPARENCY.md)

## Overview
This summary reflects actual app behavior and aligns with USER_TRANSPARENCY.md and the Chunk 1 Truth Audit. Noor is a privacy-first app that stores reflections locally on device and uses minimal data for safety and subscription entitlement.

## What We Collect
- Reflection content submitted for AI processing
- Emotional state indicators
- Session metadata (duration, interaction count, safety events)
- Subscription status (via app store billing)

## What We Do NOT Collect
- Precise location
- Contacts
- Social media data
- Device identifiers beyond basic app diagnostics
- Third-party advertising data
- Cross-app tracking identifiers

## How Data Is Used
- Provide reflection flow and core features
- Safety monitoring (crisis, scrupulosity, high-distress pacing)
- Subscription entitlement validation
- Support and data rights requests

## Data Storage & Security
- Reflection content stored locally on device
- Encrypted transmission (HTTPS/TLS) for API calls
- Encrypted storage at rest (per USER_TRANSPARENCY.md)
- No third-party advertising or behavioral data sharing

## Retention & Deletion
- Reflection content retained until user deletes
- Session logs retained per retention service (30 days; deletion automation pending)
- Subscription status retained via app store

## User Rights
- Delete reflections locally from History
- Export data as JSON (feature planned for Premium tier)
- Cancel subscription in App Store / Play Store

## Known Truth Audit Notes
- Data retention service exists but deletion automation is not implemented yet
- Hashed logging is limited to safety events only (not system-wide)

## Support & Privacy Contacts
- Support email: [placeholder]
- Privacy requests: [placeholder]

**Last Updated:** 2026-01-19
