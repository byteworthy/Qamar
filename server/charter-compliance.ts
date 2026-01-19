/**
 * Charter Compliance Validator for Noor CBT
 *
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 *
 * This module enforces the AI and Islamic Safety Charter by validating
 * all AI inputs and outputs against Charter rules.
 */

import {
  detectCrisis,
  detectScrupulosity,
  validateTheologicalSafety,
  CRISIS_RESOURCES,
  SCRUPULOSITY_RESPONSE,
  type CrisisDetectionResult,
} from "./ai-safety";
import {
  TONE_GUIDELINES,
  SPIRITUAL_BYPASSING_INDICATORS,
  type EmotionalState,
  type DistressLevel,
} from "../shared/islamic-framework";

// =============================================================================
// TYPES
// =============================================================================

export type ViolationSeverity = "minor" | "major" | "critical";

export interface ComplianceReport {
  compliant: boolean;
  violations: Violation[];
  severity: "none" | ViolationSeverity;
  actionRequired: string;
  timestamp: Date;
}

export interface Violation {
  category: ViolationCategory;
  rule: string;
  evidence: string;
  severity: ViolationSeverity;
  charterSection: string;
}

export type ViolationCategory =
  | "theological_distortion"
  | "false_promise"
  | "spiritual_bypassing"
  | "unauthorized_ruling"
  | "judgmental_language"
  | "crisis_mishandling"
  | "tone_violation"
  | "content_restriction"
  | "scope_violation";

export interface CharterContext {
  inputText: string;
  outputText: string;
  emotionalState?: EmotionalState;
  distressLevel?: DistressLevel;
  crisisDetected?: CrisisDetectionResult;
  scrupulosityDetected?: boolean;
  conversationContext?: {
    mode: string;
    repetitionDetected?: boolean;
    previousViolations?: number;
  };
}

// =============================================================================
// CHARTER COMPLIANCE VALIDATOR
// =============================================================================

export class CharterCompliance {
  private static readonly CHARTER_VERSION = "1.0";

  /**
   * Comprehensive Charter compliance validation
   */
  static validate(context: CharterContext): ComplianceReport {
    const violations: Violation[] = [];
    const timestamp = new Date();

    // Part 2: Check what AI must NEVER do
    violations.push(...this.checkProhibitedContent(context.outputText));

    // Part 3: Check if AI should have slowed down
    violations.push(...this.checkSlowDownRequirements(context));

    // Part 4: Check if AI should have redirected
    violations.push(...this.checkRedirectionRequirements(context));

    // Part 5: Check if silence would have been preferable
    violations.push(...this.checkSilencePreference(context));

    // Part 6: Check against prohibited content catalog
    violations.push(...this.checkProhibitedCatalog(context.outputText));

    // Part 7: Check tone compliance
    violations.push(...this.checkToneCompliance(context.outputText));

    // Part 8: Check Islamic content usage rules
    violations.push(...this.checkIslamicContentUsage(context));

    // Determine overall severity
    const severity = this.determineSeverity(violations);

    // Determine action required
    const actionRequired = this.determineAction(severity, violations);

    return {
      compliant: violations.length === 0,
      violations,
      severity,
      actionRequired,
      timestamp,
    };
  }

