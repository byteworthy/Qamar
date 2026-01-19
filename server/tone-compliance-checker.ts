/**
 * Tone Compliance Checker for Noor CBT
 *
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 *
 * This module provides detailed tone analysis and compliance checking
 * to ensure all AI responses maintain therapeutic, merciful, and
 * non-judgmental language.
 */

import {
  TONE_GUIDELINES,
  SPIRITUAL_BYPASSING_INDICATORS,
} from "../shared/islamic-framework";

// =============================================================================
// TYPES
// =============================================================================

export interface ToneComplianceResult {
  compliant: boolean;
  score: number; // 0-100, where 100 is perfect compliance
  issues: ToneIssue[];
  suggestions: string[];
  emotionalTone: "gentle" | "balanced" | "harsh" | "dismissive";
}

export interface ToneIssue {
  type: ToneIssueType;
  phrase: string;
  location: number; // character position
  severity: "minor" | "major" | "critical";
  recommendation: string;
}

export type ToneIssueType =
  | "forbidden_phrase"
  | "judgmental_language"
  | "spiritual_bypassing"
  | "dismissive_language"
  | "shame_based"
  | "absolutist_language"
  | "lack_of_validation"
  | "pressure_language"
  | "comparison_to_others";

// =============================================================================
// TONE COMPLIANCE CHECKER
// =============================================================================

export class ToneComplianceChecker {
  /**
   * Main tone compliance check
   */
  static check(text: string): ToneComplianceResult {
    const issues: ToneIssue[] = [];

    // Check for forbidden phrases
    issues.push(...this.checkForbiddenPhrases(text));

    // Check for judgmental language
    issues.push(...this.checkJudgmentalLanguage(text));

    // Check for spiritual bypassing
    issues.push(...this.checkSpiritualBypassing(text));

    // Check for dismissive language
    issues.push(...this.checkDismissiveLanguage(text));

    // Check for shame-based language
    issues.push(...this.checkShameBasedLanguage(text));

    // Check for absolutist language
    issues.push(...this.checkAbsolutistLanguage(text));

    // Check for validation presence
    issues.push(...this.checkValidationPresence(text));

    // Check for pressure language
    issues.push(...this.checkPressureLanguage(text));

    // Determine emotional tone
    const emotionalTone = this.determineEmotionalTone(text, issues);

    // Calculate compliance score
    const score = this.calculateComplianceScore(issues);

    // Generate suggestions
    const suggestions = this.generateSuggestions(issues);

    return {
      compliant: issues.length === 0,
      score,
      issues,
      suggestions,
      emotionalTone,
    };
  }

  /**
   * Check for forbidden phrases from TONE_GUIDELINES
   */
  private static checkForbiddenPhrases(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    for (const forbidden of TONE_GUIDELINES.avoid) {
      const index = lowerText.indexOf(forbidden.toLowerCase());
      if (index !== -1) {
        issues.push({
          type: "forbidden_phrase",
          phrase: forbidden,
          location: index,
          severity: this.determineForbiddenPhraseSeverity(forbidden),
          recommendation: `Replace with validating language. Consider: "${this.suggestAlternative(forbidden)}"`,
        });
      }
    }

    return issues;
  }

  /**
   * Check for judgmental language patterns
   */
  private static checkJudgmentalLanguage(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    const judgmentalPatterns = [
      { pattern: "you should", replacement: "you might consider" },
      { pattern: "you must", replacement: "it could be helpful to" },
      { pattern: "you need to", replacement: "you might find it helpful to" },
      { pattern: "you have to", replacement: "you could try" },
      { pattern: "you ought to", replacement: "perhaps" },
      {
        pattern: "you're supposed to",
        replacement: "sometimes people find it helpful to",
      },
    ];

    for (const { pattern, replacement } of judgmentalPatterns) {
      let index = lowerText.indexOf(pattern);
      while (index !== -1) {
        issues.push({
          type: "judgmental_language",
          phrase: pattern,
          location: index,
          severity: "minor",
          recommendation: `Consider softer language: "${replacement}"`,
        });
        index = lowerText.indexOf(pattern, index + 1);
      }
    }

    return issues;
  }

  /**
   * Check for spiritual bypassing patterns
   */
  private static checkSpiritualBypassing(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    const bypassingPatterns = [
      {
        pattern: "just pray more",
        recommendation:
          "Acknowledge the struggle first, then offer prayer as one tool among many",
      },
      {
        pattern: "just trust allah",
        recommendation:
          "Validate the difficulty, then frame tawakkul as something built through practice",
      },
      {
        pattern: "if you had more faith",
        recommendation:
          "Never tie struggle to faith level. Faith includes times of difficulty",
      },
      {
        pattern: "real muslims",
        recommendation: 'Avoid defining "real Muslims." All Muslims struggle',
      },
      {
        pattern: "you should be grateful",
        recommendation:
          "Validate pain first. Gratitude comes after acknowledgment, not instead of it",
      },
    ];

    for (const { pattern, recommendation } of bypassingPatterns) {
      const index = lowerText.indexOf(pattern);
      if (index !== -1) {
        issues.push({
          type: "spiritual_bypassing",
          phrase: pattern,
          location: index,
          severity: "critical",
          recommendation,
        });
      }
    }

    return issues;
  }

