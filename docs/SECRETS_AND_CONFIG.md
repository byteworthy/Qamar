# Secrets and Configuration Management

**Purpose**: Secure secrets handling and configuration for Noor  
**Last Updated**: 2026-01-19  
**Owner**: Engineering / DevOps

---

## Overview

This document outlines how to securely manage secrets (API keys, database passwords, etc.) across different environments. Following these practices prevents credential leaks and security breaches.

**Principles:**
- Never commit secrets to Git
- Use environment variables for all secrets
- Rotate secrets regularly
- Minimize secret access
- Audit secret usage

---

## What Must Be Secrets

### Server Secrets (NEVER commit these)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# AI Service
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...

# Payment Processing (Web only, not mobile)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Monitoring/Logging
SENTRY_DSN=https://...@sentry.io/...

# Session Encryption
SESSION_SECRET=random-256-bit-string

# Any API keys for external services
```

### Client Secrets (Use public config only)

```bash
# Public configuration (safe to expose)
EXPO_PUBLIC_DOMAIN=api.yourdomain.com

# NEVER put these in client:
# ❌ AI_INTEGRATIONS_OPENAI_API_KEY
# ❌ DATABASE_URL
# ❌ STRIPE_SECRET_KEY
```

### Non-Secrets (Safe to commit)

```bash
# Port number
PORT=5000

# Node environment
NODE_ENV=production

# Feature flags
ENABLE_ANALYTICS=true

# Public URLs
PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Local Development Storage Pattern

### Using .env Files

**Create `.env` file** (git-ignored):
```bash
DATABASE_URL=postgresql://localhost:5432/noor_dev
AI_INTEGRATIONS_OPENAI_API_KEY=sk-test-...
STRIPE_SECRET_KEY=sk_test_...
NODE_ENV=development
```

**Load in code:**
```typescript
// Load at app startup
import 'dotenv/config';

// Access
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
```

### .env.example Template

**Commit this** (no actual secrets):
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# AI Integration
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=5000
NODE_ENV=development
```

### .gitignore Configuration

**Ensure these are in `.gitignore`:**
```
.env
.env.local
.env.*.local
*.pem
*.key
secrets/
```

---

## CI/CD Storage Pattern

### GitHub Actions Secrets

**Set in GitHub Settings → Secrets and variables → Actions:**

```bash
# 1. Go to repository settings
# 2. Navigate to Secrets and variables → Actions
# 3. Click "New repository secret"
# 4. Add each secret:

DATABASE_URL
AI_INTEGRATIONS_OPENAI_API_KEY
STRIPE_SECRET_KEY
SENTRY_DSN
EXPO_TOKEN  # For EAS builds
```

**Access in workflow:**
```yaml
# .github/workflows/ci.yml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  AI_INTEGRATIONS_OPENAI_API_KEY: ${{ secrets.AI_INTEGRATIONS_OPENAI_API_KEY }}
```

### EAS Build Secrets

**Set via EAS CLI:**
```bash
# Set secret for production builds
npx eas secret:create \
  --name EXPO_PUBLIC_DOMAIN \
  --value "api.yourdomain.com" \
  --type string \
  --scope project \
  --environment production

# List secrets
npx eas secret:list
```

**Or via eas.json:**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_DOMAIN": "api.yourdomain.com"
      }
    }
  }
}
```

**Note:** Only `EXPO_PUBLIC_*` variables are safe in client builds.

---

## Production Storage Pattern

### Option A: Platform Environment Variables (Replit, Heroku, Railway)

**Replit:**
1. Go to "Secrets" tab in Replit
2. Add key-value pairs
3. Access via `process.env.KEY_NAME`

**Heroku:**
```bash
heroku config:set DATABASE_URL=...
heroku config:set AI_INTEGRATIONS_OPENAI_API_KEY=...
```

**Railway:**
```bash
railway variables set DATABASE_URL=...
railway variables set AI_INTEGRATIONS_OPENAI_API_KEY=...
```

### Option B: Cloud Secret Managers (AWS, GCP, Azure)

**AWS Secrets Manager:**
```bash
# Store secret
aws secretsmanager create-secret \
  --name noor-cbt/openai-api-key \
  --secret-string "sk-..."

# Access in code
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient();
const response = await client.send(
  new GetSecretValueCommand({ SecretId: "noor-cbt/openai-api-key" })
);
const apiKey = response.SecretString;
```

