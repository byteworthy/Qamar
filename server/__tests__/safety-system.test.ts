/**
 * Safety System Test Suite for Noor CBT
 *
 * Tests all safety mechanisms:
 * - Crisis detection
 * - Scrupulosity detection
 * - Theological validation
 * - Charter compliance
 * - Tone compliance
 *
 * Charter Version: 1.0
 */

import { describe, test, expect } from "@jest/globals";
import {
  detectCrisis,
  detectScrupulosity,
  validateTheologicalSafety,
  validateAIOutput,
  type CrisisDetectionResult,
} from "../ai-safety";
import { CharterCompliance, validateOutput } from "../charter-compliance";
import {
  checkToneCompliance,
  isToneCompliant,
} from "../tone-compliance-checker";

// =============================================================================
// CRISIS DETECTION TESTS
// =============================================================================

describe("Crisis Detection System", () => {
  describe("Emergency Level Detection", () => {
    const emergencyInputs = [
      "I want to die",
      "I want to kill myself",
      "I'm going to end my life",
      "everyone would be better off without me and I want to die",
      "I can't take it anymore, I want to kill myself",
    ];

    test.each(emergencyInputs)('detects emergency crisis: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(true);
      expect(result.level).toBe("emergency");
      expect(result.requiresHumanReview).toBe(true);
      expect(result.indicators.length).toBeGreaterThan(0);
    });

    test("emergency crisis requires immediate action", () => {
      const result = detectCrisis("I want to end my life");

      expect(result.recommendedAction).toContain("crisis resources");
      expect(result.recommendedAction).toContain("immediately");
    });
  });

  describe("Urgent Level Detection", () => {
    const urgentInputs = [
      "there's no hope for me",
      "everyone would be better without me",
      "i've given up",
      "what's the point of living",
      "I can't do this anymore",
    ];

    test.each(urgentInputs)('detects urgent crisis: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(true);
      expect(result.level).toBe("urgent");
      expect(result.requiresHumanReview).toBe(true);
    });
  });

  describe("Concern Level Detection", () => {
    const concernInputs = [
      "I feel completely hopeless",
      "I'm utterly worthless",
      "I'll never be good enough",
      "Allah hates me",
      "I'm beyond redemption",
    ];

    test.each(concernInputs)('detects concerning language: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(true);
      expect(result.level).toBe("concern");
      expect(result.requiresHumanReview).toBe(false);
    });
  });

  describe("No Crisis Detection", () => {
    const safeInputs = [
      "I'm feeling anxious about my exam",
      "I struggle with prayer consistency",
      "I feel overwhelmed by my responsibilities",
      "I worry about the future",
    ];

    test.each(safeInputs)('does not detect crisis: "%s"', (input) => {
      const result = detectCrisis(input);

      expect(result.detected).toBe(false);
      expect(result.level).toBe("none");
    });
  });
});

// =============================================================================
// SCRUPULOSITY DETECTION TESTS
// =============================================================================

describe("Scrupulosity Detection System", () => {
  const scrupulosityInputs = [
    "my wudu is never valid",
    "every prayer I make is invalid",
    "I think I've committed shirk",
    "I can't stop repeating my salah",
    "I doubt every intention I make",
    "I'm scared I'm a kafir",
  ];

  test.each(scrupulosityInputs)('detects scrupulosity: "%s"', (input) => {
    const result = detectScrupulosity(input);
    expect(result).toBe(true);
  });

  test("does not detect normal religious struggle", () => {
    const normalStruggles = [
      "I want to be more consistent with prayer",
      "I feel distant from Allah",
      "I struggle with my iman",
      "I want to improve my worship",
    ];

    for (const input of normalStruggles) {
      const result = detectScrupulosity(input);
      expect(result).toBe(false);
    }
  });
});

// =============================================================================
// THEOLOGICAL VALIDATION TESTS
// =============================================================================

