/**
 * Server Configuration Module
 *
 * Centralizes environment variable handling with:
 * - VALIDATION_MODE support for testing without external services
 * - Fail-fast for missing required configuration
 * - Clear error messages for misconfiguration
 */

const log = console.log;

// =============================================================================
// VALIDATION MODE
// =============================================================================

/**
 * When true, the app runs in validation mode:
 * - AI routes return placeholder responses instead of calling Claude API
 * - Billing/purchase flows are disabled
 * - Missing API keys don't crash the app
 */
export const VALIDATION_MODE =
  process.env.VALIDATION_MODE === "true" || process.env.NODE_ENV === "test";

// =============================================================================
// CONFIGURATION VALUES
// =============================================================================

export const config = {
  // Server
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Anthropic Claude
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,

  // Stripe (server-side, not for mobile IAP)
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY,

  // Replit
  replitDomains: process.env.REPLIT_DOMAINS,
  replitDevDomain: process.env.REPLIT_DEV_DOMAIN,
};

// =============================================================================
// LOGGING CONFIGURATION
// =============================================================================

export const loggingConfig = {
  // Log level (error, warn, info, http, debug)
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),

  // Enable file logging in production
  enableFileLogging: process.env.NODE_ENV === 'production',

  // Log directory
  logDirectory: process.env.LOG_DIRECTORY || './logs',

  // Redact sensitive fields from logs
  redactSensitiveData: true,

  // Additional sensitive field patterns (comma-separated)
  customSensitivePatterns: process.env.SENSITIVE_LOG_PATTERNS
    ? process.env.SENSITIVE_LOG_PATTERNS.split(',')
    : [],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a key is a placeholder (CHANGEME) value
 */
export function isPlaceholderKey(key: string | undefined): boolean {
  if (!key) return true;
  return key.includes("CHANGEME") || key === "";
}

/**
 * Check if Anthropic Claude is properly configured
 */
export function isAnthropicConfigured(): boolean {
  return !isPlaceholderKey(config.anthropicApiKey);
}

/**
 * Check if Stripe is properly configured
 */
export function isStripeConfigured(): boolean {
  return (
    !isPlaceholderKey(config.stripeSecretKey) &&
    !isPlaceholderKey(config.stripeWebhookSecret)
  );
}

/**
 * Check if database is properly configured
 */
export function isDatabaseConfigured(): boolean {
  return !isPlaceholderKey(config.databaseUrl);
}

// =============================================================================
// VALIDATION MODE RESPONSE GENERATORS
// =============================================================================

/**
 * Generate placeholder analysis response for validation mode
 */
export function getValidationModeAnalyzeResponse(): {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
} {
  return {
    distortions: ["Emotional reasoning"],
    happening:
      "[VALIDATION MODE] This is a placeholder response. Configure ANTHROPIC_API_KEY for real analysis.",
    pattern: [
      "This would identify cognitive patterns in your thought.",
      "Real responses require Claude API configuration.",
    ],
    matters:
      "In production, this section provides grounded Islamic perspective on your situation.",
  };
}

/**
 * Generate placeholder reframe response for validation mode
 */
export function getValidationModeReframeResponse(): {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
} {
  return {
    beliefTested:
      "[VALIDATION MODE] This would identify the belief being tested.",
    perspective:
      "Real responses provide a truer perspective grounded in Islamic principles.",
    nextStep: "Configure ANTHROPIC_API_KEY for full functionality.",
    anchors: ["Allah's mercy exceeds sin"],
  };
}

/**
 * Generate placeholder practice response for validation mode
 */
export function getValidationModePracticeResponse(): {
  title: string;
  steps: string[];
  reminder: string;
  duration: string;
} {
  return {
    title: "[VALIDATION MODE] Grounding Practice",
    steps: [
      "This is a placeholder practice step.",
      "Real practices require Claude API configuration.",
      "Configure ANTHROPIC_API_KEY for full functionality.",
    ],
    reminder: "Placeholder reminder for validation testing.",
    duration: "1-2 minutes",
  };
}

