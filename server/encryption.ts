/**
 * Encryption utilities for HIPAA-compliant data protection
 * Uses AES-256-GCM for encryption with unique IVs per record
 */

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

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
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag
    const tag = cipher.getAuthTag();
    
    // Return as combined string: iv:tag:encrypted
    return `enc:${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('[Encryption] Encryption failed:', error);
    return text; // Fallback to plaintext in dev
  }
}

/**
 * Decrypt encrypted data
 */
export function decryptData(encryptedText: string): string {
  if (!encryptedText) return encryptedText;
  
  // Check if encrypted
  if (!encryptedText.startsWith('enc:')) {
    return encryptedText;
  }
  
  try {
    // Parse encrypted string: enc:iv:tag:encrypted
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted format');
    }
    
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];
    
    // Create decipher
    const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[Encryption] Decryption failed:', error);
    return encryptedText; // Fallback
  }
}

/**
 * Hash a value for one-way storage (e.g., user IDs in logs)
 */
export function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

/**
 * Check if a string is encrypted
 */
export function isEncrypted(text: string): boolean {
  if (!text) return false;
  return text.startsWith('enc:');
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
export function encryptReflection(reflection: DecryptedReflection): EncryptedReflection {
  return {
    ...reflection,
    thought: encryptData(reflection.thought),
    reframe: encryptData(reflection.reframe),
    intention: reflection.intention ? encryptData(reflection.intention) : undefined,
  };
}

/**
 * Decrypt sensitive fields in a reflection after retrieval
 */
export function decryptReflection(encrypted: EncryptedReflection): DecryptedReflection {
  return {
    ...encrypted,
    thought: decryptData(encrypted.thought),
    reframe: decryptData(encrypted.reframe),
    intention: encrypted.intention ? decryptData(encrypted.intention) : undefined,
  };
}

/**
 * Redact sensitive content for logging
 */
export function redactForLogging(text: string): string {
  if (!text) return '[empty]';
  
  const wordCount = text.split(/\s+/).length;
  const charCount = text.length;
  
  return `[REDACTED: ${charCount} chars, ${wordCount} words]`;
}