describe("Theological Validation System", () => {
  describe("Detects Theological Violations", () => {
    const violationExamples = [
      {
        text: "Allah doesn't care about you",
        violation: "theological distortion",
      },
      {
        text: "Allah is punishing you for your sins",
        violation: "claims about Allah's intent",
      },
      { text: "You're cursed", violation: "theological distortion" },
      { text: "Allah won't forgive this", violation: "theological distortion" },
      {
        text: "Just pray more and you'll feel better",
        violation: "spiritual bypassing",
      },
      {
        text: "If you had stronger iman this wouldn't happen",
        violation: "spiritual bypassing",
      },
      {
        text: "Real Muslims don't feel this way",
        violation: "spiritual bypassing",
      },
      { text: "This is haram", violation: "religious ruling" },
      {
        text: "You must do this according to Sharia",
        violation: "religious ruling",
      },
      { text: "This will definitely work", violation: "false promise" },
      { text: "You will be healed", violation: "false promise" },
    ];

    test.each(violationExamples)(
      'detects: $violation in "$text"',
      ({ text }) => {
        const result = validateTheologicalSafety(text);

        expect(result.safe).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
      },
    );
  });

  describe("Approves Safe Theological Content", () => {
    const safeExamples = [
      "Allah's mercy encompasses all things",
      "What if this thought isn't the whole truth?",
      "Your struggle has meaning",
      "This feeling is understandable",
      "Consider seeking help from a professional",
    ];

    test.each(safeExamples)('approves safe content: "%s"', (text) => {
      const result = validateTheologicalSafety(text);

      expect(result.safe).toBe(true);
      expect(result.violations.length).toBe(0);
    });
  });
});

// =============================================================================
// AI OUTPUT VALIDATION TESTS
// =============================================================================

describe("AI Output Validation System", () => {
  test("rejects output with theological violations", () => {
    const badOutput = "Allah is punishing you. This is haram. Just pray more.";

    const result = validateAIOutput(badOutput, {
      type: "reframe",
      emotionalState: "anxiety",
    });

    expect(result.approved).toBe(false);
    expect(result.severity).toBe("critical");
    expect(result.issues.length).toBeGreaterThan(0);
  });

  test("rejects output with crisis language", () => {
    const badOutput = "You want to die. Let me help you reframe that thought.";

    const result = validateAIOutput(badOutput, {
      type: "analysis",
      emotionalState: "despair",
    });

    expect(result.approved).toBe(false);
    expect(result.severity).toBe("critical");
  });

  test("rejects output with spiritual bypassing", () => {
    const badOutput =
      "Just trust Allah and stop worrying. If you had more faith, you wouldn't feel this way.";

    const result = validateAIOutput(badOutput, {
      type: "reframe",
      emotionalState: "anxiety",
    });

    expect(result.approved).toBe(false);
  });

  test("rejects output with judgmental language", () => {
    const badOutput =
      "You should feel grateful. Real Muslims don't complain. You need to try harder.";

    const result = validateAIOutput(badOutput, {
      type: "analysis",
      emotionalState: "guilt",
    });

    expect(result.approved).toBe(false);
  });

  test("approves compliant output", () => {
    const goodOutput =
      "That sounds really difficult. What you're feeling is understandable given what you're experiencing.";

    const result = validateAIOutput(goodOutput, {
      type: "analysis",
      emotionalState: "anxiety",
    });

    expect(result.approved).toBe(true);
    expect(result.severity).toBe("none");
  });
});

// =============================================================================
// CHARTER COMPLIANCE TESTS
// =============================================================================

