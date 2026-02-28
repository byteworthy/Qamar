/**
 * Islamic Content Mapper for Qamar
 *
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 *
 * Intelligently selects Quran, Hadith, and Islamic concepts
 * based on user's emotional state, distress level, and context.
 *
 * Enforces Charter Part 8: Islamic Content Usage Rules
 */

import {
  EmotionalState,
  DistressLevel,
  IslamicConcept,
  QURAN_BY_STATE,
  HADITH_BY_STATE,
  ISLAMIC_CONCEPTS,
  DISTRESS_RESPONSE_MATRIX,
  CONCEPT_RULES,
  QuranicReminder,
  HadithReminder,
  ConceptDefinition,
} from "../shared/islamic-framework";

// Re-export everything from islamic-content-rules so existing imports continue to work
export {
  SOURCING_RULES,
  DISTRESS_CONTENT_RESTRICTIONS,
  type AuthenticatedContent,
  verifyAuthenticity,
  CONCEPT_USAGE_CONSTRAINTS,
  enforceNoVerseAfterCrisis,
  SCHOLAR_APPROVED_CONTENT,
  isScholarApproved,
} from "./islamic-content-rules";

// =============================================================================
// TYPES
// =============================================================================

export interface IslamicContentSelection {
  quran?: QuranicReminder;
  hadith?: HadithReminder;
  concept: ConceptDefinition;
  conceptKey: IslamicConcept;
  tone: string;
  responseLength: "normal" | "shorter" | "minimal";
  emphasis: "rahma" | "sabr" | "tawakkul" | "hope";
}

export interface ContentSelectionContext {
  emotionalState: EmotionalState;
  distressLevel: DistressLevel;
  context: "analyze" | "reframe" | "practice" | "dua" | "insight";
  thoughtPatterns?: string[];
  beliefType?: string;
  previousConcepts?: IslamicConcept[];
}

// =============================================================================
// THOUGHT PATTERN TO CONCEPT MAPPING
// =============================================================================

const PATTERN_TO_CONCEPT: Record<string, IslamicConcept[]> = {
  "Despair of Allah's Mercy": ["tawbah", "shukr", "ridha"],
  "Over-attachment to dunya outcome": ["tawakkul", "sabr", "ridha"],
  "Mind reading": ["muraqaba", "tawakkul", "ikhlas"],
  Catastrophizing: ["tawakkul", "sabr", "dhikr"],
  "Emotional reasoning": ["muraqaba", "muhasaba", "sabr"],
  "Black-and-white thinking": ["sabr", "ridha", "tawakkul"],
  "Hasty generalization": ["muraqaba", "muhasaba", "sabr"],
  "Self-blame beyond accountability": ["tawbah", "shukr", "ridha"],
  "Ingratitude bias": ["shukr", "muraqaba", "dhikr"],
  "Comparison to others' blessings": ["shukr", "ridha", "ikhlas"],
};

// =============================================================================
// BELIEF TYPE TO CONCEPT MAPPING
// =============================================================================

const BELIEF_TYPE_TO_CONCEPT: Record<string, IslamicConcept[]> = {
  worth: ["tawbah", "shukr", "ridha"], // Self-worth → tawbah, shukr
  control: ["tawakkul", "sabr", "ridha"], // Control → tawakkul
  safety: ["tawakkul", "dhikr", "sabr"], // Safety → tawakkul, dhikr
  others: ["ikhlas", "tawakkul", "ridha"], // Others' views → ikhlas
  allah: ["muraqaba", "tawakkul", "dhikr"], // Allah's view → muraqaba
  future: ["tawakkul", "sabr", "niyyah"], // Future → tawakkul, sabr
};

// =============================================================================
// ISLAMIC CONTENT MAPPER CLASS
// =============================================================================

export class IslamicContentMapper {
  /**
   * Select appropriate Islamic content based on user context
   */
  static selectContent(
    context: ContentSelectionContext,
  ): IslamicContentSelection {
    const {
      emotionalState,
      distressLevel,
      context: useContext,
      thoughtPatterns,
      beliefType,
      previousConcepts,
    } = context;

    const distressResponse = DISTRESS_RESPONSE_MATRIX[distressLevel];

    // Select primary concept based on context
    let conceptKey = this.selectConcept(context);

    // Avoid repeating previous concepts if possible
    if (previousConcepts && previousConcepts.indexOf(conceptKey) !== -1) {
      conceptKey = this.selectAlternativeConcept(context, previousConcepts);
    }

    const concept = ISLAMIC_CONCEPTS[conceptKey];

    // Get Quran/Hadith based on emotional state and distress level
    const quran = this.selectQuran(emotionalState, distressLevel, useContext);
    const hadith = this.selectHadith(emotionalState, distressLevel, useContext);

    return {
      quran,
      hadith,
      concept,
      conceptKey,
      tone: distressResponse.toneAdjustment,
      responseLength: distressResponse.responseLength,
      emphasis: distressResponse.quranicEmphasis,
    };
  }