  /**
   * Check for dismissive language
   */
  private static checkDismissiveLanguage(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    const dismissivePatterns = [
      { pattern: "it's not that bad", severity: "major" as const },
      { pattern: "others have it worse", severity: "major" as const },
      { pattern: "you're overreacting", severity: "major" as const },
      { pattern: "just get over it", severity: "critical" as const },
      { pattern: "it could be worse", severity: "major" as const },
      { pattern: "at least", severity: "minor" as const }, // Context-dependent
      { pattern: "you shouldn't feel", severity: "major" as const },
      { pattern: "stop being", severity: "major" as const },
    ];

    for (const { pattern, severity } of dismissivePatterns) {
      const index = lowerText.indexOf(pattern);
      if (index !== -1) {
        issues.push({
          type: "dismissive_language",
          phrase: pattern,
          location: index,
          severity,
          recommendation:
            "Validate the feeling before offering any perspective shift",
        });
      }
    }

    return issues;
  }

  /**
   * Check for shame-based language
   */
  private static checkShameBasedLanguage(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    const shamePatterns = [
      "you should feel ashamed",
      "you're failing",
      "you're not good enough",
      "you're a bad muslim",
      "allah is disappointed",
      "you're letting allah down",
      "you should know better",
      "what's wrong with you",
    ];

    for (const pattern of shamePatterns) {
      const index = lowerText.indexOf(pattern);
      if (index !== -1) {
        issues.push({
          type: "shame_based",
          phrase: pattern,
          location: index,
          severity: "critical",
          recommendation:
            "Never use shame as motivation. Emphasize growth, not failure",
        });
      }
    }

    return issues;
  }

  /**
   * Check for absolutist language
   */
  private static checkAbsolutistLanguage(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    const absolutistPatterns = [
      { pattern: "you always", context: "negative" },
      { pattern: "you never", context: "negative" },
      { pattern: "everyone", context: "comparison" },
      { pattern: "no one", context: "isolation" },
      { pattern: "this will definitely", context: "guarantee" },
      { pattern: "this will never", context: "hopelessness" },
    ];

    for (const { pattern, context } of absolutistPatterns) {
      const index = lowerText.indexOf(pattern);
      if (index !== -1) {
        issues.push({
          type: "absolutist_language",
          phrase: pattern,
          location: index,
          severity: "minor",
          recommendation: `Use softer language. Absolutist statements can feel invalidating. Context: ${context}`,
        });
      }
    }

    return issues;
  }

  /**
   * Check if validation is present (acknowledgment-first rule)
   */
  private static checkValidationPresence(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    // Check if text starts with reframing before validation
    const reframingStarts = [
      "what if",
      "consider that",
      "another way to see",
      "let's reframe",
      "the truth is",
    ];

    const validationPhrases = [
      "i hear",
      "that sounds",
      "i can feel",
      "that makes sense",
      "i understand",
      "that's real",
      "this is difficult",
      "that's heavy",
    ];

    const startsWithReframing = reframingStarts.some((start) =>
      lowerText.trim().startsWith(start),
    );

    const hasValidation = validationPhrases.some((phrase) =>
      lowerText.includes(phrase),
    );

    if (startsWithReframing && !hasValidation) {
      issues.push({
        type: "lack_of_validation",
        phrase: "reframing without validation",
        location: 0,
        severity: "major",
        recommendation:
          "Always validate emotion before offering reframes. Acknowledgment must come first.",
      });
    }

    return issues;
  }

  /**
   * Check for pressure language
   */
  private static checkPressureLanguage(text: string): ToneIssue[] {
    const issues: ToneIssue[] = [];
    const lowerText = text.toLowerCase();

    const pressurePatterns = [
      "you need to push",
      "try harder",
      "don't give up",
      "keep going",
      "you can do better",
      "don't break your streak",
      "stay consistent",
    ];

    for (const pattern of pressurePatterns) {
      const index = lowerText.indexOf(pattern);
      if (index !== -1) {
        issues.push({
          type: "pressure_language",
          phrase: pattern,
          location: index,
          severity: "minor",
          recommendation:
            "Avoid pressure. Frame as invitation, not demand. Small steps without guilt.",
        });
      }
    }

    return issues;
  }

  /**
   * Determine severity for forbidden phrases
   */
  private static determineForbiddenPhraseSeverity(
    phrase: string,
  ): "minor" | "major" | "critical" {
    const criticalPhrases = [
      "just trust allah",
      "real muslims",
      "you're overreacting",
    ];

    if (criticalPhrases.some((p) => phrase.toLowerCase().includes(p))) {
      return "critical";
    }

    return "major";
  }

