/**
 * Schema Verification Script
 *
 * Verifies that all required tables, columns, indexes, and foreign keys exist
 * Run with: tsx scripts/verify-schema.ts
 */

import { db } from '../server/db';
import { sql } from 'drizzle-orm';
import { defaultLogger } from '../server/utils/logger';

interface TableInfo {
  table_name: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
}

interface IndexInfo {
  indexname: string;
  tablename: string;
}

interface ForeignKeyInfo {
  constraint_name: string;
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

/**
 * Expected tables for Islamic features
 */
const expectedTables = [
  'users',
  'sessions',
  'user_sessions',
  'processed_stripe_events',
  'insight_summaries',
  'assumption_library',
  'quran_metadata',
  'quran_bookmarks',
  'prayer_preferences',
  'arabic_flashcards',
  'user_progress',
];

/**
 * Expected indexes
 */
const expectedIndexes = [
  'quran_metadata_surah_number_idx',
  'quran_bookmarks_user_id_idx',
  'quran_bookmarks_surah_verse_idx',
  'arabic_flashcards_user_word_idx',
  'arabic_flashcards_next_review_idx',
  'user_progress_last_active_date_idx',
];

/**
 * Expected foreign keys
 */
const expectedForeignKeys = [
  { table: 'quran_bookmarks', column: 'user_id', references: 'users' },
  { table: 'prayer_preferences', column: 'user_id', references: 'users' },
  { table: 'arabic_flashcards', column: 'user_id', references: 'users' },
  { table: 'user_progress', column: 'user_id', references: 'users' },
];

async function verifySchema() {
  try {
    defaultLogger.info('[VERIFY] Starting schema verification...');
    let errors = 0;

    // 1. Check tables exist
    defaultLogger.info('\n[VERIFY] Checking tables...');
    const tablesResult = await db.execute<TableInfo>(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    const existingTables = tablesResult.rows.map(r => r.table_name);

    for (const table of expectedTables) {
      if (existingTables.includes(table)) {
        defaultLogger.info(`  ✅ Table "${table}" exists`);
      } else {
        defaultLogger.error(`  ❌ Table "${table}" missing`);
        errors++;
      }
    }

    // 2. Check specific columns for new tables
    defaultLogger.info('\n[VERIFY] Checking critical columns...');

    const criticalColumns = [
      { table: 'quran_metadata', column: 'surah_number', type: 'integer' },
      { table: 'quran_metadata', column: 'name_arabic', type: 'text' },
      { table: 'quran_bookmarks', column: 'user_id', type: 'text' },
      { table: 'quran_bookmarks', column: 'note', type: 'text' },
      { table: 'prayer_preferences', column: 'calculation_method', type: 'text' },
      { table: 'prayer_preferences', column: 'latitude', type: 'real' },
      { table: 'arabic_flashcards', column: 'difficulty', type: 'real' },
      { table: 'arabic_flashcards', column: 'next_review', type: 'timestamp without time zone' },
      { table: 'user_progress', column: 'streak_days', type: 'integer' },
    ];

    for (const { table, column, type } of criticalColumns) {
      const columnResult = await db.execute<ColumnInfo>(sql`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = ${table}
          AND column_name = ${column};
      `);

      if (columnResult.rows.length > 0) {
        const col = columnResult.rows[0];
        if (col.data_type.includes(type.split(' ')[0])) {
          defaultLogger.info(`  ✅ Column "${table}.${column}" (${col.data_type})`);
        } else {
          defaultLogger.warn(`  ⚠️  Column "${table}.${column}" has type ${col.data_type}, expected ${type}`);
        }
      } else {
        defaultLogger.error(`  ❌ Column "${table}.${column}" missing`);
        errors++;
      }
    }

    // 3. Check indexes
    defaultLogger.info('\n[VERIFY] Checking indexes...');
    const indexesResult = await db.execute<IndexInfo>(sql`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey';
    `);

    const existingIndexes = indexesResult.rows.map(r => r.indexname);

    for (const indexName of expectedIndexes) {
      if (existingIndexes.includes(indexName)) {
        defaultLogger.info(`  ✅ Index "${indexName}" exists`);
      } else {
        defaultLogger.error(`  ❌ Index "${indexName}" missing`);
        errors++;
      }
    }

    // 4. Check foreign keys
    defaultLogger.info('\n[VERIFY] Checking foreign key constraints...');
    const fkResult = await db.execute<ForeignKeyInfo>(sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public';
    `);

    for (const { table, column, references } of expectedForeignKeys) {
      const fk = fkResult.rows.find(
        r => r.table_name === table &&
             r.column_name === column &&
             r.foreign_table_name === references
      );

      if (fk) {
        defaultLogger.info(`  ✅ Foreign key "${table}.${column}" → "${references}"`);
      } else {
        defaultLogger.error(`  ❌ Foreign key "${table}.${column}" → "${references}" missing`);
        errors++;
      }
    }

    // 5. Summary
    defaultLogger.info('\n' + '='.repeat(60));
    if (errors === 0) {
      defaultLogger.info('✅ SCHEMA VERIFICATION PASSED');
      defaultLogger.info('All tables, columns, indexes, and foreign keys are present.');
    } else {
      defaultLogger.error(`❌ SCHEMA VERIFICATION FAILED`);
      defaultLogger.error(`Found ${errors} error(s). Please run migrations.`);
      process.exit(1);
    }
    defaultLogger.info('='.repeat(60));

  } catch (error) {
    defaultLogger.error(
      '[VERIFY] ❌ Verification failed',
      error instanceof Error ? error : new Error(String(error))
    );
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run verification
verifySchema();
