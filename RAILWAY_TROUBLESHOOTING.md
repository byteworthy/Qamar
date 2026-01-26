# Railway Migration Troubleshooting

**Issue:** Migration failing in Railway dashboard

---

## 🔍 Check Railway Deployment Logs

### Step 1: View Current Logs
1. Go to https://railway.app/
2. Open **Noor** project
3. Click **Noor service** (backend)
4. Click **Deployments** tab
5. Click on the **latest deployment**
6. Click **View Logs** or **Logs** tab

### Step 2: Look for Error Messages

**Common errors and solutions:**

---

## ❌ Error: "npm run db:push: command not found"

**Means:** The start command is wrong or npm scripts not available during build

**Solution:** Don't use start command approach. Use Option 2 below instead.

---

## ❌ Error: "Cannot connect to DATABASE_URL"

**Check:**
1. Go to **Noor service → Variables**
2. Verify `DATABASE_URL` shows: `${{Postgres.DATABASE_URL}}`
3. NOT a hardcoded string
4. NOT `localhost`

**Fix:**
1. Delete `DATABASE_URL` variable
2. Add new variable → Select "Shared Variable"
3. Choose `DATABASE_URL` from **Postgres** service dropdown

---

## ❌ Error: "drizzle-kit not found" or "Cannot find module 'drizzle-kit'"

**Means:** Dependencies not installed properly

**Fix:**
1. Go to **Noor service → Settings**
2. Find **Build Command**
3. Ensure it's: `npm install && npm run server:build`
4. Or: `npm ci && npm run server:build`

---

## ❌ Error: "syntax error near 'IF'"

**Means:** SQL syntax issue in migration

**Fix:**
1. Check `shared/schema.ts` for syntax errors
2. Run locally: `npm run check:types`
3. If errors, fix them and redeploy

---

## ✅ ALTERNATIVE: Create Tables Manually in Railway

If automated migration keeps failing, create tables manually:

### Step 1: Open Railway Postgres Query Editor

1. Go to Railway dashboard
2. Click **Postgres** service
3. Click **Data** tab
4. Click **Query** or **SQL Editor**

### Step 2: Run These SQL Commands

Copy and paste this entire block:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'free',
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Create sessions table
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

-- Create processed_stripe_events table
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

### Step 3: Execute
1. Click **Run** or **Execute**
2. Should see: `CREATE TABLE` × 4, `CREATE INDEX` × 4
3. Check **Tables** tab - should see 4 tables

### Step 4: Verify
Open in browser:
```
https://noor-production-9ac5.up.railway.app/api/health
```

Should return:
```json
{"status":"healthy","checks":{"database":true,"ai":true}}
```

---

## 🔍 Verify Tables Exist

### Check in Railway UI:
1. **Postgres service → Data tab**
2. Should see 4 tables:
   - `users`
   - `user_sessions`
   - `sessions`
   - `processed_stripe_events`

### Check via Query:
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

Should list all 4 tables.

---

## ⚠️ If Manual SQL Creation Also Fails

### Error: "permission denied"
**Check:**
1. **Postgres service → Settings**
2. Verify service is online (green status)
3. Check if read-only mode is enabled (shouldn't be)

### Error: "database does not exist"
**Rare but possible:**
1. **Postgres service** might need to be re-created
2. Delete Postgres service
3. Create new Postgres service
4. Update Noor service to reference new Postgres DATABASE_URL

---

## 📋 Diagnostic Checklist

Before trying alternatives:

- [ ] Railway Postgres service is online (green)
- [ ] Noor service is online (green)
- [ ] `DATABASE_URL` in Noor service = `${{Postgres.DATABASE_URL}}`
- [ ] Latest deployment succeeded
- [ ] Logs don't show "ECONNREFUSED"
- [ ] Can access Railway Postgres Data tab

If all checked, try **manual SQL table creation** above.

---

## 🎯 What Error Are You Seeing?

**Tell Claude Code Web:**

1. **Exact error message from Railway logs** (copy-paste)
2. **Which step is failing:**
   - Build phase?
   - Migration command?
   - Server start?
3. **DATABASE_URL value** (Noor service → Variables)
   - Should be: `${{Postgres.DATABASE_URL}}`
   - NOT: hardcoded connection string

With this info, I can provide a specific fix.

---

## ✅ Expected Success Output

**Railway logs should show:**
```
[Drizzle] Applying migrations...
[Drizzle] CREATE TABLE users...
[Drizzle] CREATE TABLE user_sessions...
[Drizzle] CREATE TABLE sessions...
[Drizzle] CREATE TABLE processed_stripe_events...
[Drizzle] Migrations complete ✓
Server listening on port 5000
```

**Health check should return:**
```json
{
  "status": "healthy",
  "checks": {
    "database": true,
    "ai": true
  }
}
```

---

**Next:** Try the manual SQL table creation above (copy-paste into Railway Postgres Query Editor).
