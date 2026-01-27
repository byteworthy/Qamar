/**
 * Tone Compliance Checker Test Suite for Noor
 *
 * Tests detailed tone analysis and compliance checking to ensure
 * all AI responses maintain therapeutic, merciful, and non-judgmental language.
 *
 * Charter Version: 1.0
 */

import { describe, test, expect } from "@jest/globals";
import {
  ToneComplianceChecker,
  checkToneCompliance,
  isToneCompliant,
  getMinimumToneScore,
  type ToneComplianceResult,
  type ToneIssue,
} from "../tone-compliance-checker";

// =============================================================================
// BASIC COMPLIANCE TESTS
// =============================================================================

describe("Tone Compliance Checker", () => {
  describe("Basic Compliance", () => {
    test("passes compliant text with perfect score", () => {
      const result = checkToneCompliance(
        "I hear you. That sounds really difficult. What's the hardest part about this?",
      );

      expect(result.compliant).toBe(true);
      expect(result.score).toBe(100);
      expect(result.issues).toHaveLength(0);
      expect(result.emotionalTone).toBe("gentle");
    });

    test("detects non-compliant text", () => {
      const result = checkToneCompliance(
        "You should just trust Allah and stop worrying so much.",
      );

      expect(result.compliant).toBe(false);
      expect(result.score).toBeLessThan(100);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Quick Check Function", () => {
    test("returns true for compliant text", () => {
      expect(
        isToneCompliant("I hear you. That makes sense given what you're facing."),
      ).toBe(true);
    });

    test("returns false for non-compliant text", () => {
      expect(isToneCompliant("You're overreacting. It's not that bad.")).toBe(
        false,
      );
    });
  });

  describe("Minimum Score", () => {
    test("returns expected threshold", () => {
      expect(getMinimumToneScore()).toBe(70);
    });
  });
});

// =============================================================================
// FORBIDDEN PHRASES TESTS
// =============================================================================

describe("Forbidden Phrases Detection", () => {
  test("detects 'just trust Allah' as critical", () => {
    const result = checkToneCompliance("Just trust Allah and it will be fine");

    const issue = result.issues.find((i) => i.type === "forbidden_phrase");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("critical");
    expect(result.score).toBeLessThan(80);
  });

  test("detects 'real Muslims' phrasing", () => {
    const result = checkToneCompliance("Real Muslims don't struggle with this");

    // Should detect forbidden phrase or judgmental language
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.compliant).toBe(false);
  });

  test("detects 'you're overreacting'", () => {
    const result = checkToneCompliance("You're overreacting to this situation");

    const issue = result.issues.find((i) => i.type === "forbidden_phrase");
    expect(issue).toBeDefined();
  });

  test("provides recommendations for forbidden phrases", () => {
    const result = checkToneCompliance("Just trust Allah");

    const issue = result.issues.find((i) => i.type === "forbidden_phrase");
    expect(issue?.recommendation).toBeDefined();
    expect(issue?.recommendation.length).toBeGreaterThan(0);
  });
});

// =============================================================================
// JUDGMENTAL LANGUAGE TESTS
// =============================================================================

describe("Judgmental Language Detection", () => {
  test("detects 'you should' phrasing", () => {
    const result = checkToneCompliance("You should pray more often");

    const issue = result.issues.find((i) => i.type === "judgmental_language");
    expect(issue).toBeDefined();
    expect(issue?.phrase).toContain("you should");
  });

  test("detects 'you must' commands", () => {
    const result = checkToneCompliance("You must stop thinking this way");

    const issue = result.issues.find((i) => i.type === "judgmental_language");
    expect(issue).toBeDefined();
  });

  test("detects 'you need to' directives", () => {
    const result = checkToneCompliance("You need to be more patient");

    const issue = result.issues.find((i) => i.type === "judgmental_language");
    expect(issue).toBeDefined();
  });

  test("detects 'you have to' pressure", () => {
    const result = checkToneCompliance("You have to change your mindset");

    const issue = result.issues.find((i) => i.type === "judgmental_language");
    expect(issue).toBeDefined();
  });

  test("detects multiple judgmental phrases", () => {
    const result = checkToneCompliance(
      "You should try harder and you must be consistent",
    );

    const issues = result.issues.filter(
      (i) => i.type === "judgmental_language",
    );
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });

  test("provides softer alternatives", () => {
    const result = checkToneCompliance("You should do this");

    const issue = result.issues.find((i) => i.type === "judgmental_language");
    expect(issue?.recommendation).toContain("might");
  });
});

// =============================================================================
// SPIRITUAL BYPASSING TESTS
// =============================================================================

describe("Spiritual Bypassing Detection", () => {
  test("detects 'just pray more' bypassing", () => {
    const result = checkToneCompliance("Just pray more and you'll feel better");

    const issue = result.issues.find((i) => i.type === "spiritual_bypassing");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("critical");
  });

  test("detects 'if you had more faith' shaming", () => {
    const result = checkToneCompliance(
      "If you had more faith, this wouldn't be hard",
    );

    const issue = result.issues.find((i) => i.type === "spiritual_bypassing");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("critical");
  });

  test("detects 'you should be grateful' minimizing", () => {
    const result = checkToneCompliance(
      "You should be grateful for what you have",
    );

    const issue = result.issues.find((i) => i.type === "spiritual_bypassing");
    expect(issue).toBeDefined();
  });

  test("provides context-aware recommendations", () => {
    const result = checkToneCompliance("Just pray more");

    const issue = result.issues.find((i) => i.type === "spiritual_bypassing");
    expect(issue?.recommendation).toContain("Acknowledge");
  });
});

// =============================================================================
// DISMISSIVE LANGUAGE TESTS
// =============================================================================

describe("Dismissive Language Detection", () => {
  test("detects 'it's not that bad'", () => {
    const result = checkToneCompliance("It's not that bad, really");

    const issue = result.issues.find((i) => i.type === "dismissive_language");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("major");
  });

  test("detects 'others have it worse'", () => {
    const result = checkToneCompliance(
      "Others have it worse than you do",
    );

    const issue = result.issues.find((i) => i.type === "dismissive_language");
    expect(issue).toBeDefined();
  });

  test("detects 'just get over it'", () => {
    const result = checkToneCompliance("Just get over it already");

    const issue = result.issues.find((i) => i.type === "dismissive_language");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("critical");
  });

  test("detects 'you shouldn't feel'", () => {
    const result = checkToneCompliance("You shouldn't feel that way");

    const issue = result.issues.find((i) => i.type === "dismissive_language");
    expect(issue).toBeDefined();
  });

  test("detects 'at least' minimizing", () => {
    const result = checkToneCompliance("At least you have your health");

    const issue = result.issues.find((i) => i.type === "dismissive_language");
    expect(issue).toBeDefined();
  });
});

// =============================================================================
// SHAME-BASED LANGUAGE TESTS
// =============================================================================

describe("Shame-Based Language Detection", () => {
  test("detects explicit shame language", () => {
    const result = checkToneCompliance("You should feel ashamed");

    const issue = result.issues.find((i) => i.type === "shame_based");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("critical");
  });

  test("detects failure framing", () => {
    const result = checkToneCompliance("You're failing at this");

    const issue = result.issues.find((i) => i.type === "shame_based");
    expect(issue).toBeDefined();
  });

  test("detects religious shame", () => {
    const result = checkToneCompliance("You're a bad Muslim");

    const issue = result.issues.find((i) => i.type === "shame_based");
    expect(issue).toBeDefined();
  });

  test("detects divine disappointment framing", () => {
    const result = checkToneCompliance("Allah is disappointed in you");

    const issue = result.issues.find((i) => i.type === "shame_based");
    expect(issue).toBeDefined();
  });

  test("provides growth-oriented recommendations", () => {
    const result = checkToneCompliance("You're failing");

    const issue = result.issues.find((i) => i.type === "shame_based");
    expect(issue?.recommendation).toContain("growth");
  });
});

// =============================================================================
// ABSOLUTIST LANGUAGE TESTS
// =============================================================================

describe("Absolutist Language Detection", () => {
  test("detects 'you always' statements", () => {
    const result = checkToneCompliance("You always do this");

    const issue = result.issues.find((i) => i.type === "absolutist_language");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("minor");
  });

  test("detects 'you never' statements", () => {
    const result = checkToneCompliance("You never try hard enough");

    const issue = result.issues.find((i) => i.type === "absolutist_language");
    expect(issue).toBeDefined();
  });

  test("detects 'everyone' comparisons", () => {
    const result = checkToneCompliance("Everyone else can do this");

    const issue = result.issues.find((i) => i.type === "absolutist_language");
    expect(issue).toBeDefined();
  });

  test("detects 'no one' isolation", () => {
    const result = checkToneCompliance("No one understands");

    const issue = result.issues.find((i) => i.type === "absolutist_language");
    expect(issue).toBeDefined();
  });

  test("provides context in recommendations", () => {
    const result = checkToneCompliance("You always fail");

    const issue = result.issues.find((i) => i.type === "absolutist_language");
    expect(issue?.recommendation).toContain("Context:");
  });
});

// =============================================================================
// VALIDATION PRESENCE TESTS
// =============================================================================

describe("Validation Presence Detection", () => {
  test("detects reframing without validation", () => {
    const result = checkToneCompliance(
      "What if you're looking at this the wrong way?",
    );

    const issue = result.issues.find((i) => i.type === "lack_of_validation");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("major");
  });

  test("passes when validation is present before reframe", () => {
    const result = checkToneCompliance(
      "I hear you. That sounds difficult. What if there's another way to see this?",
    );

    const issue = result.issues.find((i) => i.type === "lack_of_validation");
    expect(issue).toBeUndefined();
  });

  test("detects 'consider that' without validation", () => {
    const result = checkToneCompliance(
      "Consider that you might be wrong about this",
    );

    const issue = result.issues.find((i) => i.type === "lack_of_validation");
    expect(issue).toBeDefined();
  });

  test("provides acknowledgment-first guidance", () => {
    const result = checkToneCompliance("What if you're overthinking?");

    const issue = result.issues.find((i) => i.type === "lack_of_validation");
    expect(issue?.recommendation).toContain("validate");
  });
});

// =============================================================================
// PRESSURE LANGUAGE TESTS
// =============================================================================

describe("Pressure Language Detection", () => {
  test("detects 'try harder' pressure", () => {
    const result = checkToneCompliance("You need to try harder");

    const issue = result.issues.find((i) => i.type === "pressure_language");
    expect(issue).toBeDefined();
    expect(issue?.severity).toBe("minor");
  });

  test("detects 'don't give up' pressure", () => {
    const result = checkToneCompliance("Don't give up now");

    const issue = result.issues.find((i) => i.type === "pressure_language");
    expect(issue).toBeDefined();
  });

  test("detects 'stay consistent' pressure", () => {
    const result = checkToneCompliance("You need to stay consistent");

    const issue = result.issues.find((i) => i.type === "pressure_language");
    expect(issue).toBeDefined();
  });

  test("provides invitation-based recommendations", () => {
    const result = checkToneCompliance("Try harder");

    const issue = result.issues.find((i) => i.type === "pressure_language");
    expect(issue?.recommendation).toContain("invitation");
  });
});

// =============================================================================
// EMOTIONAL TONE DETERMINATION TESTS
// =============================================================================

describe("Emotional Tone Determination", () => {
  test("returns gentle for compliant text", () => {
    const result = checkToneCompliance("I hear you. That makes sense.");

    expect(result.emotionalTone).toBe("gentle");
  });

  test("returns harsh for critical issues", () => {
    const result = checkToneCompliance("You should feel ashamed of yourself");

    expect(result.emotionalTone).toBe("harsh");
  });

  test("returns dismissive for dismissive language", () => {
    const result = checkToneCompliance("It's not that bad, get over it");

    expect(result.emotionalTone).toBe("dismissive");
  });

  test("returns balanced for minor issues", () => {
    const result = checkToneCompliance("You always worry too much");

    expect(result.emotionalTone).toBe("balanced");
  });
});

// =============================================================================
// COMPLIANCE SCORE TESTS
// =============================================================================

describe("Compliance Score Calculation", () => {
  test("returns 100 for perfect compliance", () => {
    const result = checkToneCompliance("I hear you. That sounds difficult.");

    expect(result.score).toBe(100);
  });

  test("deducts points for minor issues", () => {
    const result = checkToneCompliance("You always do this");

    expect(result.score).toBeLessThan(100);
    expect(result.score).toBeGreaterThanOrEqual(90);
  });

  test("deducts more points for major issues", () => {
    const result = checkToneCompliance("It's not that bad");

    expect(result.score).toBeLessThan(90);
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  test("deducts most points for critical issues", () => {
    const result = checkToneCompliance("You should feel ashamed");

    expect(result.score).toBeLessThan(80);
  });

  test("never goes below zero", () => {
    const result = checkToneCompliance(
      "You should feel ashamed. You're failing. Just trust Allah. You're overreacting. It's not that bad. Others have it worse.",
    );

    expect(result.score).toBeGreaterThanOrEqual(0);
  });
});

// =============================================================================
// SUGGESTIONS GENERATION TESTS
// =============================================================================

describe("Suggestions Generation", () => {
  test("provides positive feedback for compliant text", () => {
    const result = checkToneCompliance("I hear you. That makes sense.");

    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0]).toContain("compliant");
  });

  test("suggests validation for validation issues", () => {
    const result = checkToneCompliance("What if you're wrong?");

    const hasValidationSuggestion = result.suggestions.some((s) =>
      s.includes("validation"),
    );
    expect(hasValidationSuggestion).toBe(true);
  });

  test("suggests invitational language for judgmental issues", () => {
    const result = checkToneCompliance("You should do this");

    const hasInvitationalSuggestion = result.suggestions.some((s) =>
      s.includes("invitational"),
    );
    expect(hasInvitationalSuggestion).toBe(true);
  });

  test("suggests validation before spiritual concepts", () => {
    const result = checkToneCompliance("Just pray more");

    const hasBypassingSuggestion = result.suggestions.some(
      (s) => s.includes("Validate") && s.includes("pain"),
    );
    expect(hasBypassingSuggestion).toBe(true);
  });

  test("suggests acknowledgment for dismissive issues", () => {
    const result = checkToneCompliance("It's not that bad");

    const hasDismissiveSuggestion = result.suggestions.some((s) =>
      s.includes("minimize"),
    );
    expect(hasDismissiveSuggestion).toBe(true);
  });

  test("suggests growth framing for shame issues", () => {
    const result = checkToneCompliance("You're failing");

    const hasGrowthSuggestion = result.suggestions.some((s) =>
      s.includes("growth"),
    );
    expect(hasGrowthSuggestion).toBe(true);
  });
});

// =============================================================================
// SUMMARY GENERATION TESTS
// =============================================================================

describe("Summary Generation", () => {
  test("generates compliant summary", () => {
    const result = checkToneCompliance("I hear you. That's difficult.");
    const summary = ToneComplianceChecker.getSummary(result);

    expect(summary).toContain("Tone Compliant");
    expect(summary).toContain("100");
    expect(summary).toContain("gentle");
  });

  test("generates issues summary", () => {
    const result = checkToneCompliance("You should just get over it");
    const summary = ToneComplianceChecker.getSummary(result);

    expect(summary).toContain("Tone Issues");
    expect(summary).toContain("Score:");
    expect(summary).toContain("Issues:");
  });

  test("includes issue types in summary", () => {
    const result = checkToneCompliance("You should try harder");
    const summary = ToneComplianceChecker.getSummary(result);

    expect(summary).toContain("Types:");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("Integration Tests", () => {
  test("handles complex text with multiple issue types", () => {
    const result = checkToneCompliance(
      "You should just trust Allah more. It's not that bad. You always overreact. Real Muslims don't struggle like this.",
    );

    expect(result.compliant).toBe(false);
    expect(result.score).toBeLessThan(50);
    expect(result.issues.length).toBeGreaterThan(3);
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.emotionalTone).toBe("harsh");
  });

  test("passes therapeutic language", () => {
    const result = checkToneCompliance(
      "I hear you. That sounds really difficult. What's the hardest part about this right now? Your feelings are real and valid.",
    );

    expect(result.compliant).toBe(true);
    expect(result.score).toBe(100);
    expect(result.emotionalTone).toBe("gentle");
  });

  test("handles mixed tone appropriately", () => {
    const result = checkToneCompliance(
      "I understand this is hard. You might consider a different approach. You always seem to struggle with this.",
    );

    expect(result.compliant).toBe(false);
    expect(result.score).toBeGreaterThan(70);
    expect(result.emotionalTone).toBe("balanced");
  });
});
