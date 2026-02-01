# Railway Database Connection Fix - URGENT

**Status:** Backend deployed but DATABASE_URL is misconfigured
**Railway Domain:** `noor-production-9ac5.up.railway.app`
**Issue:** Health check shows `"database": "disconnected"`

---

## 🚨 CRITICAL FIX (2 minutes)

### Problem
The `DATABASE_URL` environment variable is hardcoded to `localhost:5432` instead of referencing the Railway Postgres service.

**Current logs show:**
```
Error: connect ECONNREFUSED ::1:5432
Error: connect ECONNREFUSED 127.0.0.1:5432
```

### Solution

1. **Open Railway Dashboard:**
   - Go to https://railway.app/
   - Open your project: **Noor**
   - Click on the **Noor** service (backend)

2. **Fix DATABASE_URL Variable:**
   - Go to **Variables** tab
   - Find `DATABASE_URL` variable
   - Click the **trash icon** to delete it
   - Click **"+ New Variable"**
   - In the dropdown, select **"Shared Variable"**
   - Select `DATABASE_URL` from the **Postgres** service
   - This creates: `${{Postgres.DATABASE_URL}}`
   - Railway will auto-redeploy (takes ~2 minutes)

3. **Verify Fix:**
   ```bash
   # Wait 2-3 minutes for redeployment, then test:
   curl https://noor-production-9ac5.up.railway.app/api/health
   ```

   **Expected response:**
   ```json
   {
     "status": "healthy",
     "checks": {
       "database": true,
       "ai": true
     },
     "timestamp": "2026-01-26T...",
     "version": "1.0.0",
     "mode": "production"
   }
   ```

---

## ✅ Current Railway Configuration

| Item | Value |
|------|-------|
| **Domain** | noor-production-9ac5.up.railway.app |
| **Region** | us-east4-eqdc4a |
| **GitHub Repo** | byteworthy/Noor |
| **Branch** | production |
| **Services** | Noor (backend) + Postgres (database) |

### Environment Variables Status

| Variable | Status |
|----------|--------|
| `ANTHROPIC_API_KEY` | ✅ Set |
| `DATA_RETENTION_DRY_RUN` | ✅ Set |
| `DATABASE_URL` | ⚠️ **NEEDS FIX** (reference Postgres service) |
| `ENCRYPTION_KEY` | ✅ Set |
| `NODE_ENV` | ✅ Set |
| `STRIPE_SECRET_KEY` | ✅ Set |
| `STRIPE_WEBHOOK_SECRET` | ✅ Set |
| `VALIDATION_MODE` | ✅ Set |
| `SESSION_SECRET` | ⚠️ **Check if set** |

---

## 🧪 Testing After Fix

### 1. Health Check
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
```

Should return `"database": true` and `"ai": true`.

### 2. Test Session Creation
```bash
curl -X POST https://noor-production-9ac5.up.railway.app/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"userId":"test-user-123"}'
```

Should return a session token.

### 3. Test from Mobile App
1. Ensure `client/.env` has:
   ```
   EXPO_PUBLIC_DOMAIN=noor-production-9ac5.up.railway.app
   ```
2. Run: `npx expo start`
3. Open app on device via Expo Go
4. Try to start a reflection journey
5. Should connect to Railway backend

---

## 📋 Post-Fix Checklist

- [ ] DATABASE_URL references `${{Postgres.DATABASE_URL}}`
- [ ] Railway redeployment completed
- [ ] Health check returns `"database": true`
- [ ] `client/.env` updated with Railway domain
- [ ] Mobile app can connect to backend
- [ ] Session creation works
- [ ] Thought analysis works (full E2E test)

---

## 🔍 Monitoring

**Railway Logs:**
- Go to **Noor service → Deployments → Latest → Logs**
- Should see: `Server listening on port 5000` or similar
- Should NOT see: `ECONNREFUSED` errors

**Database Connection Pool:**
- Logs should show: `[DB] Connection pool initialized`
- On shutdown: `[DB] Connection pool closed successfully`

---

## 🚀 After DATABASE_URL Fix

Your backend will be **100% production-ready** with:
- ✅ Railway deployment live
- ✅ Database connected
- ✅ Health checks passing
- ✅ Rate limiting active
- ✅ Connection pooling configured
- ✅ 79 tests passing

The only remaining work is:
1. **IAP Configuration** (Apple/Google - 2-3 days)
2. **Store Assets** (screenshots, descriptions - 1 day)

---

## ⚠️ If Fix Doesn't Work

1. **Check Railway Postgres Service:**
   - Ensure Postgres service is running (green status)
   - Verify it's in the same project as Noor service

2. **Verify Variable Reference Format:**
   - Must be: `${{Postgres.DATABASE_URL}}`
   - NOT: hardcoded connection string
   - NOT: `${Postgres.DATABASE_URL}` (wrong syntax)

3. **Check Logs for Connection String:**
   - Deployment logs should show connection attempt to Railway internal URL
   - Should look like: `postgres://...@postgres.railway.internal:5432/...`

4. **Force Redeploy:**
   - If Railway doesn't auto-redeploy after variable change
   - Go to **Deployments → Latest → Three dots → Redeploy**

---

**Next Step:** Fix DATABASE_URL variable now, then test the health endpoint.
