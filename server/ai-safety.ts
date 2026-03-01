/**
 * AI Safety & Guardrails System for Qamar
 *
 * This module ensures that AI-generated content is safe, supportive,
 * and aligned with Islamic principles. It includes crisis detection,
 * theological validation, and output filtering.
 */

import crypto from "crypto";
import type { EmotionalState } from "../shared/islamic-framework";

// =============================================================================
// CRISIS DETECTION & RESPONSE
// =============================================================================

export interface CrisisDetectionResult {
  detected: boolean;
  level: "none" | "concern" | "urgent" | "emergency";
  indicators: string[];
  recommendedAction: string;
  requiresHumanReview: boolean;
}

// Self-harm keywords (high precision, high recall)
const SELF_HARM_KEYWORDS = [
  "want to die",
  "wish i was dead",
  "better off dead",
  "end my life",
  "kill myself",
  "suicide",
  "suicidal",
  "hurt myself",
  "harm myself",
  "no reason to live",
  "can't go on",
  "can't take it anymore",
  "nothing to live for",
];

// Crisis language patterns (despair without immediate harm)
const CRISIS_PATTERNS = [
  "everyone would be better without me",
  "i'm a burden",
  "there's no hope",
  "nothing will ever change",
  "i've given up",
  "what's the point",
  "i don't want to be here",
  "i can't do this",
];

// Concerning patterns (requires monitoring, not crisis)
const CONCERN_PATTERNS = [
  "completely hopeless",
  "utterly worthless",
  "never be good enough",
  "allah hates me",
  "unforgivable",
  "beyond redemption",
];

