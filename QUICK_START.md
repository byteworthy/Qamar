# Noor CBT - Quick Start Guide

## Current Status

✅ **Backend Deployed:** noor-production-9ac5.up.railway.app
✅ **Database Connected:** Railway Postgres linked
⚠️ **Schema Not Initialized:** Tables need to be created

---

## 🚀 Initialize Database (5 minutes)

### Option 1: Automated Script (Recommended)

**Windows PowerShell:**
```powershell
.\scripts\migrate-railway.ps1
```

**macOS/Linux:**
```bash
bash scripts/migrate-railway.sh
```

This script will:
1. Login to Railway (opens browser)
2. Link to your Noor project
3. Run database migrations
4. Verify health check

### Option 2: Manual Commands

```bash
# 1. Login to Railway (opens browser)
railway login

# 2. Link to Noor project (select from list)
railway link

# 3. Run migrations
railway run npm run db:push

# 4. Verify
curl https://noor-production-9ac5.up.railway.app/api/health
```

---

## ✅ After Database is Initialized

### Test Your Mobile App

1. **Ensure client/.env has Railway domain:**
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
   - Start a reflection journey
   - Should connect to Railway backend

---

## 🎯 Launch Checklist

- [x] Backend code production-ready
- [x] Backend deployed to Railway
- [x] Database connected
- [ ] **Database schema initialized** ← RUN SCRIPT ABOVE
- [ ] Mobile app tested end-to-end
- [ ] IAP configured (Apple/Google - 2-3 days)
- [ ] Store screenshots created (1 day)
- [ ] App Store & Play Store submission

---

## 📊 What's Deployed

| Component | Status | Notes |
|-----------|--------|-------|
| Backend API | ✅ Online | noor-production-9ac5.up.railway.app |
| Postgres DB | ✅ Online | Railway managed, 8GB storage |
| Connection Pooling | ✅ Active | Max 20 connections |
| Health Checks | ⚠️ Failing | Waiting for schema initialization |
| Rate Limiting | ✅ Active | 10 req/min per IP on AI endpoints |
| Error Boundaries | ✅ Active | Screen-level isolation |
| Tests | ✅ Passing | 79 backend tests |

---

## 🆘 Need Help?

**Health check failing after migration?**
- Check logs: `railway logs`
- Verify DATABASE_URL: `railway variables`
- Re-run migrations: `railway run npm run db:push`

**Mobile app can't connect?**
- Check `client/.env` has Railway domain
- Verify health check passes
- Check Railway service is online

**Still stuck?**
- See `RAILWAY_DATABASE_MIGRATION.md` for detailed troubleshooting
- See `FIXES_COMPLETED.md` for full deployment guide
- Check Railway logs for specific error messages

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ Health check returns `"database": true`
2. ✅ Mobile app loads home screen
3. ✅ Can start reflection journey
4. ✅ Thought analysis works (gets distortions from Claude API)
5. ✅ Reframe generation works
6. ✅ Session saves to database
7. ✅ Can view reflection history

---

**Next Step:** Run the migration script above to initialize your database!
