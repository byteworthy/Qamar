# Railway Setup Instructions - FINAL STEPS

## ✅ Issue Diagnosed & Fixed

**Root Cause:** `drizzle-kit` was in `devDependencies`, so it wasn't available during Railway's production deployment.

**Fix Applied:** Moved `drizzle-kit` to regular `dependencies` and pushed to GitHub.

---

## 🚀 Steps for Claude Code Web (or you manually)

### Step 1: Redeploy from GitHub

**In Railway Dashboard:**
1. Go to **Noor service** (backend)
2. Click **Deployments** tab
3. Click **"Deploy"** button (top right)
4. Or just wait - Railway auto-deploys when GitHub updates

**This will:**
- Pull latest code (with drizzle-kit in dependencies)
- Install drizzle-kit in production build
- Make migration command work

---

### Step 2: Configure Pre-Deploy Command

**In Railway Dashboard:**
1. **Noor service** → **Settings** tab
2. Scroll to **"Deploy"** section
3. Find **"Pre Deploy Command"** field
4. Enter:
   ```
   npm run db:push
   ```
5. Click **Save** or the checkmark

**What this does:**
- Runs `drizzle-kit push` BEFORE starting the server
- Creates tables: `users`, `user_sessions`, `sessions`, `processed_stripe_events`
- Applies indexes for performance

---

### Step 3: Trigger Deployment

**Option A: Wait for auto-deploy (recommended)**
- Railway detects GitHub push
- Automatically redeploys (~2 minutes)

**Option B: Manual redeploy**
1. **Deployments** tab
2. Click latest deployment
3. Three dots menu → **"Redeploy"**

---

### Step 4: Watch Deployment Logs

**In Railway:**
1. **Deployments** tab → Latest deployment
2. Click **"View Logs"**

**Success logs look like:**
```
✓ Installing dependencies...
✓ drizzle-kit@0.31.4 installed
✓ Running pre-deploy command: npm run db:push
[Drizzle] Applying migrations...
[Drizzle] CREATE TABLE "users"
[Drizzle] CREATE TABLE "user_sessions"
[Drizzle] CREATE TABLE "sessions"
[Drizzle] CREATE TABLE "processed_stripe_events"
[Drizzle] Migrations complete ✓
✓ Starting server...
Server listening on port 5000
```

**Failure logs might show:**
- `drizzle-kit: command not found` → Pre-deploy ran too early, try redeploying
- `Cannot connect to database` → DATABASE_URL issue (should be fixed already)
- `Permission denied` → Postgres issue (rare)

---

### Step 5: Verify Health Check

**Open in browser:**
```
https://noor-production-9ac5.up.railway.app/api/health
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

**If `"database": false`:**
- Check Railway logs for migration errors
- Try manual table creation (see RAILWAY_TROUBLESHOOTING.md)

---

### Step 6: Verify Tables Created

**In Railway:**
1. Click **Postgres** service
2. Click **Data** tab
3. Should see 4 tables:
   - `users`
   - `user_sessions`
   - `sessions`
   - `processed_stripe_events`

---

## ✅ After Success

### Test Mobile App:

1. **Verify client/.env has:**
   ```
   EXPO_PUBLIC_DOMAIN=noor-production-9ac5.up.railway.app
   ```

2. **Start Expo:**
   ```bash
   npx expo start
   ```

3. **Test on device:**
   - Open Expo Go app
   - Scan QR code
   - Start reflection journey
   - Enter thought → Analyze
   - Should connect to Railway and save session

4. **Verify in Railway Postgres:**
   - **Postgres → Data → sessions table**
   - Should see your test sessions

---

## 🎯 Success Checklist

- [ ] Code pushed to GitHub (✓ Done)
- [ ] Railway auto-deployed latest code
- [ ] Pre-deploy command set to `npm run db:push`
- [ ] Deployment succeeded (check logs)
- [ ] Health check returns `"database": true`
- [ ] 4 tables exist in Postgres
- [ ] Mobile app connects successfully
- [ ] Test session saved to database

---

## ❌ If It Still Fails

### Fallback: Manual Table Creation

If pre-deploy command still fails, create tables manually:

1. **Postgres service → Data → Query**
2. Copy-paste SQL from `RAILWAY_TROUBLESHOOTING.md`
3. Click **Execute**
4. Verify 4 tables created

This bypasses the migration system but gets you operational immediately.

---

## 📊 What's Changed

| File | Change |
|------|--------|
| `package.json` | Moved `drizzle-kit` from `devDependencies` to `dependencies` |
| Railway Pre-Deploy | Will run `npm run db:push` before server starts |
| Result | Migration command now has access to `drizzle-kit` |

---

## 🎉 Once Complete

Your backend will be **100% operational**:
- ✅ Deployed to Railway
- ✅ Database connected
- ✅ Schema initialized
- ✅ Health check passing
- ✅ Ready for mobile app testing

**Only IAP and store assets remain** for public launch.

---

**Tell Claude Code Web:** "Redeploy from latest GitHub commit and set pre-deploy command to `npm run db:push`"
