# Manual Database Migration - Step by Step

**For when Railway CLI can't be used (e.g., from Claude Code Web)**

---

## 🎯 Goal
Create database tables in your Railway Postgres so the backend can store sessions.

---

## ✅ Option 1: Railway Web UI (Easiest - No CLI needed)

### Step 1: Open Railway Dashboard
1. Go to https://railway.app/
2. Open your **Noor** project
3. Click on the **Noor service** (backend)

### Step 2: Add Migration Command to Startup
1. Click **Settings** tab
2. Find **"Deploy"** section
3. Look for **"Start Command"** (might be empty or show `node server_dist/index.js`)
4. Change it to:
   ```
   npm run db:push && node server_dist/index.js
   ```
5. Click **Save**
6. Railway will automatically redeploy

**What this does:**
- Runs `db:push` (creates tables) BEFORE starting the server
- Tables get created on every deployment
- Idempotent - safe to run multiple times

### Step 3: Wait for Deployment (~2 minutes)
1. Go to **Deployments** tab
2. Watch the latest deployment
3. Check logs for:
   ```
   ✓ Applying migrations...
   ✓ Created table "users"
   ✓ Created table "user_sessions"
   ✓ Created table "sessions"
   ✓ Created table "processed_stripe_events"
   ```

### Step 4: Verify
Open this URL in your browser:
```
https://noor-production-9ac5.up.railway.app/api/health
```

Should show:
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

## ✅ Option 2: Copy DATABASE_URL and Run Locally

If you can run commands on your local machine (not in Claude Code Web):

### Step 1: Get DATABASE_URL from Railway

1. Go to Railway dashboard: https://railway.app/
2. Open **Noor** project
3. Click on **Postgres** service (not Noor)
4. Click **Variables** tab
5. Find `DATABASE_URL` variable
6. Click the **eye icon** to reveal it
7. Click **Copy** button

It will look like:
```
postgresql://postgres:LONG_PASSWORD@REGION.railway.app:PORT/railway
```

### Step 2: Run Migration Locally

**Windows PowerShell:**
```powershell
cd C:\Dev\Noor-CBT
$env:DATABASE_URL="paste-the-url-you-copied-here"
npm run db:push
```

**macOS/Linux Terminal:**
```bash
cd ~/Dev/Noor-CBT  # or wherever your project is
DATABASE_URL="paste-the-url-you-copied-here" npm run db:push
```

### Step 3: Verify
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
```

Should show `"database": true`.

---

## ✅ Option 3: Railway CLI from Your Local Terminal

If Railway CLI doesn't work from Claude Code Web, open your own terminal:

### Step 1: Open Terminal/PowerShell
- **Windows:** Press `Win + X`, select "Windows PowerShell"
- **macOS:** Press `Cmd + Space`, type "Terminal"
- **Linux:** Press `Ctrl + Alt + T`

### Step 2: Navigate to Project
```bash
cd C:\Dev\Noor-CBT  # Windows
# or
cd ~/Dev/Noor-CBT   # macOS/Linux
```

### Step 3: Run Migration
```bash
railway login          # Opens browser
railway link           # Select "Noor"
railway run npm run db:push
```

### Step 4: Verify
```bash
curl https://noor-production-9ac5.up.railway.app/api/health
```

---

## 🔍 How to Know It Worked

### ✅ Success Indicators:

1. **Railway Logs show:**
   ```
   [Drizzle] Creating table "users"...
   [Drizzle] Creating table "user_sessions"...
   [Drizzle] Creating table "sessions"...
   [Drizzle] Migrations complete
   ```

2. **Health check returns:**
   ```json
   {"status":"healthy","checks":{"database":true,"ai":true}}
   ```

3. **No more "relation does not exist" errors in logs**

4. **Mobile app can:**
   - Start reflection journey
   - Save sessions
   - View history

---

## ❌ Troubleshooting

### Error: "Cannot connect to database"
- Double-check you copied the FULL DATABASE_URL (including port and password)
- Make sure Railway Postgres service is online (green status in dashboard)

### Error: "relation still does not exist"
- Check Railway deployment logs - did migration actually run?
- Try Option 1 (add to start command) which is most reliable

### Error: "Permission denied"
- Railway Postgres user should have full permissions by default
- Check if you're connected to the right database

### Migration runs but tables not created
- Check Drizzle logs for specific error messages
- Verify `shared/schema.ts` has no syntax errors: `npm run check:types`

---

## 🎯 Recommended Approach

**Best option:** Use **Option 1** (Railway Web UI - Start Command)

**Why:**
- No CLI required
- Works from any environment
- Runs migrations automatically on every deploy
- Most reliable for CI/CD

**Pros:**
- ✅ No local setup needed
- ✅ Works from Claude Code Web
- ✅ Automatic on future deployments

**Cons:**
- ⏱️ Requires redeployment (~2 minutes)

---

## 📱 After Migration Complete

### Test Your Mobile App:

1. **Ensure client/.env has:**
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
   - Enter thought → should analyze successfully
   - Complete full session → should save to database

---

## ✅ Success Checklist

- [ ] Migration method selected (1, 2, or 3)
- [ ] Migration executed
- [ ] Railway redeployed (if using Option 1)
- [ ] Health check returns `"database": true`
- [ ] Railway logs show no "relation does not exist" errors
- [ ] Mobile app tested end-to-end
- [ ] Session data appears in reflection history

---

**Next Step:** Choose Option 1, 2, or 3 above and execute it now.
