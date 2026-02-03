/**
 * Encryption utilities for HIPAA-compliant data protection
 * Uses AES-256-GCM for encryption with unique IVs per record
 */

import crypto from "crypto";
import { defaultLogger } from "./utils/logger";

const encryptionLogger = defaultLogger.child({ module: "Encryption" });

// =============================================================================
// PRODUCTION GUARD: Encryption key validation
// =============================================================================

const isProduction = process.env.NODE_ENV === "production";

// In production, ENCRYPTION_KEY is required - fail closed
if (isProduction && !process.env.ENCRYPTION_KEY) {
  encryptionLogger.error(
    "FATAL: ENCRYPTION_KEY not configured in production. Data encryption will fail. Server refusing to start.",
    undefined,
    {
      isProduction,
      action: "refusing_to_start",
    },
  );
  throw new Error(
    "ENCRYPTION_KEY environment variable is required in production.",
  );
}

// In development, allow random key fallback (data not persistent across restarts)
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");

if (!process.env.ENCRYPTION_KEY && !isProduction) {
  encryptionLogger.warn(
    "Using random encryption key. Data will not be decryptable after restart. Set ENCRYPTION_KEY for persistence.",
    {
      isProduction,
      action: "using_random_key",
    },
  );
}

const ALGORITHM = "aes-256-gcm";

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypt sensitive data
 */
export function encryptData(text: string): string {
  if (!text) return text;

  try {
    // Generate a unique IV for this encryption
    const iv = crypto.randomBytes(16);

    // Create cipher
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");

    // Get auth tag
    const tag = cipher.getAuthTag();

    // Return as combined string: iv:tag:encrypted
    return `enc:${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
  } catch (error) {
    encryptionLogger.error("Encryption failed", error, {
      operation: "encrypt",
      // Do not log plaintext data
    });
    throw new Error(
      `Encryption failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Decrypt encrypted data
 */
export function decryptData(encryptedText: string): string {
  if (!encryptedText) return encryptedText;

  // Check if encrypted
  if (!encryptedText.startsWith("enc:")) {
    return encryptedText;
  }

  try {
    // Parse encrypted string: enc:iv:tag:encrypted
    const parts = encryptedText.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted format");
    }

    const iv = Buffer.from(parts[1], "hex");
    const tag = Buffer.from(parts[2], "hex");
    const encrypted = parts[3];

    // Create decipher
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // Decrypt
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    encryptionLogger.error("Decryption failed", error, {
      operation: "decrypt",
      // Do not log encrypted or decrypted data
    });
    throw new Error(
      `Decryption failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Hash a value for one-way storage (e.g., user IDs in logs)
 */
export function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

/**
 * Check if a string is encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  return text.startsWith("enc:");
}

// =============================================================================
// SENSITIVE FIELD HELPERS
// =============================================================================

export interface EncryptedReflection {
  thought: string;
  reframe: string;
  intention?: string;
  // These remain unencrypted for analytics
  distortions: string[];
  detectedState?: string;
  keyAssumption?: string;
  anchor?: string;
}

export interface DecryptedReflection {
  thought: string;
  reframe: string;
  intention?: string;
  distortions: string[];
  detectedState?: string;
  keyAssumption?: string;
  anchor?: string;
}

/**
 * Encrypt sensitive fields in a reflection before storage
 */
export function encryptReflection(
  reflection: DecryptedReflection,
): EncryptedReflection {
  return {
    ...reflection,
    thought: encryptData(reflection.thought),
    reframe: encryptData(reflection.reframe),
    intention: reflection.intention
      ? encryptData(reflection.intention)
      : undefined,
  };
}

/**
 * Decrypt sensitive fields in a reflection after retrieval
 */
export function decryptReflection(
  encrypted: EncryptedReflection,
): DecryptedReflection {
  return {
    ...encrypted,
    thought: decryptData(encrypted.thought),
    reframe: decryptData(encrypted.reframe),
    intention: encrypted.intention
      ? decryptData(encrypted.intention)
      : undefined,
  };
}

/**
 * Redact sensitive content for logging
 */
export function redactForLogging(text: string): string {
  if (!text) return "[empty]";

  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;

  return `[REDACTED: ${charCount} chars, ${wordCount} words]`;
}
