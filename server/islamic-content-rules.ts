/**
 * Islamic Content Rules for Qamar
 *
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 *
 * Sourcing rules, constraints, verification, and charter enforcement
 * for Islamic content usage.
 *
 * Enforces Charter Part 8: Islamic Content Usage Rules
 */

import {
  DistressLevel,
  IslamicConcept,
  QURAN_BY_STATE,
  HADITH_BY_STATE,
} from "../shared/islamic-framework";
import { type CrisisDetectionResult } from "./ai-safety";
import type { IslamicContentSelection } from "./islamic-content-mapper";

// =============================================================================
// CHARTER PART 8: ISLAMIC CONTENT SOURCING RULES
// =============================================================================

/**
 * Explicit sourcing rules per Charter Part 8
 */
export const SOURCING_RULES = {
  quran: {
    translation: "Sahih International",
    usage: "Grounding and mercy ONLY, never as argument or proof",
    maxPerResponse: 1,
    forbidden: [
      "Verse stacking (multiple ayat)",
      "Out of context usage",
      "After crisis detection (except mercy verses in urgent)",
      "As argument to convince user",
      "Without proper supportive context",
    ],
  },
  hadith: {
    authenticity: ["Sahih Bukhari", "Sahih Muslim", "Agreed Upon"],
    maxPerResponse: 1,
    usage: "Therapeutic context only, not as religious proof",
    forbidden: [
      "Weak (da'if) hadith",
      "Fabricated (mawdu') narrations",
      "Israelite narrations (Isra'iliyyat)",
      "Hadith not in authenticated whitelist",
      "Multiple hadith in one response",
    ],
  },
  concepts: {
    whitelist: [
      "niyyah",
      "sabr",
      "tawakkul",
      "tazkiyah",
      "shukr",
      "tawbah",
      "dhikr",
      "muraqaba",
      "muhasaba",
      "ridha",
      "khushu",
      "ikhlas",
    ],
    requiresContext: true,
    forbidden: [
      "Concepts outside the 12",
      "Sectarian interpretations",
      "Concepts without supportive framing",
    ],
  },
};

/**
 * Distress-based content restrictions per Charter Part 8
 */
export const DISTRESS_CONTENT_RESTRICTIONS: Record<
  DistressLevel,
  {
    quranAllowed: boolean;
    hadithAllowed: boolean;
    conceptComplexity: "full" | "balanced" | "simple" | "minimal";
    notes: string;
  }
> = {
  low: {
    quranAllowed: true,
    hadithAllowed: true,
    conceptComplexity: "full",
    notes: "Full depth okay. User has capacity for reflection.",
  },
  moderate: {
    quranAllowed: true,
    hadithAllowed: true,
    conceptComplexity: "balanced",
    notes: "Balanced approach. Standard supportive usage.",
  },
  high: {
    quranAllowed: true, // Only mercy verses
    hadithAllowed: false,
    conceptComplexity: "simple",
    notes: "Mercy verses only. Simple, concrete language.",
  },
  crisis: {
    quranAllowed: false,
    hadithAllowed: false,
    conceptComplexity: "minimal",
    notes: "No verses. No hadith. Minimal content. Resources only.",
  },
};

// =============================================================================
// AUTHENTICITY LEVEL TAGGING SYSTEM
// =============================================================================

export interface AuthenticatedContent {
  text: string;
  source: string;
  authenticityLevel: "quran" | "sahih" | "hassan" | "weak" | "unknown";
  scholarApproved: boolean;
  supportiveContext: string;
  usageConstraints: string[];
  reviewDate?: Date;
  reviewedBy?: string;
}

/**
 * Verify content authenticity
 */