describe("Charter Compliance System", () => {
  test("detects violation of Part 2: What AI must NEVER do", () => {
    const output = "You are forgiven. This is haram. You have depression.";

    const report = validateOutput(output);

    expect(report.compliant).toBe(false);
    expect(report.severity).toBe("critical");
    expect(
      report.violations.some((v) => v.category === "unauthorized_ruling"),
    ).toBe(true);
  });

  test("detects lack of slowing down for high distress", () => {
    const context = {
      inputText: "I'm overwhelmed",
      outputText:
        "Let me explain the complex philosophical underpinnings of cognitive distortions and how they relate to metacognitive awareness and the broader therapeutic framework.",
      distressLevel: "high" as const,
    };

    const report = CharterCompliance.validate(context);

    const hasSlowDownViolation = report.violations.some((v) =>
      v.charterSection.includes("Part 3"),
    );
    expect(hasSlowDownViolation).toBe(true);
  });

  test("detects CBT continuation after crisis", () => {
    const crisisResult = detectCrisis("I want to die");
    const output =
      "Let's identify the cognitive distortion in that thought and work on reframing it.";

    const report = validateOutput(output, undefined, undefined, crisisResult);

    expect(report.compliant).toBe(false);
    expect(
      report.violations.some((v) => v.category === "crisis_mishandling"),
    ).toBe(true);
    expect(report.severity).toBe("critical");
  });

  test("detects verse stacking violation", () => {
    const output =
      "Remember Quran 2:286 and also 94:5-6 and 65:3 all together.";

    const report = validateOutput(output);

    const hasVerseStacking = report.violations.some((v) =>
      v.rule.includes("Maximum 1 ayah"),
    );
    expect(hasVerseStacking).toBe(true);
  });

  test("approves compliant output", () => {
    const output =
      "I hear you. That sounds really heavy. This feeling is real and it deserves attention.";

    const report = validateOutput(output);

    expect(report.compliant).toBe(true);
    expect(report.severity).toBe("none");
  });
});

// =============================================================================
// TONE COMPLIANCE TESTS
// =============================================================================