export function detectCrisis(text: string): CrisisDetectionResult {
  const lowerText = text.toLowerCase();
  const indicators: string[] = [];

  // NEGATION DETECTION: Check if crisis keywords are negated
  // Examples: "I DON'T want to die", "I'm NOT suicidal", "I WON'T hurt myself"
  const negationPatterns = [
    /(?:don't|do not|dont|never|not|won't|wont|no longer|wouldn't|wouldnt|can't|cant|refuse to|will not)\s+(?:want|wish|plan|intend|going to|gonna|thinking about|considering)?\s*(?:to\s+)?(?:die|kill|hurt|harm|end|suicide)/i,
    /(?:don't|do not|dont|not|never)\s+(?:feel|am|being|get)\s+(?:suicidal|self-harm)/i,
    /(?:don't|do not|dont|not)\s+(?:have|got)\s+(?:suicidal|self-harm)\s+(?:thoughts|feelings|urges)/i,
  ];

  for (const pattern of negationPatterns) {
    if (pattern.test(text)) {
      // This is a NEGATION of crisis intent - NOT a crisis
      // User is explicitly saying they DON'T have these thoughts
      return {
        detected: false,
        level: "none",
        indicators: [
          "Negation detected - user is NOT expressing crisis intent",
        ],
        recommendedAction:
          "Proceed with standard reflection journey. User is clarifying they are not in crisis.",
        requiresHumanReview: false,
      };
    }
  }

  // Check for self-harm indicators
  const selfHarmDetected = SELF_HARM_KEYWORDS.some((keyword) => {
    if (lowerText.includes(keyword)) {
      indicators.push(`Self-harm language: "${keyword}"`);
      return true;
    }
    return false;
  });

  if (selfHarmDetected) {
    return {
      detected: true,
      level: "emergency",
      indicators,
      recommendedAction:
        "Provide crisis resources immediately. Do not proceed with reflection journey. Log for review.",
      requiresHumanReview: true,
    };
  }

  // Check for crisis patterns
  const crisisDetected = CRISIS_PATTERNS.some((pattern) => {
    if (lowerText.includes(pattern)) {
      indicators.push(`Crisis language: "${pattern}"`);
      return true;
    }
    return false;
  });

  if (crisisDetected) {
    return {
      detected: true,
      level: "urgent",
      indicators,
      recommendedAction:
        "Provide support resources. Emphasize immediate help availability. Consider pausing reflection journey.",
      requiresHumanReview: true,
    };
  }

  // Check for concerning patterns
  const concernDetected = CONCERN_PATTERNS.some((pattern) => {
    if (lowerText.includes(pattern)) {
      indicators.push(`Concerning language: "${pattern}"`);
      return true;
    }
    return false;
  });

  if (concernDetected) {
    return {
      detected: true,
      level: "concern",
      indicators,
      recommendedAction:
        "Proceed with extra compassion. Emphasize mercy. Monitor for escalation.",
      requiresHumanReview: false,
    };
  }

  return {
    detected: false,
    level: "none",
    indicators: [],
    recommendedAction: "Proceed with standard reflection journey.",
    requiresHumanReview: false,
  };
}

// =============================================================================
// CRISIS RESOURCES
// =============================================================================

export const CRISIS_RESOURCES = {
  emergency: {
    title: "You Don't Have to Carry This Alone",
    message:
      "What you're feeling is overwhelming. This moment calls for human support, not an app. Please reach out to someone who can be with you right now.",
    resources: [
      {
        name: "988 Lifeline",
        contact: "Call or text 988",
        description: "24/7 compassionate support",
      },
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        description: "Free, confidential, immediate help",
      },
      {
        name: "Emergency Services",
        contact: "Call 911",
        description: "If you're in immediate danger",
      },
      {
        name: "Trusted Counselor or Imam",
        contact: "Your local masjid",
        description: "Community support who knows you",
      },
    ],
    islamicContext:
      "Prophet Yunus (AS) called out from the depths of darkness, and Allah heard him. You are seen. You are valued. And you are not alone in this struggle.",
  },
  urgent: {
    title: "You Don't Have to Carry This Alone",
    message:
      "What you're feeling is overwhelming, and it's okay to ask for help. Please consider reaching out.",
    resources: [
      {
        name: "988 Lifeline",
        contact: "Call or text 988",
        description: "24/7 compassionate support",
      },
      {
        name: "SAMHSA National Helpline",
        contact: "1-800-662-4357",
        description: "Free referral and information service",
      },
      {
        name: "Local Imam or Counselor",
        contact: "Your masjid",
        description: "Spiritual and community support",
      },
    ],
    islamicContext:
      "Prophet Yunus (AS) called out from the depths of darkness, and Allah heard him. You are not alone in your struggle.",
  },
};

// =============================================================================
// RELIGIOUS SCRUPULOSITY DETECTION
// =============================================================================

// Obsessive-compulsive religious patterns (waswasa)
const SCRUPULOSITY_PATTERNS = [
  "i can never pray perfectly",
  "my wudu is never valid",
  "every prayer is invalid",
  "every prayer i make is invalid",
  "i've committed shirk",
  "unforgivable sin",
  "repeat my salah",
  "repeating my salah",
  "can't stop repeating",
  "can't stop thinking about whether",
  "doubt every intention",
  "scared i'm a kafir",
  "questioning if i'm muslim",
  "redo",
  "redoing wudu",
  "fear of acceptance",
  "compulsive",
];

export function detectScrupulosity(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Check for direct pattern matches
  const hasPattern = SCRUPULOSITY_PATTERNS.some((pattern) =>
    lowerText.includes(pattern),
  );

  // Check for compound scrupulosity indicators (repeating + religious act)
  const hasRepetition =
    lowerText.includes("repeat") ||
    lowerText.includes("repeating") ||
    lowerText.includes("redo") ||
    lowerText.includes("redoing");
  const hasReligiousAct =
    lowerText.includes("salah") ||
    lowerText.includes("prayer") ||
    lowerText.includes("wudu") ||
    lowerText.includes("dua");
  const hasInvalidityFear =
    lowerText.includes("invalid") ||
    lowerText.includes("not valid") ||
    lowerText.includes("not right") ||
    lowerText.includes("not correct");

  if (hasRepetition && (hasReligiousAct || hasInvalidityFear)) {
    return true;
  }

  return hasPattern;
}

export const SCRUPULOSITY_RESPONSE = {
  message:
    "What you're describing sounds like waswasa - whispers that create endless doubt and anxiety about religious practice.",
  guidance:
    "These obsessive doubts are not a sign of weak faith. They're a recognized spiritual trial. The cure is not more perfection - it's breaking the cycle of doubt.",
  recommendation:
    "Consider speaking with a knowledgeable scholar who understands religious OCD. This is a recognized condition with clear guidance.",
  islamicPrinciple:
    "Allah does not burden a soul beyond its capacity (2:286). He wants ease for you, not endless doubt.",
};

// =============================================================================
// THEOLOGICAL VALIDATION
// =============================================================================

// Prohibited content that AI must NEVER generate
const THEOLOGICAL_PROHIBITIONS = [
  // Distortions of core beliefs
  "allah doesn't care",
  "allah is punishing you",
  "you're cursed",
  "allah won't forgive",
  "you're destined to fail",
  "your dua won't be answered",

  // False promises and absolution
  "this will definitely work",
  "guaranteed healing",
  "you will be healed",
  "you will never struggle again",
  "allah promises you will get what you want",
  "you are forgiven",
  "your sins are washed away",
  "your sins are forgiven",
  "you are definitely forgiven",
  "allah has accepted your repentance",
  "you are guaranteed paradise",
  "guaranteed paradise",

  // Spiritual bypassing
  "just pray more and you'll feel better",
  "if you had stronger iman this wouldn't happen",
  "real muslims don't feel this way",
  "depression is lack of faith",

  // Unauthorized religious rulings
  "this is haram",
  "this is halal",
  "you must",
  "islam requires",
];

export function validateTheologicalSafety(text: string): {
  safe: boolean;
  violations: string[];
} {
  const lowerText = text.toLowerCase();
  const violations: string[] = [];

  for (const prohibition of THEOLOGICAL_PROHIBITIONS) {
    if (lowerText.includes(prohibition)) {
      violations.push(prohibition);
    }
  }

  return {
    safe: violations.length === 0,
    violations,
  };
}

// =============================================================================
// OUTPUT VALIDATION
// =============================================================================

export interface OutputValidationResult {
  approved: boolean;
  issues: string[];
  severity: "none" | "minor" | "major" | "critical";
  modifiedOutput?: string;
}

export function validateAIOutput(
  output: string,
  context: {
    type: "analysis" | "reframe" | "practice";
    emotionalState?: EmotionalState;
  },
): OutputValidationResult {
  const issues: string[] = [];
  let severity: "none" | "minor" | "major" | "critical" = "none";

  // Check theological safety
  const theological = validateTheologicalSafety(output);
  if (!theological.safe) {
    issues.push(`Theological violations: ${theological.violations.join(", ")}`);
    severity = "critical";
  }

  // Check for harmful language
  const crisis = detectCrisis(output);
  if (crisis.detected && crisis.level !== "none") {
    issues.push(
      `Crisis language detected in output: ${crisis.indicators.join(", ")}`,
    );
    severity = "critical";
  }

  // Check for spiritual bypassing (CRITICAL - never allow this)
  const bypassingIndicators = [
    "just trust allah",
    "just make dua",
    "just pray more",
    "if you had more faith",
    "if you had stronger iman",
    "you should be grateful",
    "real muslims don't feel this way",
  ];

  const hasBypassing = bypassingIndicators.some((indicator) =>
    output.toLowerCase().includes(indicator),
  );

  if (hasBypassing) {
    issues.push("Spiritual bypassing detected - CRITICAL");
    severity = "critical";
  }

  // Check for judgmental language (MAJOR severity - make critical if severe enough)
  const judgmentalPatterns = [
    "you should feel",
    "you should be",
    "you must do",
    "you must try",
    "you need to try",
    "you need to",
    "you have to",
    "real muslims",
    "a good muslim",
  ];

  const hasJudgmental = judgmentalPatterns.some((pattern) =>
    output.toLowerCase().includes(pattern),
  );

  if (hasJudgmental) {
    issues.push("Judgmental language detected");
    // Judgmental language is CRITICAL (blocks output)
    severity = "critical";
  }

  // Check for appropriate length based on context
  if (context.type === "practice" && output.length > 800) {
    issues.push("Practice instructions too lengthy");
    severity = severity === "none" ? "minor" : severity;
  }

  return {
    approved: severity !== "critical",
    issues,
    severity,
  };
}

// =============================================================================
// PROMPT VERSIONING SYSTEM
// =============================================================================

export interface PromptVersion {
  id: string;
  version: string;
  type: "analysis" | "reframe" | "practice" | "insight";
  prompt: string;
  active: boolean;
  createdAt: Date;
  metadata: {
    description: string;
    changes?: string;
    testResults?: {
      accuracy: number;
      safety: number;
      satisfaction: number;
    };
  };
}

export class PromptVersionManager {
  private versions: Map<string, PromptVersion[]> = new Map();

  registerVersion(version: PromptVersion): void {
    const key = version.type;
    if (!this.versions.has(key)) {
      this.versions.set(key, []);
    }
    this.versions.get(key)!.push(version);
  }

  getActiveVersion(type: PromptVersion["type"]): PromptVersion | null {
    const versions = this.versions.get(type) || [];
    return versions.find((v) => v.active) || null;
  }

  setActiveVersion(type: PromptVersion["type"], versionId: string): boolean {
    const versions = this.versions.get(type) || [];

    // Deactivate all versions
    versions.forEach((v) => (v.active = false));

    // Activate specified version
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      version.active = true;
      return true;
    }

    return false;
  }

  getAllVersions(type: PromptVersion["type"]): PromptVersion[] {
    return this.versions.get(type) || [];
  }

  rollback(type: PromptVersion["type"]): boolean {
    const versions = this.versions.get(type) || [];
    const sortedVersions = versions.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    if (sortedVersions.length < 2) {
      return false;
    }

    // Find current active
    const currentIndex = sortedVersions.findIndex((v) => v.active);
    if (currentIndex === -1 || currentIndex === sortedVersions.length - 1) {
      return false;
    }

    // Rollback to previous version
    sortedVersions[currentIndex].active = false;
    sortedVersions[currentIndex + 1].active = true;

    return true;
  }
}