  /**
   * Suggest alternative for forbidden phrase
   */
  private static suggestAlternative(forbidden: string): string {
    const alternatives: Record<string, string> = {
      "you should feel...": "It's understandable to feel...",
      "just trust allah":
        "Tawakkul is built through practice, especially when it feels hard",
      "this is easy if you...": "This takes practice, and that's okay",
      "real muslims would...": "Muslims experience this in different ways",
      "you're overreacting": "This feeling is real and deserves attention",
      "everything happens for a reason":
        "This is difficult, and you don't have to make meaning of it right now",
      "at least...": "And yet this is still hard for you",
      "others have it worse":
        "Your struggle is legitimate, regardless of others' experiences",
      "just make dua":
        "Dua is one tool. What else might support you right now?",
      "you need to have more faith":
        "Faith includes times of doubt and difficulty",
    };

    return (
      alternatives[forbidden.toLowerCase()] || "Use more validating language"
    );
  }

  /**
   * Determine emotional tone
   */
  private static determineEmotionalTone(
    text: string,
    issues: ToneIssue[],
  ): "gentle" | "balanced" | "harsh" | "dismissive" {
    const hasCriticalIssues = issues.some((i) => i.severity === "critical");
    const hasDismissive = issues.some((i) => i.type === "dismissive_language");
    const hasShame = issues.some((i) => i.type === "shame_based");

    if (hasCriticalIssues || hasShame) return "harsh";
    if (hasDismissive) return "dismissive";
    if (issues.length > 5) return "harsh";
    if (issues.length === 0) return "gentle";
    return "balanced";
  }

  /**
   * Calculate compliance score (0-100)
   */
  private static calculateComplianceScore(issues: ToneIssue[]): number {
    if (issues.length === 0) return 100;

    let deductions = 0;

    for (const issue of issues) {
      switch (issue.severity) {
        case "critical":
          deductions += 25;
          break;
        case "major":
          deductions += 15;
          break;
        case "minor":
          deductions += 5;
          break;
      }
    }

    return Math.max(0, 100 - deductions);
  }

  /**
   * Generate suggestions for improvement
   */
  private static generateSuggestions(issues: ToneIssue[]): string[] {
    if (issues.length === 0) {
      return [
        "Tone is compliant. Continue using validating, merciful language.",
      ];
    }

    const suggestions: string[] = [];

    const hasValidationIssue = issues.some(
      (i) => i.type === "lack_of_validation",
    );
    if (hasValidationIssue) {
      suggestions.push(
        "Start with validation before offering perspectives. Acknowledgment must come first.",
      );
    }

    const hasJudgmental = issues.some((i) => i.type === "judgmental_language");
    if (hasJudgmental) {
      suggestions.push(
        'Replace directive language ("you should") with invitational language ("you might").',
      );
    }

    const hasBypassing = issues.some((i) => i.type === "spiritual_bypassing");
    if (hasBypassing) {
      suggestions.push(
        "Avoid using Islam to bypass emotional work. Validate pain before offering spiritual concepts.",
      );
    }

    const hasDismissive = issues.some((i) => i.type === "dismissive_language");
    if (hasDismissive) {
      suggestions.push(
        "Never minimize pain. Acknowledge difficulty before offering perspective.",
      );
    }

    const hasShame = issues.some((i) => i.type === "shame_based");
    if (hasShame) {
      suggestions.push(
        "Remove all shame-based language. Use growth-oriented framing instead.",
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Review specific issue recommendations for improvement.",
      );
    }

    return suggestions;
  }

  /**
   * Quick tone check (returns simple pass/fail)
   */
  static quickCheck(text: string): boolean {
    const result = this.check(text);
    return result.score >= 70; // Threshold for acceptable tone
  }

  /**
   * Get tone summary for logging
   */
  static getSummary(result: ToneComplianceResult): string {
    if (result.compliant) {
      return `[Tone Compliant] Score: ${result.score}/100 | Tone: ${result.emotionalTone}`;
    }

    const issueTypes = Array.from(
      new Set(result.issues.map((i) => i.type)),
    ).join(", ");
    return `[Tone Issues] Score: ${result.score}/100 | Issues: ${result.issues.length} | Types: ${issueTypes} | Tone: ${result.emotionalTone}`;
  }
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Validate tone compliance (main entry point)
 */
export function checkToneCompliance(text: string): ToneComplianceResult {
  return ToneComplianceChecker.check(text);
}

/**
 * Quick yes/no tone check
 */
export function isToneCompliant(text: string): boolean {
  return ToneComplianceChecker.quickCheck(text);
}

/**
 * Get recommended tone score threshold
 */
export function getMinimumToneScore(): number {
  return 70; // Minimum acceptable score
}