  /**
   * Select the most appropriate concept based on context
   */
  private static selectConcept(
    context: ContentSelectionContext,
  ): IslamicConcept {
    const { emotionalState, distressLevel, thoughtPatterns, beliefType } =
      context;

    // Priority 1: Distress-level based selection for high distress
    if (distressLevel === "crisis" || distressLevel === "high") {
      return DISTRESS_RESPONSE_MATRIX[distressLevel].primaryConcept;
    }

    // Priority 2: Thought pattern based selection
    if (thoughtPatterns && thoughtPatterns.length > 0) {
      const primaryPattern = thoughtPatterns[0];
      const concepts = PATTERN_TO_CONCEPT[primaryPattern];
      if (concepts && concepts.length > 0) {
        return concepts[0];
      }
    }

    // Priority 3: Belief type based selection
    if (beliefType && BELIEF_TYPE_TO_CONCEPT[beliefType]) {
      return BELIEF_TYPE_TO_CONCEPT[beliefType][0];
    }

    // Priority 4: Emotional state based selection
    return this.getConceptForEmotion(emotionalState);
  }

  /**
   * Select an alternative concept when primary is already used
   */
  private static selectAlternativeConcept(
    context: ContentSelectionContext,
    previousConcepts: IslamicConcept[],
  ): IslamicConcept {
    const { thoughtPatterns, beliefType, emotionalState } = context;

    // Try pattern-based alternatives
    if (thoughtPatterns && thoughtPatterns.length > 0) {
      const primaryPattern = thoughtPatterns[0];
      const concepts = PATTERN_TO_CONCEPT[primaryPattern];
      if (concepts) {
        for (const concept of concepts) {
          if (previousConcepts.indexOf(concept) === -1) {
            return concept;
          }
        }
      }
    }

    // Try belief type alternatives
    if (beliefType && BELIEF_TYPE_TO_CONCEPT[beliefType]) {
      for (const concept of BELIEF_TYPE_TO_CONCEPT[beliefType]) {
        if (previousConcepts.indexOf(concept) === -1) {
          return concept;
        }
      }
    }

    // Fall back to emotion-based
    return this.getConceptForEmotion(emotionalState);
  }

  /**
   * Get concept for emotional state
   */
  private static getConceptForEmotion(
    emotionalState: EmotionalState,
  ): IslamicConcept {
    const emotionToConceptMap: Record<EmotionalState, IslamicConcept> = {
      anxiety: "dhikr",
      grief: "sabr",
      fear: "tawakkul",
      shame: "tawbah",
      anger: "sabr",
      loneliness: "dhikr",
      doubt: "muraqaba",
      despair: "tawakkul",
      exhaustion: "sabr",
      overwhelm: "tawakkul",
      hopelessness: "tawakkul",
      guilt: "tawbah",
    };

    return emotionToConceptMap[emotionalState] || "dhikr";
  }

  /**
   * Select Quranic content based on context
   */
  private static selectQuran(
    emotionalState: EmotionalState,
    distressLevel: DistressLevel,
    context: "analyze" | "reframe" | "practice" | "dua" | "insight",
  ): QuranicReminder | undefined {
    // Don't include Quran for analysis (keep it simple)
    if (context === "analyze") {
      return undefined;
    }

    // Don't include Quran for high distress (keep it minimal)
    if (distressLevel === "crisis") {
      return undefined;
    }

    // For high distress, only include if it's mercy-focused
    if (distressLevel === "high") {
      const distressResponse = DISTRESS_RESPONSE_MATRIX[distressLevel];
      if (distressResponse.quranicEmphasis !== "rahma") {
        return undefined;
      }
    }

    return QURAN_BY_STATE[emotionalState];
  }

  /**
   * Select Hadith content based on context
   */
  private static selectHadith(
    emotionalState: EmotionalState,
    distressLevel: DistressLevel,
    context: "analyze" | "reframe" | "practice" | "dua" | "insight",
  ): HadithReminder | undefined {
    // Don't include Hadith for analysis (keep it simple)
    if (context === "analyze") {
      return undefined;
    }

    // Don't include Hadith for high distress or crisis (keep it minimal)
    if (distressLevel === "high" || distressLevel === "crisis") {
      return undefined;
    }

    return HADITH_BY_STATE[emotionalState];
  }