  /**
   * Part 2: Check prohibited content (must NEVER do)
   */
  private static checkProhibitedContent(outputText: string): Violation[] {
    const violations: Violation[] = [];
    const lowerOutput = outputText.toLowerCase();

    // Check for religious rulings (fatwas)
    const fatwaPatterns = [
      { pattern: "this is haram", rule: "No religious rulings" },
      { pattern: "this is halal", rule: "No religious rulings" },
      { pattern: "islam requires you to", rule: "No religious rulings" },
      { pattern: "you must do", rule: "No religious rulings" },
      { pattern: "according to sharia", rule: "No religious rulings" },
    ];

    for (const { pattern, rule } of fatwaPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "unauthorized_ruling",
          rule,
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 2.1: Issue religious rulings",
        });
      }
    }

    // Check for claims about Allah's intent
    const allahIntentPatterns = [
      {
        pattern: "allah is punishing you",
        rule: "No claims about Allah's intent",
      },
      {
        pattern: "allah wants you to suffer",
        rule: "No claims about Allah's intent",
      },
      { pattern: "allah doesn't care", rule: "No claims about Allah's intent" },
      {
        pattern: "this happened because allah is testing",
        rule: "No claims about Allah's intent",
      },
    ];

    for (const { pattern, rule } of allahIntentPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "theological_distortion",
          rule,
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 2.2: Claims about Allah's intent",
        });
      }
    }

    // Check for absolution language
    const absolutionPatterns = [
      "you are forgiven",
      "your sins are washed away",
      "allah has accepted your repentance",
      "you are guaranteed paradise",
    ];

    for (const pattern of absolutionPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "unauthorized_ruling",
          rule: "No absolution language",
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 2.3: Use absolution language",
        });
      }
    }

    // Check for diagnostic language
    const diagnosticPatterns = [
      { pattern: "you have depression", rule: "No diagnoses" },
      { pattern: "this sounds like ocd", rule: "No diagnoses" },
      { pattern: "you might be bipolar", rule: "No diagnoses" },
      { pattern: "you have anxiety disorder", rule: "No diagnoses" },
    ];

    for (const { pattern, rule } of diagnosticPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "scope_violation",
          rule,
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 2.5: Make psychological diagnoses",
        });
      }
    }

    // Check for outcome guarantees
    const guaranteePatterns = [
      "this will definitely work",
      "you will be healed",
      "guaranteed healing",
      "if you do this, your anxiety will go away",
      "you will never struggle again",
    ];

    for (const pattern of guaranteePatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "false_promise",
          rule: "No outcome guarantees",
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 2.8: Guarantee outcomes",
        });
      }
    }

    // Check for minimizing pain
    const minimizingPatterns = [
      { pattern: "it's not that bad", rule: "No minimizing pain" },
      { pattern: "others have it worse", rule: "No minimizing pain" },
      { pattern: "you're overreacting", rule: "No minimizing pain" },
      { pattern: "just get over it", rule: "No minimizing pain" },
    ];

    for (const { pattern, rule } of minimizingPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "tone_violation",
          rule,
          evidence: `Found phrase: "${pattern}"`,
          severity: "major",
          charterSection: "Part 2.9: Minimize or dismiss pain",
        });
      }
    }

    // Check for guilt/shame motivation
    const shamePatterns = [
      "you should feel ashamed",
      "a good muslim wouldn't think this way",
      "you're failing your faith",
      "allah is disappointed in you",
    ];

    for (const pattern of shamePatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "judgmental_language",
          rule: "No guilt or shame as motivation",
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 2.10: Use guilt or shame as motivation",
        });
      }
    }

    return violations;
  }

  /**
   * Part 3: Check if AI should have slowed down
   */
  private static checkSlowDownRequirements(
    context: CharterContext,
  ): Violation[] {
    const violations: Violation[] = [];

    // Check if repetition was detected but not addressed
    if (context.conversationContext?.repetitionDetected) {
      const hasPatternInterruption =
        context.outputText.toLowerCase().includes("notice") ||
        context.outputText.toLowerCase().includes("pattern") ||
        context.outputText.toLowerCase().includes("circling back");

      if (!hasPatternInterruption) {
        violations.push({
          category: "content_restriction",
          rule: "Must slow down when repetition detected",
          evidence: "Repetition detected but no pattern interruption used",
          severity: "minor",
          charterSection: "Part 3.1: Repetition patterns detected",
        });
      }
    }

    // Check if high distress but complex or lengthy language used
    if (
      context.distressLevel === "high" ||
      context.distressLevel === "crisis"
    ) {
      const lowerOutput = context.outputText.toLowerCase();

      // Check for overly complex explanations during high distress
      const hasComplexExplanation =
        lowerOutput.includes("complex") ||
        lowerOutput.includes("philosophical") ||
        lowerOutput.includes("underpinnings") ||
        lowerOutput.includes("metacognitive") ||
        lowerOutput.includes("framework") ||
        lowerOutput.includes("therapeutic");

      if (hasComplexExplanation && context.outputText.length > 200) {
        violations.push({
          category: "content_restriction",
          rule: "Must slow down and simplify language during high distress",
          evidence:
            "Complex psychological terminology used during high distress",
          severity: "major",
          charterSection: "Part 3: Slow Down Requirements - High Distress",
        });
      }

      // Check sentence length
      const sentences = context.outputText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      if (sentences.length > 0) {
        const avgSentenceLength = context.outputText.length / sentences.length;

        if (avgSentenceLength > 100) {
          violations.push({
            category: "content_restriction",
            rule: "Must use shorter sentences in high distress",
            evidence: `Average sentence length: ${avgSentenceLength.toFixed(0)} chars (should be under 100)`,
            severity: "major",
            charterSection: "Part 3.2: Emotional intensity >75/100",
          });
        }
      }
    }

    // Check if scrupulosity detected but content engaged with obsession
    if (context.scrupulosityDetected) {
      const lowerOutput = context.outputText.toLowerCase();
      const engagementPatterns = [
        "let's examine whether",
        "let's check",
        "check if",
        "check whether",
        "make sure",
        "verify that",
        "verify each",
        "review the steps",
        "ensure validity",
        "ensure correct",
        "done correctly",
        "right order",
        "did it right",
        "did it wrong",
      ];

      for (const pattern of engagementPatterns) {
        if (lowerOutput.includes(pattern)) {
          violations.push({
            category: "content_restriction",
            rule: "Must not engage with content of scrupulosity obsession",
            evidence: `Found phrase: "${pattern}"`,
            severity: "critical",
            charterSection: "Part 3.3: Scrupulosity indicators detected",
          });
        }
      }
    }

    return violations;
  }

  /**
   * Part 4: Check if AI should have redirected
   */
  private static checkRedirectionRequirements(
    context: CharterContext,
  ): Violation[] {
    const violations: Violation[] = [];

    // Check if crisis detected but CBT flow continued
    if (
      context.crisisDetected &&
      context.crisisDetected.level === "emergency"
    ) {
      const hasCBTContent =
        context.outputText.toLowerCase().includes("distortion") ||
        context.outputText.toLowerCase().includes("reframe") ||
        context.outputText.toLowerCase().includes("belief");

      if (hasCBTContent) {
        violations.push({
          category: "crisis_mishandling",
          rule: "Must not continue CBT flow after emergency crisis detection",
          evidence: "Crisis detected but CBT content present in output",
          severity: "critical",
          charterSection: "Part 4.1: Emergency-level crisis detected",
        });
      }

      const hasResources =
        context.outputText.includes("988") ||
        context.outputText.toLowerCase().includes("crisis") ||
        context.outputText.toLowerCase().includes("help");

      if (!hasResources) {
        violations.push({
          category: "crisis_mishandling",
          rule: "Must provide crisis resources for emergency",
          evidence: "Emergency crisis detected but no resources provided",
          severity: "critical",
          charterSection: "Part 4.1: Emergency-level crisis detected",
        });
      }
    }

    return violations;
  }

  /**
   * Part 5: Check if silence would have been preferable
   */
  private static checkSilencePreference(context: CharterContext): Violation[] {
    const violations: Violation[] = [];

    // Check if continued after crisis resources
    if (
      context.crisisDetected &&
      context.crisisDetected.level === "emergency"
    ) {
      const outputLength = context.outputText.length;

      // After crisis, output should be minimal (resources + care)
      if (outputLength > 1000) {
        violations.push({
          category: "crisis_mishandling",
          rule: "Must say less after crisis resource provision",
          evidence: `Output length: ${outputLength} chars (should be minimal)`,
          severity: "major",
          charterSection: "Part 5.1: After crisis resource provision",
        });
      }
    }

    return violations;
  }

  /**
   * Part 6: Check against prohibited content catalog
   */
  private static checkProhibitedCatalog(outputText: string): Violation[] {
    const violations: Violation[] = [];
    const lowerOutput = outputText.toLowerCase();

    // Theological distortions
    const theologicalDistortions = [
      "allah doesn't care about you",
      "allah won't forgive this",
      "you're cursed",
      "you're destined to fail",
      "allah is angry at you",
      "unforgivable sin",
    ];

    for (const distortion of theologicalDistortions) {
      if (lowerOutput.includes(distortion)) {
        violations.push({
          category: "theological_distortion",
          rule: "Prohibited theological distortion",
          evidence: `Found phrase: "${distortion}"`,
          severity: "critical",
          charterSection: "Part 6: Theological Distortions",
        });
      }
    }

    // Spiritual bypassing
    const bypassingPatterns = [
      "just pray more and you'll feel better",
      "if you had stronger iman",
      "real muslims don't feel this way",
      "depression is lack of faith",
    ];

    for (const pattern of bypassingPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "spiritual_bypassing",
          rule: "Prohibited spiritual bypassing",
          evidence: `Found phrase: "${pattern}"`,
          severity: "critical",
          charterSection: "Part 6: Spiritual Bypassing",
        });
      }
    }

    return violations;
  }

  /**
   * Part 7: Check tone compliance
   */
  private static checkToneCompliance(outputText: string): Violation[] {
    const violations: Violation[] = [];
    const lowerOutput = outputText.toLowerCase();

    // Check for forbidden phrases from TONE_GUIDELINES.avoid
    for (const forbidden of TONE_GUIDELINES.avoid) {
      if (lowerOutput.includes(forbidden.toLowerCase())) {
        violations.push({
          category: "tone_violation",
          rule: "Forbidden tone phrase used",
          evidence: `Found phrase: "${forbidden}"`,
          severity: "major",
          charterSection: "Part 7: Tone Compliance Rules - Always Avoid",
        });
      }
    }

    // Check for judgmental patterns
    const judgmentalPatterns = [
      "you should feel",
      "you must",
      "you need to",
      "you have to",
    ];

    for (const pattern of judgmentalPatterns) {
      if (lowerOutput.includes(pattern)) {
        violations.push({
          category: "judgmental_language",
          rule: "Judgmental language detected",
          evidence: `Found phrase: "${pattern}"`,
          severity: "minor",
          charterSection: "Part 7: Tone Compliance Rules",
        });
      }
    }

    return violations;
  }

  /**
   * Part 8: Check Islamic content usage rules
   */
  private static checkIslamicContentUsage(
    context: CharterContext,
  ): Violation[] {
    const violations: Violation[] = [];

    // Check for verse stacking (multiple Quranic references)
    const quranReferences = (context.outputText.match(/\d+:\d+/g) || []).length;
    if (quranReferences > 1) {
      violations.push({
        category: "content_restriction",
        rule: "Maximum 1 ayah per response",
        evidence: `Found ${quranReferences} Quranic references`,
        severity: "major",
        charterSection: "Part 8: Quran Usage Rules - Maximum",
      });
    }

    // Check for verse after crisis (except mercy verses in urgent)
    if (
      context.crisisDetected &&
      context.crisisDetected.level === "emergency"
    ) {
      if (quranReferences > 0) {
        violations.push({
          category: "content_restriction",
          rule: "No verses after emergency crisis detection",
          evidence: `Found ${quranReferences} verses in emergency crisis response`,
          severity: "critical",
          charterSection: "Part 8: No Verse After Crisis Rule",
        });
      }
    }

    // Check for multiple hadith
    const hadithIndicators = (
      context.outputText.match(/bukhari|muslim|agreed upon/gi) || []
    ).length;
    if (hadithIndicators > 1) {
      violations.push({
        category: "content_restriction",
        rule: "Maximum 1 hadith per response",
        evidence: `Found ${hadithIndicators} hadith references`,
        severity: "major",
        charterSection: "Part 8: Hadith Usage Rules - Maximum",
      });
    }

    return violations;
  }

  /**
   * Determine overall severity from violations
   */
  private static determineSeverity(
    violations: Violation[],
  ): "none" | "minor" | "major" | "critical" {
    if (violations.length === 0) return "none";

    const hasCritical = violations.some((v) => v.severity === "critical");
    if (hasCritical) return "critical";

    const hasMajor = violations.some((v) => v.severity === "major");
    if (hasMajor) return "major";

    return "minor";
  }

  /**
   * Determine action required based on severity
   */
  private static determineAction(
    severity: "none" | "minor" | "major" | "critical",
    violations: Violation[],
  ): string {
    switch (severity) {
      case "none":
        return "No action required. Output is Charter-compliant.";

      case "minor":
        return "Log violations and monitor. Fix in next iteration.";

      case "major":
        return "Reject output and regenerate. Log for review.";

      case "critical":
        return "CRITICAL: Reject output immediately. Alert system. Manual review required. Do NOT regenerate automatically.";

      default:
        return "Unknown severity. Manual review required.";
    }
  }

  /**
   * Get Charter version
   */
  static getCharterVersion(): string {
    return this.CHARTER_VERSION;
  }

  /**
   * Generate compliance summary for logging
   */
  static generateComplianceSummary(report: ComplianceReport): string {
    if (report.compliant) {
      return `[Charter Compliant] Version ${this.CHARTER_VERSION} - No violations`;
    }

    const violationsByCategory = new Map<ViolationCategory, number>();
    for (const violation of report.violations) {
      violationsByCategory.set(
        violation.category,
        (violationsByCategory.get(violation.category) || 0) + 1,
      );
    }

    const categorySummary = Array.from(violationsByCategory.entries())
      .map(([category, count]) => `${category}: ${count}`)
      .join(", ");

    return `[Charter Violation] Severity: ${report.severity.toUpperCase()} | Violations: ${report.violations.length} | Categories: ${categorySummary} | Action: ${report.actionRequired}`;
  }
}

// =============================================================================
// QUICK VALIDATION HELPERS
// =============================================================================

/**
 * Quick pre-output validation
 */
export function validateOutput(
  outputText: string,
  emotionalState?: EmotionalState,
  distressLevel?: DistressLevel,
  crisisDetected?: CrisisDetectionResult,
): ComplianceReport {
  return CharterCompliance.validate({
    inputText: "",
    outputText,
    emotionalState,
    distressLevel,
    crisisDetected,
  });
}

/**
 * Quick theological safety check
 */
export function quickTheologicalCheck(text: string): {
  safe: boolean;
  issues: string[];
} {
  const context: CharterContext = {
    inputText: "",
    outputText: text,
  };

  const report = CharterCompliance.validate(context);

  const theologicalViolations = report.violations.filter(
    (v) =>
      v.category === "theological_distortion" ||
      v.category === "unauthorized_ruling" ||
      v.category === "spiritual_bypassing",
  );

  return {
    safe: theologicalViolations.length === 0,
    issues: theologicalViolations.map((v) => v.evidence),
  };
}

/**
 * Check if output should be rejected
 */
export function shouldRejectOutput(report: ComplianceReport): boolean {
  return report.severity === "critical" || report.severity === "major";
}