describe("Tone Compliance System", () => {
  test("detects forbidden phrases", () => {
    const text = "You should feel grateful. Others have it worse.";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(false);
    expect(result.score).toBeLessThan(70);
    expect(result.issues.some((i) => i.type === "forbidden_phrase")).toBe(true);
  });

  test("detects judgmental language", () => {
    const text =
      "You should do this. You must try harder. You need to pray more.";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(false);
    expect(result.issues.some((i) => i.type === "judgmental_language")).toBe(
      true,
    );
  });

  test("detects spiritual bypassing", () => {
    const text =
      "Just trust Allah and stop worrying. If you had more faith, you wouldn't feel this way.";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(false);
    expect(result.issues.some((i) => i.type === "spiritual_bypassing")).toBe(
      true,
    );
    expect(result.issues.some((i) => i.severity === "critical")).toBe(true);
  });

  test("detects dismissive language", () => {
    const text = "It's not that bad. You're overreacting.";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(false);
    expect(result.issues.some((i) => i.type === "dismissive_language")).toBe(
      true,
    );
  });

  test("detects shame-based language", () => {
    const text = "You should feel ashamed. You're failing your faith.";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(false);
    expect(result.issues.some((i) => i.type === "shame_based")).toBe(true);
    expect(result.emotionalTone).toBe("harsh");
  });

  test("detects lack of validation before reframing", () => {
    const text =
      "What if this thought isn't true? Consider another perspective.";

    const result = checkToneCompliance(text);

    expect(result.issues.some((i) => i.type === "lack_of_validation")).toBe(
      true,
    );
  });

  test("approves validating, merciful tone", () => {
    const text =
      "I hear you. That sounds really difficult. What you're feeling makes sense given what you're experiencing.";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(true);
    expect(result.score).toBe(100);
    expect(result.emotionalTone).toBe("gentle");
  });

  test("approves validation before reframing", () => {
    const text =
      "That sounds heavy. I hear you. What if there's another way to see this?";

    const result = checkToneCompliance(text);

    expect(result.compliant).toBe(true);
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("Full Safety Pipeline Integration", () => {
  test("handles emergency crisis correctly", () => {
    const userInput = "I want to kill myself";

    // Step 1: Crisis detection
    const crisisResult = detectCrisis(userInput);
    expect(crisisResult.level).toBe("emergency");

    // Step 2: Should NOT continue with CBT
    const inappropriateOutput =
      "Let's work on reframing that thought using CBT techniques.";
    const validation = validateOutput(
      inappropriateOutput,
      undefined,
      undefined,
      crisisResult,
    );

    expect(validation.compliant).toBe(false);
    expect(validation.severity).toBe("critical");

    // Step 3: Appropriate response includes resources
    const appropriateOutput =
      "You're in a lot of pain right now. Please reach out: 988 Suicide & Crisis Lifeline (call or text 988) for 24/7 support.";
    const appropriateValidation = validateOutput(
      appropriateOutput,
      undefined,
      undefined,
      crisisResult,
    );

    expect(appropriateValidation.compliant).toBe(true);
  });

  test("handles scrupulosity correctly", () => {
    const userInput = "my wudu is never valid, I need to repeat it constantly";

    // Step 1: Scrupulosity detection
    const isScrupulosity = detectScrupulosity(userInput);
    expect(isScrupulosity).toBe(true);

    // Step 2: Should NOT engage with content of obsession
    const badOutput =
      "Let's check if your wudu is valid. Make sure you did each step correctly.";
    const report = CharterCompliance.validate({
      inputText: userInput,
      outputText: badOutput,
      scrupulosityDetected: true,
    });

    expect(
      report.violations.some((v) =>
        v.rule.includes("not engage with content of scrupulosity"),
      ),
    ).toBe(true);
  });

  test("complete safety validation flow", () => {
    const userInput = "I always fail at everything";
    const aiOutput =
      "I hear you. That sounds really heavy. That thought feels true right now. What if it's not the whole story?";

    // Full validation
    const crisisCheck = detectCrisis(userInput);
    const scrupulosityCheck = detectScrupulosity(userInput);
    const outputValidation = validateAIOutput(aiOutput, {
      type: "analysis",
      emotionalState: "despair",
    });
    const charterCheck = validateOutput(
      aiOutput,
      "despair",
      "moderate",
      crisisCheck,
    );
    const toneCheck = checkToneCompliance(aiOutput);

    expect(crisisCheck.level).not.toBe("emergency");
    expect(scrupulosityCheck).toBe(false);
    expect(outputValidation.approved).toBe(true);
    expect(charterCheck.compliant).toBe(true);
    expect(toneCheck.compliant).toBe(true);
  });
});

// =============================================================================
// REGRESSION TESTS (Prevent Known Issues)
// =============================================================================

describe("Regression Tests", () => {
  test("never generates absolution language", () => {
    const forbiddenPhrases = [
      "you are forgiven",
      "your sins are washed away",
      "allah has accepted your repentance",
      "you are guaranteed paradise",
    ];

    for (const phrase of forbiddenPhrases) {
      const result = validateTheologicalSafety(phrase);
      expect(result.safe).toBe(false);
    }
  });

  test("never generates diagnostic language", () => {
    const diagnosticPhrases = [
      "you have depression",
      "this sounds like OCD",
      "you might be bipolar",
      "you have anxiety disorder",
    ];

    for (const phrase of diagnosticPhrases) {
      const validation = validateOutput(phrase);
      expect(
        validation.violations.some((v) => v.category === "scope_violation"),
      ).toBe(true);
    }
  });

  test('never bypasses with "just trust Allah"', () => {
    const result = checkToneCompliance("Just trust Allah and stop worrying");

    expect(result.compliant).toBe(false);
    expect(
      result.issues.some(
        (i) => i.type === "spiritual_bypassing" && i.severity === "critical",
      ),
    ).toBe(true);
  });

  test("always validates before reframing", () => {
    const badOutput =
      "What if this thought isn't true? Consider this perspective instead.";
    const result = checkToneCompliance(badOutput);

    expect(result.issues.some((i) => i.type === "lack_of_validation")).toBe(
      true,
    );

    const goodOutput =
      "I hear you. That sounds difficult. What if there's another way to see this?";
    const goodResult = checkToneCompliance(goodOutput);

    expect(goodResult.compliant).toBe(true);
  });

  test("never stacks Quranic verses", () => {
    const badOutput = "Remember 2:286 and 94:5-6 and 65:3";
    const result = validateOutput(badOutput);

    expect(
      result.violations.some((v) => v.rule.includes("Maximum 1 ayah")),
    ).toBe(true);
  });

  test("no verses after emergency crisis", () => {
    const crisis = detectCrisis("I want to die");
    const outputWithVerse = "Call 988. Remember Allah says in 2:286...";

    const result = validateOutput(outputWithVerse, undefined, "crisis", crisis);

    expect(
      result.violations.some((v) =>
        v.rule.includes("No verses after emergency"),
      ),
    ).toBe(true);
  });
});
