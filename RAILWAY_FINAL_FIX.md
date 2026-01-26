# Railway Database Setup - Final Solution

## ⚠️ Why Previous Fix Didn't Work

Moving `drizzle-kit` to dependencies broke:
- ❌ **CI builds** - PostgreSQL native bindings require pg dev libraries
- ❌ **EAS mobile builds** - Expo doesn't need server database tools

## ✅ Solution: Use Railway Build Configuration

Railway needs to install devDependencies during build. Here are two approaches:

---

## Option 1: Configure Railway to Install DevDependencies (Recommended)

### In Railway Dashboard:

1. **Noor service → Settings**
2. Find **"Build Command"** section
3. Change from:
   ```
   npm install && npm run server:build
   ```
   To:
   ```
   npm ci --include=dev && npm run server:build
   ```
4. **Pre Deploy Command** section:
   ```
   npm run db:push
   ```
5. Save both

**What this does:**
- `npm ci --include=dev` installs devDependencies during build
- `drizzle-kit` becomes available for pre-deploy migration
- Production runtime doesn't include devDependencies (stays lean)

---

## Option 2: Manual SQL Table Creation (Fastest - 2 minutes)

If Railway build config doesn't work, create tables manually:

### In Railway Dashboard:

1. **Postgres service → Data tab**
2. Click **"Query"** button
3. Copy-paste this SQL:

```sql
-- Create all required tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'free',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  thought TEXT NOT NULL,
  distortions JSONB NOT NULL,
  reframe TEXT NOT NULL,
  intention TEXT NOT NULL,
  practice TEXT NOT NULL,
  key_assumption TEXT,
  detected_state TEXT,
  anchor TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
```

4. Click **"Execute"** or **"Run"**
5. Verify 4 tables + 4 indexes created

**Advantages:**
- ✅ Works immediately (no redeploy needed)
- ✅ No build configuration changes
- ✅ Bypasses drizzle-kit entirely

**Disadvantage:**
- ⚠️ Future schema changes require manual SQL updates

---

## ✅ After Either Option

### Verify Health Check:
```
https://noor-production-9ac5.up.railway.app/api/health
```

**Should return:**
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "ai": true
  }
}
```

### Verify Tables:
**Postgres service → Data tab**
- Should see: `users`, `user_sessions`, `sessions`, `processed_stripe_events`

---

## 🔧 Troubleshooting

### Build still fails with "drizzle-kit not found"
**Solution:** Use Option 2 (manual SQL) - it's faster and more reliable

### Health check shows "database": false after manual SQL
**Check:**
- All 4 tables created? (Postgres → Data → Tables)
- DATABASE_URL = `${{Postgres.DATABASE_URL}}`? (Noor → Variables)
- Railway logs show connection errors? (Noor → Logs)

### EAS build still failing
**Reason:** May need to pull latest code:
```bash
git pull origin main
```
Then retry EAS build. The revert should fix it.

---

## 📊 Why This Approach Works

| Approach | CI/EAS Builds | Railway Migrations | Complexity |
|----------|---------------|-------------------|------------|
| drizzle-kit in dependencies | ❌ Breaks | ✅ Works | High |
| drizzle-kit in devDependencies + Railway build config | ✅ Works | ✅ Works | Medium |
| Manual SQL + drizzle-kit in devDependencies | ✅ Works | ✅ Works | Low |

---

## 🎯 Recommended Action

**Use Option 2 (Manual SQL)** because:
- ✅ Works immediately
- ✅ No build config changes
- ✅ Fixes CI/EAS builds
- ✅ No Railway redeploy needed
- ✅ You can always add automated migrations later

Once tables exist, your backend is **100% operational**.

---

## ✅ After Database Setup Complete

### Test Mobile App:
```bash
git pull origin main  # Get the drizzle-kit revert
npx expo start        # Test with Railway backend
```

### Verify End-to-End:
1. Start reflection journey
2. Analyze thought → Calls Railway backend
3. Generate reframe
4. Complete session → Saves to Railway Postgres

---

**Next Step:** Choose Option 1 or 2 above and execute it in Railway dashboard.

**Recommendation:** Use Option 2 (manual SQL) - it's the fastest path to a working system.
