/**
 * Storage Key Migration
 *
 * Migrates legacy @noor_* AsyncStorage keys to @qamar_* keys.
 * Runs once on first load — reads old keys, writes to new keys, deletes old keys.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const MIGRATION_DONE_KEY = "@qamar_storage_migrated";

const KEY_MIGRATIONS: [string, string][] = [
  ["@noor_user_name", "@qamar_user_name"],
  ["@noor_user_email", "@qamar_user_email"],
  ["@noor_journey_stats", "@qamar_journey_stats"],
  ["@noor_reflections", "@qamar_reflections"],
];

let _migrationPromise: Promise<void> | null = null;

/**
 * Run one-time migration of legacy storage keys.
 * Safe to call multiple times — only runs once.
 */
export function migrateStorageKeys(): Promise<void> {
  if (!_migrationPromise) {
    _migrationPromise = runMigration();
  }
  return _migrationPromise;
}

async function runMigration(): Promise<void> {
  try {
    const alreadyMigrated = await AsyncStorage.getItem(MIGRATION_DONE_KEY);
    if (alreadyMigrated === "true") return;

    for (const [oldKey, newKey] of KEY_MIGRATIONS) {
      const oldValue = await AsyncStorage.getItem(oldKey);
      if (oldValue !== null) {
        // Only write to new key if it doesn't already have a value
        const existingNew = await AsyncStorage.getItem(newKey);
        if (existingNew === null) {
          await AsyncStorage.setItem(newKey, oldValue);
        }
        await AsyncStorage.removeItem(oldKey);
      }
    }

    await AsyncStorage.setItem(MIGRATION_DONE_KEY, "true");
  } catch {
    // Migration failure is non-fatal — old keys still work as fallback
  }
}
