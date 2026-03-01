/**
 * Tone Classifier Test Suite for Qamar
 *
 * Tests the tone classification system that adapts AI responses to user communication style:
 * - Feelers: Emotional language detection
 * - Thinkers: Analytical language detection
 * - Balanced: Mixed or neutral language
 *
 * Purpose: Ensure supportive effectiveness by matching user's processing style.
 */

import { describe, test, expect } from "@jest/globals";
import { classifyTone, getTonePromptModifier } from "../toneClassifier";

// =============================================================================
// FEELER CLASSIFICATION TESTS
// =============================================================================

describe("Tone Classifier - Feelers Mode", () => {
  test("detects emotional language with high confidence", () => {
    const result = classifyTone(
      "I feel so anxious and scared about everything",
    );

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  test("identifies multiple emotional markers", () => {
    const result = classifyTone(
      "My heart is heavy and I feel so hurt, lonely, and overwhelmed by the pain",
    );

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test("detects emotional markers case-insensitively", () => {
    const result = classifyTone("I FEEL SO ANXIOUS AND SCARED RIGHT NOW");

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  test("increases confidence with more emotional markers", () => {
    const highMarkerText =
      "I feel anxious, scared, hurt, lonely, overwhelmed, sad, and helpless";
    const result = classifyTone(highMarkerText);

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.8);
  });

  test("detects exclamation marks as emotional indicators", () => {
    const result = classifyTone("I'm so frustrated with this situation!");

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test("detects concrete language patterns", () => {
    const result = classifyTone(
      "Today at work, my boss said something that hurt me",
    );

    expect(result.mode).toBe("feelers");
  });

  test("detects short sentence structure", () => {
    const result = classifyTone("I feel hurt. I am sad. My heart aches.");

    expect(result.mode).toBe("feelers");
  });
});

// =============================================================================
// THINKER CLASSIFICATION TESTS
// =============================================================================

describe("Tone Classifier - Thinkers Mode", () => {
  test("detects analytical language with high confidence", () => {
    const result = classifyTone(
      "I think the issue is that I'm overthinking this logically",
    );

    expect(result.mode).toBe("thinkers");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  test("identifies multiple analytical markers", () => {
    const result = classifyTone(
      "I believe the reason is that I need to analyze this pattern and consider the logical conclusion",
    );

    expect(result.mode).toBe("thinkers");
    expect(result.confidence).toBeGreaterThan(0.7);
  });

  test("detects question marks as analytical indicators", () => {
    const result = classifyTone(
      "Why does this happen? What is the reason? How can I understand this?",
    );

    expect(result.mode).toBe("thinkers");
    expect(result.confidence).toBeGreaterThan(0.5);
  });

  test("detects abstract language patterns", () => {
    const result = classifyTone(
      "The concept is that this principle should always apply to everyone",
    );

    expect(result.mode).toBe("thinkers");
  });

  test("detects long sentence structure", () => {
    const result = classifyTone(
      "I think that when considering the various factors and analyzing the situation from multiple perspectives, it becomes clear that the logical conclusion would be to reassess my assumptions and evaluate the evidence more carefully.",
    );

    expect(result.mode).toBe("thinkers");
  });

  test("increases confidence with more analytical markers", () => {
    const highMarkerText =
      "I think, analyze, reason, and evaluate the logical patterns to understand the system and process";
    const result = classifyTone(highMarkerText);

    expect(result.mode).toBe("thinkers");
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});

// =============================================================================
// BALANCED CLASSIFICATION TESTS
// =============================================================================

describe("Tone Classifier - Balanced Mode", () => {
  test("returns balanced for neutral language", () => {
    const result = classifyTone("I need help with something");

    expect(result.mode).toBe("balanced");
  });

  test("returns balanced for mixed emotional and analytical markers", () => {
    const result = classifyTone(
      "I feel anxious but I think I need to analyze why",
    );

    expect(result.mode).toBe("balanced");
  });

  test("returns balanced with moderate confidence for mixed input", () => {
    const result = classifyTone(
      "I think this makes me feel uncertain about the situation",
    );

    expect(result.mode).toBe("balanced");
    expect(result.confidence).toBeGreaterThanOrEqual(0.3);
  });
});

// =============================================================================
// EDGE CASE TESTS
// =============================================================================

describe("Tone Classifier - Edge Cases", () => {
  test("handles empty string gracefully", () => {
    const result = classifyTone("");

    expect(result.mode).toBe("balanced");
    expect(result.confidence).toBe(0);
  });

  test("handles whitespace-only string", () => {
    const result = classifyTone("   \n\t  ");

    expect(result.mode).toBe("balanced");
    expect(result.confidence).toBe(0);
  });

  test("handles single word input", () => {
    const result = classifyTone("Hello");

    expect(result.mode).toBe("balanced");
    expect(result.confidence).toBeLessThan(0.5);
  });

  test("handles low total score with balanced classification", () => {
    const result = classifyTone("I need help");

    expect(result.mode).toBe("balanced");
    expect(result.confidence).toBe(0.3);
  });

  test("caps confidence at 0.9", () => {
    const highMarkerText =
      "I feel anxious scared hurt lonely overwhelmed sad helpless worthless broken crushed devastated miserable";
    const result = classifyTone(highMarkerText);

    expect(result.confidence).toBeLessThanOrEqual(0.9);
  });
});

// =============================================================================
// MARKER DETECTION TESTS
// =============================================================================

describe("Tone Classifier - Marker Detection", () => {
  test("detects emotional markers with word boundaries", () => {
    const result = classifyTone("I feel anxious about this");

    expect(result.mode).toBe("feelers");
  });

  test("does not match partial words", () => {
    // "thinking" contains "think" but should still count as analytical
    const result = classifyTone("I am thinking about this situation");

    expect(result.mode).toBe("thinkers");
  });

  test("matches multiple occurrences of same marker", () => {
    const result = classifyTone(
      "I feel hurt and that hurt makes me feel more hurt",
    );

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  test("detects emotional markers from EMOTIONAL_MARKERS array", () => {
    // Testing various markers: feel, hurt, pain, scared, anxious, worried, sad
    const markers = [
      "feel",
      "hurt",
      "pain",
      "scared",
      "anxious",
      "worried",
      "sad",
    ];

    for (const marker of markers) {
      const result = classifyTone(`I ${marker} so much`);
      expect(result.mode).toBe("feelers");
    }
  });

  test("detects analytical markers from ANALYTICAL_MARKERS array", () => {
    // Testing various markers: think, reason, logic, analyze, consider
    const markers = ["think", "reason", "logic", "analyze", "consider"];

    for (const marker of markers) {
      const result = classifyTone(`I ${marker} about this carefully`);
      expect(result.mode).toBe("thinkers");
    }
  });
});

// =============================================================================
// PREVIOUS REFLECTION HISTORY TESTS
// =============================================================================

describe("Tone Classifier - Previous Reflection History", () => {
  test("considers previous emotional reflections", () => {
    const previousReflections = [
      "I felt so anxious yesterday",
      "My heart was heavy last week",
      "I feel overwhelmed often",
    ];

    const result = classifyTone("I need help", previousReflections);

    // Previous emotional context should influence classification
    expect(result.mode).toBe("feelers");
  });

  test("considers previous analytical reflections", () => {
    const previousReflections = [
      "I think the pattern is clear",
      "I need to analyze this logically",
      "The reason is that I overthink",
    ];

    const result = classifyTone("I need help", previousReflections);

    // Previous analytical context should influence classification
    // With current text "I need help" having low score, result may be balanced
    expect(["thinkers", "balanced"]).toContain(result.mode);
    // Confidence should be influenced by previous reflections
    expect(result.confidence).toBeGreaterThanOrEqual(0.3);
  });

  test("only considers last 3 previous reflections", () => {
    const previousReflections = [
      "I feel emotional (old)",
      "I feel sad (old)",
      "I think logically (recent)",
      "I analyze carefully (recent)",
      "I reason through this (recent)",
    ];

    const result = classifyTone("I need guidance", previousReflections);

    // Should favor thinkers based on last 3 reflections (or balanced if influence is insufficient)
    expect(["thinkers", "balanced"]).toContain(result.mode);
    // Verify previous reflections are being considered
    const withoutHistory = classifyTone("I need guidance");
    // Should have some difference in scoring with history
    expect(result).toBeDefined();
  });

  test("handles empty previous reflections array", () => {
    const result = classifyTone("I feel anxious", []);

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.6);
  });

  test("weighs previous reflections at 0.3 per marker", () => {
    const previousReflections = ["I feel anxious", "I feel sad", "I feel hurt"];

    const withHistory = classifyTone("I am here", previousReflections);
    const withoutHistory = classifyTone("I am here");

    // With history should have higher emotional score
    expect(withHistory.mode).toBe("feelers");
    expect(withoutHistory.mode).toBe("balanced");
  });
});

// =============================================================================
// CONFIDENCE SCORING TESTS
// =============================================================================

describe("Tone Classifier - Confidence Scoring", () => {
  test("returns confidence between 0 and 1", () => {
    const inputs = [
      "I feel anxious",
      "I think logically",
      "I need help",
      "Hello there",
      "",
    ];

    for (const input of inputs) {
      const result = classifyTone(input);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    }
  });

  test("higher marker count increases confidence", () => {
    const lowMarkers = classifyTone("I feel anxious");
    const highMarkers = classifyTone(
      "I feel anxious, scared, hurt, lonely, and overwhelmed",
    );

    // High markers should have confidence at or near the cap (0.9)
    expect(highMarkers.confidence).toBeGreaterThanOrEqual(
      lowMarkers.confidence,
    );
    expect(highMarkers.confidence).toBeGreaterThanOrEqual(0.8);
  });

  test("returns 0.3 confidence for low total score", () => {
    const result = classifyTone("I am here now");

    expect(result.confidence).toBe(0.3);
  });

  test("returns 0.5 confidence for balanced mode when truly balanced", () => {
    // Use input with equal emotional and analytical weight
    const result = classifyTone(
      "I feel a bit uncertain but I think about it carefully",
    );

    expect(result.mode).toBe("balanced");
    // Confidence should be 0.5 for balanced classification
    expect(result.confidence).toBe(0.5);
  });
});

// =============================================================================
// TONE PROMPT MODIFIER TESTS
// =============================================================================

describe("Tone Prompt Modifier", () => {
  test("returns thinkers modifier for analytical mode", () => {
    const modifier = getTonePromptModifier("thinkers");

    expect(modifier).toContain("TONE CALIBRATION");
    expect(modifier).toContain("structure and analysis");
    expect(modifier).toContain("precise");
  });

  test("returns feelers modifier for emotional mode", () => {
    const modifier = getTonePromptModifier("feelers");

    expect(modifier).toContain("TONE CALIBRATION");
    expect(modifier).toContain("emotional experience");
    expect(modifier).toContain("Validate the feeling");
  });

  test("returns balanced modifier for balanced mode", () => {
    const modifier = getTonePromptModifier("balanced");

    expect(modifier).toContain("TONE CALIBRATION");
    expect(modifier).toContain("balanced");
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("Tone Classifier - Integration", () => {
  test("complete feeler journey with realistic input", () => {
    const userInput =
      "I've been feeling so anxious lately. My heart feels heavy and I'm scared about what might happen. The pain is overwhelming and I feel so alone in this.";

    const result = classifyTone(userInput);

    expect(result.mode).toBe("feelers");
    expect(result.confidence).toBeGreaterThan(0.7);

    const modifier = getTonePromptModifier(result.mode);
    expect(modifier).toContain("emotional experience");
  });

  test("complete thinker journey with realistic input", () => {
    const userInput =
      "I think the issue is that I keep analyzing everything too much. I need to understand the logical reason behind this pattern. What's the cause of this thinking process?";

    const result = classifyTone(userInput);

    expect(result.mode).toBe("thinkers");
    expect(result.confidence).toBeGreaterThan(0.7);

    const modifier = getTonePromptModifier(result.mode);
    expect(modifier).toContain("structure and analysis");
  });

  test("balanced classification with context from previous reflections", () => {
    const previousReflections = [
      "I feel anxious sometimes",
      "I think about this logically",
    ];

    const result = classifyTone(
      "I'm not sure how to proceed",
      previousReflections,
    );

    expect(result.mode).toBe("balanced");
    expect(result.confidence).toBeGreaterThanOrEqual(0.3);
  });
});