**Google Cloud Secret Manager:**
```bash
# Store secret
gcloud secrets create openai-api-key --data-file=-
# (paste secret, then Ctrl+D)

# Access in code
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const client = new SecretManagerServiceClient();
const [version] = await client.accessSecretVersion({
  name: 'projects/PROJECT_ID/secrets/openai-api-key/versions/latest',
});
const apiKey = version.payload.data.toString();
```

### Option C: .env File (Small deployments only)

**Only for very small deployments where platform secrets aren't available:**

1. Create `.env` on server (via SSH)
2. Set restrictive permissions: `chmod 600 .env`
3. Never commit to Git
4. Load with `dotenv` package

**⚠️ Not recommended for production - use platform secrets instead**

---

## Secret Rotation and Revocation

### When to Rotate Secrets

**Immediately:**
- Secret accidentally committed to Git
- Employee with access leaves team
- Suspected breach or leak
- Secret exposed in logs or error messages

**Regularly (Scheduled):**
- Database passwords: Every 90 days
- API keys: Every 180 days
- Session secrets: Every 90 days

### Rotation Steps

**1. Generate New Secret**
```bash
# Example: New OpenAI API key
# 1. Log into OpenAI dashboard
# 2. Create new API key
# 3. Copy new key
```

**2. Update in All Environments**
```bash
# Development
# Update .env file

# Staging
heroku config:set AI_INTEGRATIONS_OPENAI_API_KEY=sk-new... --app noor-cbt-staging

# Production
heroku config:set AI_INTEGRATIONS_OPENAI_API_KEY=sk-new... --app noor-cbt-prod
```

**3. Deploy/Restart Applications**
```bash
# Trigger redeploy to pick up new env vars
git commit --allow-empty -m "Rotate API keys"
git push heroku main
```

**4. Verify New Secret Works**
```bash
# Test API endpoints
curl https://api.yourdomain.com/health
curl -X POST https://api.yourdomain.com/api/analyze -d '{"thought":"test"}'
```

**5. Revoke Old Secret**
```bash
# Example: Delete old OpenAI key from dashboard
# Only after verifying new key works!
```

**6. Document Rotation**
```bash
# Update rotation log
echo "2026-01-19: Rotated OpenAI API key" >> secrets/rotation-log.txt
```

### Emergency Revocation

**If secret is leaked:**

1. **Immediate:** Revoke secret in provider dashboard (OpenAI, Stripe, etc.)
2. **Immediate:** Generate new secret
3. **Within 1 hour:** Update all environments
4. **Within 2 hours:** Deploy to production
5. **Within 24 hours:** Audit logs for unauthorized usage
6. **Within 48 hours:** Post-mortem and prevention plan

---

## How to Avoid Leaking Keys

### Git Safety

**1. Use .gitignore**
```bash
# Always ignore
.env
.env.*
!.env.example
secrets/
*.pem
*.key
```

**2. Pre-commit Hooks**
```bash
# Install git-secrets
brew install git-secrets  # macOS
# or
apt-get install git-secrets  # Linux

# Initialize
git secrets --install
git secrets --register-aws  # Detects AWS keys

# Add patterns
git secrets --add 'sk-[a-zA-Z0-9]{48}'  # OpenAI keys
git secrets --add 'sk_live_[a-zA-Z0-9]{99}'  # Stripe keys
```

**3. Check Before Committing**
```bash
# Scan staged files
git diff --cached | grep -E "sk-|password|secret"

# If found, abort commit!
git reset
```

### Code Safety

**1. Never Hardcode Secrets**
```typescript
// ❌ BAD - hardcoded
const apiKey = "sk-1234567890abcdef";

// ✅ GOOD - from environment
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
```

**2. Sanitize Logs**
```typescript
// ❌ BAD - logs secret
console.log('API Key:', process.env.AI_INTEGRATIONS_OPENAI_API_KEY);

// ✅ GOOD - redacts secret
console.log('API Key:', process.env.AI_INTEGRATIONS_OPENAI_API_KEY?.slice(0, 7) + '...');
```

**3. Don't Send Secrets to Client**
```typescript
// ❌ BAD - exposes server secret
res.json({ apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY });

// ✅ GOOD - only send public config
res.json({ publicDomain: process.env.EXPO_PUBLIC_DOMAIN });
```

### Error Handling Safety

**1. Sanitize Error Messages**
```typescript
try {
  await openai.createCompletion({ /* ... */ });
} catch (error) {
  // ❌ BAD - may expose API key in error
  console.error(error);
  
  // ✅ GOOD - sanitized error
  console.error('OpenAI API error:', error.message);
}
```