/**
 * Generate placeholder insight summary for validation mode
 */
export function getValidationModeInsightSummary(): string {
  return "[VALIDATION MODE] Pattern insights require Claude API configuration.";
}

// =============================================================================
// STARTUP VALIDATION
// =============================================================================

/**
 * Log configuration status on startup
 */
export function logConfigStatus(): void {
  log("=".repeat(60));
  log("NOOR CBT SERVER CONFIGURATION");
  log("=".repeat(60));

  if (VALIDATION_MODE) {
    log("⚠️  VALIDATION_MODE: ENABLED");
    log("   - AI routes return placeholder responses");
    log("   - Billing/purchase flows are disabled");
    log("   - Safe for tester validation without real keys");
  } else {
    log("✅ VALIDATION_MODE: DISABLED (Production mode)");
  }

  log("-".repeat(60));
  log(`Environment: ${config.nodeEnv}`);
  log(`Port: ${config.port}`);
  log("-".repeat(60));

  // Database
  if (isDatabaseConfigured()) {
    log("✅ Database: Configured");
  } else {
    log("⚠️  Database: Not configured (DATABASE_URL missing or placeholder)");
    if (!VALIDATION_MODE) {
      log("   WARNING: Data persistence will not work");
    }
  }

  // Anthropic Claude
  if (isAnthropicConfigured()) {
    log("✅ Anthropic Claude: Configured");
  } else {
    if (VALIDATION_MODE) {
      log(
        "ℹ️  Anthropic Claude: Not configured (placeholder responses will be used)",
      );
    } else {
      log("❌ Anthropic Claude: Not configured - AI routes will fail!");
      log("   Set ANTHROPIC_API_KEY in .env");
    }
  }

  // Stripe
  if (isStripeConfigured()) {
    log("✅ Stripe: Configured");
  } else {
    if (VALIDATION_MODE) {
      log("ℹ️  Stripe: Not configured (billing disabled in validation mode)");
    } else {
      log("⚠️  Stripe: Not configured (server-side billing will not work)");
    }
  }

  log("=".repeat(60));
}

/**
 * Fail-fast check for production mode
 * Called on server startup to ensure critical config is present
 */
export function validateProductionConfig(): void {
  if (VALIDATION_MODE) {
    // In validation mode, we don't fail-fast - just log warnings
    return;
  }

  const errors: string[] = [];

  // Validate logging configuration
  const validLogLevels = ['error', 'warn', 'info', 'http', 'debug'];
  if (!validLogLevels.includes(loggingConfig.level)) {
    errors.push(
      `Invalid LOG_LEVEL: ${loggingConfig.level}. Must be one of: ${validLogLevels.join(', ')}`
    );
  }

  // SESSION_SECRET is critical for session security
  if (config.isProduction && !process.env.SESSION_SECRET) {
    errors.push(
      "SESSION_SECRET is missing. Session authentication will be insecure.",
    );
  }

  // DATABASE_URL is required in production
  if (config.isProduction && !isDatabaseConfigured()) {
    errors.push(
      "DATABASE_URL is missing or placeholder. Database is required in production.",
    );
  }

  if (!isAnthropicConfigured()) {
    errors.push(
      "ANTHROPIC_API_KEY is missing or placeholder. AI features will not work.",
    );
  }

  // Database warning for non-production environments
  if (!config.isProduction && !isDatabaseConfigured()) {
    log("⚠️  WARNING: DATABASE_URL not configured. Data will not persist.");
  }

  if (errors.length > 0) {
    log("❌ CONFIGURATION ERRORS:");
    errors.forEach((err) => log(`   - ${err}`));
    log("");
    log("Set VALIDATION_MODE=true to run without real API keys.");
    log("Or configure the missing environment variables in .env");
    log("");

    // In production, we fail hard. In development, we warn but continue.
    if (config.isProduction) {
      throw new Error(
        `Production startup blocked: ${errors.length} configuration error(s)`,
      );
    }
  }
}