export function verifyAuthenticity(
  contentType: "quran" | "hadith" | "concept",
  reference: string,
): { authentic: boolean; level: string; issues: string[] } {
  const issues: string[] = [];

  if (contentType === "quran") {
    // All Quran content is authentic by definition
    // Check if it's in our whitelist
    const inWhitelist = Object.values(QURAN_BY_STATE).some(
      (reminder) => reminder.reference === reference,
    );

    if (!inWhitelist) {
      issues.push(
        `Quranic reference "${reference}" not in authenticated whitelist`,
      );
    }

    return {
      authentic: inWhitelist,
      level: "quran",
      issues,
    };
  }

  if (contentType === "hadith") {
    // Check if hadith is in our whitelist
    const inWhitelist = Object.values(HADITH_BY_STATE).some(
      (reminder) => reminder && reminder.source === reference,
    );

    if (!inWhitelist) {
      issues.push(
        `Hadith reference "${reference}" not in authenticated whitelist`,
      );
      return {
        authentic: false,
        level: "unknown",
        issues,
      };
    }

    // Check authenticity level from whitelist
    const hadith = Object.values(HADITH_BY_STATE).find(
      (reminder) => reminder && reminder.source === reference,
    );

    if (
      hadith?.authenticity === "Sahih Bukhari" ||
      hadith?.authenticity === "Sahih Muslim" ||
      hadith?.authenticity === "Agreed Upon"
    ) {
      return {
        authentic: true,
        level: "sahih",
        issues: [],
      };
    }

    issues.push(`Hadith authenticity level not confirmed as Sahih`);
    return {
      authentic: false,
      level: "unknown",
      issues,
    };
  }

  if (contentType === "concept") {
    // Check if concept is in whitelist
    const inWhitelist = SOURCING_RULES.concepts.whitelist.includes(reference);

    if (!inWhitelist) {
      issues.push(
        `Concept "${reference}" not in authenticated whitelist of 12 core concepts`,
      );
    }

    return {
      authentic: inWhitelist,
      level: "concept",
      issues,
    };
  }

  return {
    authentic: false,
    level: "unknown",
    issues: ["Unknown content type"],
  };
}

// =============================================================================
// CONTEXTUAL USAGE CONSTRAINTS
// =============================================================================

/**
 * Usage constraints for each Islamic concept
 */
export const CONCEPT_USAGE_CONSTRAINTS: Record<
  IslamicConcept,
  {
    applyWhen: string[];
    neverWhen: string[];
    example: string;
    supportiveBoundary: string;
  }
> = {
  tawakkul: {
    applyWhen: ["Anxiety about outcomes", "Control issues", "Future worry"],
    neverWhen: [
      "User avoiding action",
      "Spiritual bypassing detected",
      "User needs to make change",
    ],
    example:
      'After effort, not instead of effort. "You\'ve done what you can. The rest is not yours to carry."',
    supportiveBoundary:
      "Tawakkul is not passivity. It requires doing your part first.",
  },
  sabr: {
    applyWhen: [
      "Prolonged difficulty",
      "Building resilience",
      "Waiting for change",
    ],
    neverWhen: ["Abuse situation", "Change is needed now", "Tolerating harm"],
    example:
      'Active endurance, not passive tolerance. "Sabr doesn\'t mean staying stuck. It means staying steady while working toward change."',
    supportiveBoundary:
      "Never use sabr to keep someone in a harmful situation.",
  },
  shukr: {
    applyWhen: [
      "Ingratitude spiral",
      "Cannot see blessings",
      "Comparison to others",
    ],
    neverWhen: [
      "Acute grief",
      "Gratitude would dismiss pain",
      "User already practicing gratitude",
    ],
    example:
      "Validate pain first. \"What's one thing, even small, that's working right now?\"",
    supportiveBoundary:
      "Gratitude alongside struggle, not instead of acknowledging it.",
  },
  tawbah: {
    applyWhen: ["Shame about past", "Feeling unworthy", "Stuck in regret"],
    neverWhen: [
      "User hasn't done anything wrong",
      "Shame is unfounded",
      "Self-condemnation already high",
    ],
    example:
      'Frame as return, not failure. "The door is always open. Starting fresh is always possible."',
    supportiveBoundary: "Tawbah breaks shame cycles; it doesn't create them.",
  },
  dhikr: {
    applyWhen: ["Overwhelm", "Anxiety", "Need for grounding", "Rumination"],
    neverWhen: [
      "As only intervention",
      "Dismissing other needs",
      "In place of professional help",
    ],
    example:
      'As one tool among many. "Dhikr can be an anchor. Would you like to try a simple practice?"',
    supportiveBoundary: "Dhikr is grounding, not a cure-all.",
  },
  muraqaba: {
    applyWhen: [
      "Lack of self-awareness",
      "Reactive patterns",
      "Need for witnessing",
    ],
    neverWhen: ["Acute crisis", "High distress", "Overwhelming emotion"],
    example: 'The observer stance. "Notice the thought without becoming it."',
    supportiveBoundary: "Requires emotional capacity. Not for crisis states.",
  },
  muhasaba: {
    applyWhen: [
      "Pattern recognition needed",
      "Growth reflection",
      "Gentle accountability",
    ],
    neverWhen: [
      "High shame",
      "Self-attack present",
      "Depression with rumination",
    ],
    example:
      'Honest inventory without self-destruction. "What can you learn here?"',
    supportiveBoundary: "Assessment, not judgment. Never fuel self-attack.",
  },
  ridha: {
    applyWhen: ["Over-attachment to outcome", "Comparison", "Control struggle"],
    neverWhen: [
      "Resignation being confused with contentment",
      "Passivity",
      "Avoiding necessary action",
    ],
    example:
      'Peace from acceptance, not achievement. "Contentment with effort, not outcome."',
    supportiveBoundary: "Ridha is not complacency or giving up.",
  },
  tazkiyah: {
    applyWhen: [
      "Framing reflection as spiritual work",
      "Soul purification",
      "Growth mindset",
    ],
    neverWhen: [
      "Perfectionism present",
      "Scrupulosity detected",
      "Self-improvement obsession",
    ],
    example:
      'Soul work, not performance. "This work is purifying, even when it\'s hard."',
    supportiveBoundary: "Growth-oriented, not perfection-driven.",
  },
  niyyah: {
    applyWhen: ["Beginning of work", "Values clarification", "Purpose-setting"],
    neverWhen: [
      "Overthinking intention",
      "Scrupulosity about intentions",
      "Analysis paralysis",
    ],
    example:
      'Setting direction, not overthinking. "What\'s your intention for this work?"',
    supportiveBoundary: "Simple and clear. Not obsessive.",
  },
  khushu: {
    applyWhen: ["Distracted", "Surface-level", "Lack of presence"],
    neverWhen: [
      'Anxiety about doing it "right"',
      "Perfectionism in prayer",
      "Scrupulosity",
    ],
    example:
      'Presence without pressure. "Full attention, without judgment about how well you\'re doing."',
    supportiveBoundary: "Quality of presence, not performance metric.",
  },
  ikhlas: {
    applyWhen: ["People-pleasing", "Validation-seeking", "Audience anxiety"],
    neverWhen: [
      "Isolation",
      "Avoiding help",
      "Using sincerity to reject support",
    ],
    example: 'For Allah, not for show. "Who is this really for?"',
    supportiveBoundary: "Sincerity, not isolation or pride.",
  },
};