// Global instance
export const promptVersionManager = new PromptVersionManager();

// =============================================================================
// SAFETY BOUNDARIES
// =============================================================================

export const AI_BOUNDARIES = {
  canDo: [
    "Provide reflection tools and perspective reframing",
    "Offer Islamic concepts from authenticated whitelist",
    "Suggest breathing exercises and grounding techniques",
    "Validate emotional experiences",
    "Identify thought patterns",
    "Encourage professional help when appropriate",
    "Provide multiple perspectives on a thought",
  ],

  cannotDo: [
    "Make psychological diagnoses",
    "Prescribe medication or treatment",
    "Give fatwas or religious rulings",
    "Guarantee outcomes or healing",
    "Replace human therapists or scholars",
    "Access or recall previous conversations (HIPAA)",
    "Make decisions for the user",
    "Claim to be an authority",
  ],

  mustAlways: [
    "Validate emotions before analyzing them",
    "Emphasize Allah's mercy when discussing sin",
    "Suggest professional help for persistent struggles",
    "Distinguish between effort and outcome",
    "Maintain supportive boundaries",
    "Use concepts from authenticated whitelist only",
    "Detect and respond to crisis language",
  ],

  mustNever: [
    "Minimize or dismiss user's pain",
    "Suggest that struggle equals weak faith",
    "Provide religious rulings beyond core concepts",
    "Use guilt or shame as motivation",
    "Promise guaranteed results",
    "Quote weak or fabricated hadith",
    "Engage in theological debate",
    "Bypass safety checks",
  ],
};