**2. Use Error Tracking Sanitization**
```typescript
Sentry.init({
  beforeSend(event) {
    // Remove sensitive data
    if (event.exception) {
      const message = event.exception.values?.[0]?.value;
      if (message?.includes('sk-')) {
        event.exception.values[0].value = message.replace(/sk-[a-zA-Z0-9]{48}/g, 'sk-***');
      }
    }
    return event;
  }
});
```

---

## Secret Access Audit

### Who Has Access

**Production Secrets:**
- Engineering lead: All secrets
- Senior engineers: All secrets
- Junior engineers: Read-only (via CI/CD)
- Support team: No access

**Staging Secrets:**
- All engineers: Full access

**Development Secrets:**
- All engineers: Full access (test keys only)

### Access Log

Maintain a log of who has access:

```markdown
# secrets/access-log.md

## Production Secret Access

| Person | Role | Secrets | Granted | Revoked |
|--------|------|---------|---------|---------|
| John Doe | Engineering Lead | All | 2026-01-01 | - |
| Jane Smith | Senior Engineer | All | 2026-01-05 | - |
| Bob Jones | Junior Engineer | None | - | - |

## Last Rotation Dates

| Secret | Last Rotated | Next Rotation Due |
|--------|--------------|-------------------|
| DATABASE_URL | 2026-01-15 | 2026-04-15 |
| OPENAI_API_KEY | 2026-01-10 | 2026-07-10 |
| STRIPE_SECRET | 2026-01-01 | 2026-07-01 |
```

---

## If a Secret is Leaked

### Detection

**How to detect a leak:**
- GitHub secret scanning alerts
- Monitoring unusual API usage
- Error logs showing exposed keys
- Security audit findings

### Response Checklist

- [ ] **Immediately revoke** the leaked secret
- [ ] Generate and deploy new secret
- [ ] Check logs for unauthorized usage
- [ ] Notify affected service provider (OpenAI, Stripe, etc.)
- [ ] Review recent commits for other potential leaks
- [ ] Update .gitignore if needed
- [ ] Conduct team training on secret safety
- [ ] Document incident in post-mortem
- [ ] Update this runbook with lessons learned

### Git History Cleanup (If committed)

**If secret was committed to Git:**

```bash
# 1. Use BFG Repo-Cleaner (easier than git-filter-branch)
brew install bfg  # macOS
# or download from: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Clone a fresh copy
git clone --mirror https://github.com/yourusername/Noor-CBT.git

# 3. Remove secret from history
bfg --replace-text passwords.txt Noor-CBT.git
# (passwords.txt contains: sk-1234567890abcdef==>***REMOVED***)

# 4. Clean up
cd Noor-CBT.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Force push (⚠️ DANGEROUS - coordinate with team)
git push --force

# 6. Everyone must re-clone
# Team members: rm -rf Noor-CBT && git clone ...
```

**⚠️ Force-pushing rewrites history - coordinate with entire team first!**

---

## Best Practices Checklist

### Development
- [ ] Use .env file for local secrets
- [ ] Never commit .env to Git
- [ ] Use .env.example as template
- [ ] Check .gitignore includes .env
- [ ] Use test/sandbox keys only

### Deployment
- [ ] Use platform environment variables
- [ ] Never deploy with secrets in code
- [ ] Verify secrets are set before deploy
- [ ] Use different secrets per environment

### Security
- [ ] Rotate secrets every 90-180 days
- [ ] Use strong, random secrets (256-bit minimum)
- [ ] Limit secret access to essential personnel
- [ ] Audit secret usage regularly
- [ ] Enable GitHub secret scanning

### Monitoring
- [ ] Set up alerts for unusual API usage
- [ ] Monitor for secret exposure in logs
- [ ] Track secret rotation dates
- [ ] Review access logs monthly

---

## Useful Commands

```bash
# Generate secure random secret (Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check for exposed secrets in code
grep -r "sk-" . --exclude-dir=node_modules
grep -r "password" . --exclude-dir=node_modules

# List current environment variables
env | grep -E "DATABASE|API_KEY|SECRET"

# Test if secret is set
test -n "$AI_INTEGRATIONS_OPENAI_API_KEY" && echo "Set" || echo "Not set"
```

---

## Emergency Contacts

- **GitHub Security**: security@github.com
- **OpenAI Security**: security@openai.com
- **Stripe Security**: security@stripe.com
- **Team Lead**: [TBD]

---

**Last Updated**: 2026-01-19  
**Next Review**: Quarterly or after any security incident
