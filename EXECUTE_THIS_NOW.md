# Railway Database Setup - FINAL STEP

## Execute This SQL in Railway Dashboard

1. **Go to**: https://railway.app/
2. **Navigate to**: Noor project → Postgres service → Data tab → Query
3. **Copy and paste this SQL**:

```sql
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

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
```

4. **Click Execute** (or press Ctrl+Enter)

## Verification

After executing, verify success:

1. **Check Tables**: Data tab should show 4 tables (users, user_sessions, sessions, processed_stripe_events)

2. **Test Health Check**: Open https://noor-production-9ac5.up.railway.app/api/health

   Expected response:
   ```json
   {
     "status": "healthy",
     "checks": {
       "database": true,
       "ai": true
     }
   }
   ```

3. **If health check fails**: Check Railway deployment logs for any errors

## Why Railway Dashboard?

The Railway CLI (`railway run`) executes commands **locally** with Railway environment variables, but database operations require running **inside** Railway's network where `postgres.railway.internal` DNS resolves. The dashboard Query interface runs queries directly on the Railway Postgres instance.

## Next Steps After Success

Once health check returns `"database": true`:

1. Test mobile app: `npx expo start`
2. Complete a full reflection flow from device
3. Verify sessions save to database (check Railway Data tab → sessions table)
4. Begin internal testing phase