// =============================================================================
// LOGGING & REDACTION
// =============================================================================

export interface SafeLogEntry {
  timestamp: Date;
  userId: string; // hashed
  eventType:
    | "thought_captured"
    | "analysis_generated"
    | "reframe_generated"
    | "crisis_detected";
  metadata: {
    emotionalIntensity?: number;
    patternsDetected?: string[];
    crisisLevel?: CrisisDetectionResult["level"];
    safetyChecksPassed?: boolean;
  };
  // NO raw thought content stored
}

export function createSafeLogEntry(
  userId: string,
  eventType: SafeLogEntry["eventType"],
  metadata: SafeLogEntry["metadata"],
): SafeLogEntry {
  return {
    timestamp: new Date(),
    userId: hashUserId(userId),
    eventType,
    metadata,
  };
}

/**
 * Hash user ID for anonymization in logs and telemetry
 * Uses SHA-256 for cryptographic security to prevent re-identification
 */
function hashUserId(userId: string): string {
  return `user_${crypto.createHash("sha256").update(userId).digest("hex").slice(0, 16)}`;
}

export function redactSensitiveContent(text: string): string {
  // Return metadata only, not content
  return `[REDACTED - ${text.length} chars, ${text.split(" ").length} words]`;
}

// =============================================================================
// ADAPTIVE SAFETY THRESHOLDS
// =============================================================================

export interface SafetyThresholds {
  crisisKeywordThreshold: number;
  theologicalViolationThreshold: number;
  judgmentalLanguageThreshold: number;
  outputLengthMax: number;
}

export function getAdaptiveSafetyThresholds(userHistory: {
  crisisEventsCount: number;
  accountAge: number;
}): SafetyThresholds {
  // More sensitive thresholds for users with crisis history
  const baseThresholds: SafetyThresholds = {
    crisisKeywordThreshold: 1,
    theologicalViolationThreshold: 0,
    judgmentalLanguageThreshold: 2,
    outputLengthMax: 1000,
  };

  if (userHistory.crisisEventsCount > 0) {
    return {
      ...baseThresholds,
      crisisKeywordThreshold: 0, // Zero tolerance
      judgmentalLanguageThreshold: 1, // More sensitive
    };
  }

  return baseThresholds;
}

// =============================================================================
// EXPORT VALIDATION HELPERS
// =============================================================================

export function validateAndSanitizeInput(input: string): {
  valid: boolean;
  sanitized: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let sanitized = input.trim();

  // Check length
  if (sanitized.length === 0) {
    return { valid: false, sanitized: "", warnings: ["Input is empty"] };
  }

  if (sanitized.length > 5000) {
    warnings.push("Input truncated to 5000 characters");
    sanitized = sanitized.substring(0, 5000);
  }

  // Check for suspicious patterns (but don't censor - just warn)
  const suspiciousPatterns = ["<script", "javascript:", "onerror="];
  for (const pattern of suspiciousPatterns) {
    if (sanitized.toLowerCase().includes(pattern)) {
      warnings.push(`Suspicious pattern detected: ${pattern}`);
    }
  }

  return {
    valid: true,
    sanitized,
    warnings,
  };
}
