# Database Migration Guide

## Overview

This guide covers the PostgreSQL schema extensions for Islamic features (Quran, Prayer Times, Arabic Learning) in the Noor CBT application.

## Schema Extensions Applied

### New Tables Added (5 total)

1. **`quran_metadata`** - Reference data for all 114 Surahs
   - Stores Surah names (Arabic/English), verse counts, revelation place
   - Indexed on `surah_number` for fast lookups

2. **`quran_bookmarks`** - User's Quran bookmarks
   - Links to `users.id` with cascade delete
   - Stores encrypted notes for privacy
   - Indexed on `userId` and `surahNumber/verseNumber`

3. **`prayer_preferences`** - Prayer calculation settings
   - One-to-one with users (unique `userId`)
   - Stores calculation method, madhab, location (encrypted)
   - Cascade delete when user is removed

4. **`arabic_flashcards`** - FSRS spaced repetition data
   - Implements FSRS algorithm parameters
   - Indexed on `userId`, `wordId`, and `nextReview` (for due card queries)
   - Cascade delete with users

5. **`user_progress`** - Unified progress tracking
   - Aggregated stats across all Islamic features
   - Streak tracking with `lastActiveDate` index
   - Cascade delete with users

## Migration Steps

### Prerequisites

- PostgreSQL database provisioned (Railway recommended)
- `DATABASE_URL` environment variable set
- Drizzle ORM installed (`drizzle-orm` + `drizzle-kit`)

### Step 1: Verify Schema File

The schema is already defined in `shared/schema.ts` (lines 110-238):

```bash
cat shared/schema.ts | grep -A 5 "ISLAMIC FEATURES"
```

### Step 2: Link Railway Project (Production)

```bash
# Authenticate with Railway
railway login

# Link to Noor project
railway link
# Select: byteworthy's Projects > Noor

# Verify connection
railway status
```

### Step 3: Run Drizzle Migration

```bash
# Push schema changes to database
npm run db:push
```

**Expected Output:**
```
No config path provided, using default 'drizzle.config.ts'
Reading config file 'drizzle.config.ts'
Pushing schema changes to database...
✓ Schema pushed successfully
```

### Step 4: Verify Schema

Run the verification script:

```bash
tsx scripts/verify-schema.ts
```

**Expected Output:**
```
[VERIFY] Starting schema verification...
[VERIFY] Checking tables...
  ✅ Table "quran_metadata" exists
  ✅ Table "quran_bookmarks" exists
  ✅ Table "prayer_preferences" exists
  ✅ Table "arabic_flashcards" exists
  ✅ Table "user_progress" exists
  ...
============================================================
✅ SCHEMA VERIFICATION PASSED
All tables, columns, indexes, and foreign keys are present.
============================================================
```

### Step 5: Seed Test Data

```bash
# Seed 5 surahs for testing
tsx scripts/seed-test-data.ts

# OR seed all 114 surahs
SEED_MODE=full tsx scripts/seed-test-data.ts
```

## Local Development Setup

### Option 1: Use Railway Database

```bash
# Create .env file
cp .env.example .env

# Get DATABASE_URL from Railway
railway run echo '$DATABASE_URL'

# Add to .env
DATABASE_URL=postgresql://postgres:...@containers-us-west-xyz.railway.app:1234/railway
```

### Option 2: Local PostgreSQL

```bash
# Install PostgreSQL locally
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql@15

# Create database
psql -U postgres
CREATE DATABASE noor_cbt;
\q

# Update .env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/noor_cbt

# Run migrations
npm run db:push
```

## Verification Checklist

- [ ] All 5 new tables created
- [ ] Foreign keys set up with cascade delete
- [ ] Indexes created on critical columns:
  - `quran_metadata.surah_number`
  - `quran_bookmarks.user_id`
  - `quran_bookmarks.surah_number, verse_number`
  - `arabic_flashcards.user_id, word_id`
  - `arabic_flashcards.next_review`
  - `user_progress.last_active_date`
- [ ] No duplicate columns or tables
- [ ] Seed data inserted successfully

## Troubleshooting

### Error: "DATABASE_URL, ensure the database is provisioned"

**Solution:**
1. Check if `.env` file exists: `ls -la | grep .env`
2. Verify `DATABASE_URL` is set: `cat .env | grep DATABASE_URL`
3. If using Railway, link project first: `railway link`

### Error: "Table already exists"

**Solution:**
The migrations are idempotent. Drizzle will detect existing tables and skip creation.

### Error: "Foreign key constraint failed"

**Solution:**
Ensure the `users` table exists before creating dependent tables. Run migrations in order.

### Seed script shows "already exists"

**Solution:**
This is expected behavior. To re-seed:

```bash
railway run psql -c "TRUNCATE TABLE quran_metadata CASCADE;"
tsx scripts/seed-test-data.ts
```

## Database Schema Diagram

```
┌─────────────────┐
│     users       │
│─────────────────│
│ id (PK)         │◄────┐
│ email           │     │
│ created_at      │     │
└─────────────────┘     │
                        │ CASCADE DELETE
                        │
    ┌───────────────────┼───────────────────┬──────────────────┐
    │                   │                   │                  │
    ▼                   ▼                   ▼                  ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│quran_bookmarks│ │prayer_prefs  │ │arabic_cards  │ │user_progress │
│──────────────│ │──────────────│ │──────────────│ │──────────────│
│user_id (FK)  │ │user_id (FK)  │ │user_id (FK)  │ │user_id (FK)  │
│surah_number  │ │method        │ │word_id       │ │verses_read   │
│verse_number  │ │madhab        │ │difficulty    │ │streak_days   │
│note (enc)    │ │lat/lng (enc) │ │next_review   │ │last_active   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────────┐
│ quran_metadata   │  (Reference data, no FK)
│──────────────────│
│ surah_number (U) │
│ name_arabic      │
│ name_english     │
│ verses_count     │
└──────────────────┘
```

## Next Steps

After successful migration:

1. **Backend Agent** will use these schemas to build API endpoints
2. **Frontend Agent** will create React Query hooks for data fetching
3. **Integration Agent** will set up offline sync between SQLite and PostgreSQL

## References

- Drizzle ORM Docs: https://orm.drizzle.team/docs/overview
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Railway Docs: https://docs.railway.app/
- FSRS Algorithm: https://github.com/open-spaced-repetition/fsrs-rs

## Migration Log

### 2024-02-11 - Initial Islamic Features Schema
- Added 5 new tables for Quran, Prayer, Arabic features
- Set up foreign keys with cascade delete
- Created indexes for query optimization
- Implemented encryption placeholders for sensitive data
- Status: ✅ Schema designed, pending Railway push
