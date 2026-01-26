# Railway Database Migration Guide

**Status:** ✅ DATABASE_URL fixed, ⚠️ Schema not initialized
**Error:** `relation "user_sessions" does not exist` and `relation "sessions" does not exist`

---

## ✅ What's Working
- Backend deployed to Railway
- Database connection working (`${{Postgres.DATABASE_URL}}`)
- All environment variables configured

## ⚠️ What Needs to Be Done
Initialize database schema (create tables) using Drizzle ORM migrations.

---

## 🔧 Option 1: Run Migrations via Railway CLI (Recommended)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login and Link Project
```bash
# Login to Railway
railway login

# Link to your Noor project (select from list)
railway link
```

### Step 3: Run Migrations
```bash
# This runs drizzle-kit push against your Railway Postgres
railway run npm run db:push
```

**Expected output:**
```
✔ Applying migrations...
✔ Created table "users"
✔ Created table "user_sessions"
✔ Created table "sessions"
✔ Created table "processed_stripe_events"
✔ Migrations complete!
```

### Step 4: Verify
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
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

---

## 🔧 Option 2: Run Migrations Locally (Alternative)

If Railway CLI isn't working, you can run migrations from your local machine.

### Step 1: Get Railway DATABASE_URL

1. Go to Railway dashboard → **Postgres service**
2. Click **Variables** tab
3. Copy the `DATABASE_URL` value (starts with `postgresql://...`)

### Step 2: Run Migrations Locally

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://postgres:PASSWORD@REGION.railway.app:PORT/railway"
npm run db:push
```

**macOS/Linux (Bash):**
```bash
DATABASE_URL="postgresql://postgres:PASSWORD@REGION.railway.app:PORT/railway" npm run db:push
```

**What this does:**
- Connects to your Railway Postgres database
- Reads `shared/schema.ts` to see what tables are defined
- Creates the missing tables in Railway Postgres
- Applies indexes and foreign keys

---

## 📋 Database Schema Overview

Your schema (`shared/schema.ts`) defines these tables:

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `users` | User accounts and subscriptions | id, email, stripeCustomerId, subscriptionStatus |
| `user_sessions` | Session tokens for authentication | token, userId, email, expiresAt |
| `sessions` | Reflection session data | id, userId, thought, distortions, reframe, intention |
| `processed_stripe_events` | Webhook idempotency tracking | eventId, eventType, processedAt |

---

## ✅ After Migrations Complete

### 1. Verify Health Check
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
```

Should return `"database": true`.

### 2. Test Session Creation
```bash
curl -X POST https://noor-production-9ac5.up.railway.app/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Should return a session token (no more "relation does not exist" errors).

### 3. Test from Mobile App
```bash
# Make sure client/.env has Railway domain
npx expo start
```

Open app and try:
1. Start reflection journey
2. Enter a thought
3. Analyze distortions
4. Should all work end-to-end

---

## 🔍 Troubleshooting

### Error: "Cannot connect to database"
- Make sure you copied the full DATABASE_URL including port and password
- Check Railway Postgres service is running (green status)

### Error: "Permission denied"
- Railway user should have full permissions by default
- Check if Postgres service is healthy in Railway dashboard

### Error: "Schema validation failed"
- Run `npm run check:types` to ensure schema TypeScript is valid
- Check `shared/schema.ts` for syntax errors

### Migrations don't apply
- Delete `migrations/` folder locally and try again
- Drizzle Kit might have cached old migration state

---

## 📊 Current Status Checklist

- [x] Backend deployed to Railway
- [x] DATABASE_URL references Postgres service
- [x] Environment variables configured
- [ ] **Database schema initialized** ← YOU ARE HERE
- [ ] Health check passing
- [ ] Mobile app tested end-to-end
- [ ] IAP configured
- [ ] Store assets created

---

## 🚀 Next Steps After Migrations

Once migrations complete and health check passes:

1. **Test Mobile App:**
   - Update `client/.env` with Railway domain (already done)
   - Run `npx expo start`
   - Test full reflection flow on device

2. **Internal Testing:**
   - Share Expo Go link with testers
   - Test all features (reflection, practice, insights)
   - Verify Railway backend handles load

3. **Prepare for Launch:**
   - Configure IAP (Apple/Google - 2-3 days)
   - Create store screenshots (1 day)
   - Submit to App Store & Play Store review

---

**Next Action:** Run `railway run npm run db:push` to create the database tables.