  /**
   * Validate that content is appropriate for the context
   */
  static validateContent(text: string): { safe: boolean; issues: string[] } {
    const issues: string[] = [];
    const lowerText = text.toLowerCase();

    // Check for spiritual bypassing patterns
    const bypassingPatterns = [
      "just trust allah",
      "just make dua",
      "if you had more faith",
      "you should be grateful",
      "real muslims don't",
      "just pray more",
    ];

    for (const pattern of bypassingPatterns) {
      if (lowerText.includes(pattern)) {
        issues.push(`Spiritual bypassing detected: "${pattern}"`);
      }
    }

    // Check for guilt-based motivation
    const guiltPatterns = [
      "you should feel",
      "allah is disappointed",
      "you're failing",
      "you're not good enough",
    ];

    for (const pattern of guiltPatterns) {
      if (lowerText.includes(pattern)) {
        issues.push(`Guilt-based language detected: "${pattern}"`);
      }
    }

    // Check for fatwa-like language
    const fatwaPatterns = [
      "this is haram",
      "this is halal",
      "you must",
      "islam requires",
      "it is forbidden",
    ];

    for (const pattern of fatwaPatterns) {
      if (lowerText.includes(pattern)) {
        issues.push(`Fatwa-like language detected: "${pattern}"`);
      }
    }

    return {
      safe: issues.length === 0,
      issues,
    };
  }

  /**
   * Build a contextual prompt modifier with Islamic content
   */
  static buildIslamicPromptModifier(
    selection: IslamicContentSelection,
  ): string {
    let modifier = `\n\nISLAMIC CONTEXT FOR THIS RESPONSE:\n`;

    // Add concept
    modifier += `Primary Concept: ${selection.concept.transliteration} (${selection.concept.arabic}) - ${selection.concept.meaning}\n`;
    modifier += `Supportive Application: ${selection.concept.supportiveApplication}\n`;
    modifier += `Reflection Connection: ${selection.concept.reflectionConnection}\n`;

    // Add Quran if available
    if (selection.quran) {
      modifier += `\nQuranic Reminder (${selection.quran.reference}):\n`;
      modifier += `"${selection.quran.translation}"\n`;
      modifier += `Supportive Context: ${selection.quran.supportiveContext}\n`;
    }

    // Add Hadith if available
    if (selection.hadith) {
      modifier += `\nHadith Reminder (${selection.hadith.source}):\n`;
      modifier += `"${selection.hadith.translation}"\n`;
      modifier += `Supportive Context: ${selection.hadith.supportiveContext}\n`;
    }

    // Add tone and emphasis guidance
    modifier += `\nRESPONSE GUIDANCE:\n`;
    modifier += `- Tone: ${selection.tone}\n`;
    modifier += `- Response Length: ${selection.responseLength}\n`;
    modifier += `- Emphasis: ${selection.emphasis}\n`;

    return modifier;
  }

  /**
   * Get a list of applicable concepts for a given emotional state
   */
  static getApplicableConcepts(
    emotionalState: EmotionalState,
  ): IslamicConcept[] {
    const applicableConcepts: IslamicConcept[] = [];

    for (const rule of CONCEPT_RULES) {
      // Check if the concept applies to any emotional state-related conditions
      const applies = rule.applyWhen.some(
        (condition) =>
          condition.toLowerCase().includes(emotionalState) ||
          condition.toLowerCase().includes("prolonged difficulty") ||
          condition.toLowerCase().includes("feel"),
      );

      if (applies) {
        applicableConcepts.push(rule.concept);
      }
    }

    // Always include dhikr as a default grounding practice
    if (applicableConcepts.indexOf("dhikr") === -1) {
      applicableConcepts.push("dhikr");
    }

    return applicableConcepts;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get a simple Islamic reminder for the given emotional state
 */
export function getSimpleReminder(emotionalState: EmotionalState): string {
  const reminders: Record<EmotionalState, string> = {
    anxiety:
      "Allah does not burden a soul beyond its capacity. What you're carrying is within your strength.",
    grief: "Your Lord has not abandoned you. This pain is seen and honored.",
    fear: "Whoever relies upon Allah, He is sufficient for them. You are not alone in this.",
    shame: "Allah's mercy exceeds all sin. The door of return is always open.",
    anger:
      "The strong one is not the one who overcomes others, but the one who controls themselves in anger.",
    loneliness: "He is with you wherever you are. You are never truly alone.",
    doubt: "Allah is near. Closer than you feel right now.",
    despair: "Do not despair of Allah's mercy. Relief is closer than it seems.",
    exhaustion:
      "With hardship comes ease. The most beloved deeds are small and consistent.",
    overwhelm: "Take one step. Allah will meet you where you are.",
    hopelessness:
      "In the remembrance of Allah do hearts find rest. This feeling is not the final truth.",
    guilt:
      "Whoever seeks forgiveness finds Allah forgiving and merciful. Start fresh.",
  };

  return (
    reminders[emotionalState] || "Hearts fluctuate. Return is always possible."
  );
}

/**
 * Get concept application guidance
 */
export function getConceptGuidance(concept: IslamicConcept): string {
  const rule = CONCEPT_RULES.find((r) => r.concept === concept);
  if (!rule) {
    return ISLAMIC_CONCEPTS[concept].supportiveApplication;
  }

  return rule.exampleApplication;
}