// =============================================================================
// CHARTER ENFORCEMENT: NO VERSE AFTER CRISIS RULE
// =============================================================================

/**
 * Enforce Charter Part 8: No Verse After Crisis Rule
 *
 * CRITICAL: When crisis is detected, do NOT include Quranic verses or hadith
 */
export function enforceNoVerseAfterCrisis(
  crisisDetected: CrisisDetectionResult | undefined,
  distressLevel: DistressLevel,
  selection: IslamicContentSelection,
): IslamicContentSelection {
  // Rule 1: No verse or hadith in emergency crisis
  if (crisisDetected && crisisDetected.level === "emergency") {
    return {
      ...selection,
      quran: undefined,
      hadith: undefined,
      responseLength: "minimal",
    };
  }

  // Rule 2: Only mercy verses in urgent crisis, no hadith
  if (crisisDetected && crisisDetected.level === "urgent") {
    // Only allow if emphasis is on mercy (rahma)
    if (selection.emphasis !== "rahma") {
      return {
        ...selection,
        quran: undefined,
        hadith: undefined,
      };
    }

    // Even with mercy emphasis, remove hadith
    return {
      ...selection,
      hadith: undefined,
    };
  }

  // Rule 3: High distress restrictions
  if (distressLevel === "high") {
    return {
      ...selection,
      hadith: undefined, // No hadith in high distress
    };
  }

  return selection;
}

// =============================================================================
// SCHOLAR REVIEW REGISTRY
// =============================================================================

/**
 * Placeholder for scholar-approved content registry
 *
 * In production, this would be populated after actual scholar review
 */
export const SCHOLAR_APPROVED_CONTENT = {
  reviewStatus: "PENDING_INITIAL_REVIEW",
  reviewedBy: [],
  approvedQuranAyat: Object.keys(QURAN_BY_STATE),
  approvedHadith: Object.keys(HADITH_BY_STATE),
  approvedConcepts: SOURCING_RULES.concepts.whitelist,
  reviewNotes:
    "Awaiting initial review by qualified Islamic scholars with mental health understanding",
  nextReviewDate: "2026-04-01", // Quarterly review
  reviewCriteria: [
    "Theological accuracy",
    "Contextual appropriateness",
    "Spiritual safety",
    "Balanced approach",
    "Therapeutic integrity",
  ],
};

/**
 * Check if content is scholar-approved
 */
export function isScholarApproved(
  contentType: "quran" | "hadith" | "concept",
  reference: string,
): boolean {
  // In production, this would check actual scholar approvals
  // For now, we check against our authenticated whitelist

  if (contentType === "quran") {
    return SCHOLAR_APPROVED_CONTENT.approvedQuranAyat.includes(reference);
  }

  if (contentType === "hadith") {
    return SCHOLAR_APPROVED_CONTENT.approvedHadith.includes(reference);
  }

  if (contentType === "concept") {
    return SCHOLAR_APPROVED_CONTENT.approvedConcepts.includes(reference);
  }

  return false;
}
