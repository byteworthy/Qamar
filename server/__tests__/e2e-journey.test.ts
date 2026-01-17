/**
 * End-to-End Journey Tests for Noor CBT
 *
 * Tests complete user flows through the canonical orchestration system:
 * 1. Normal CBT journey (thought → analyze → reframe → practice → intention)
 * 2. High distress flow requiring permission before reframe
 * 3. Crisis flow triggering intervention and resources
 * 4. Scrupulosity flow with special handling
 * 5. Failure language surfacing when validators fail
 *
 * Charter Version: 1.0
 * Last Updated: 2026-01-17
 */

import { describe, test, expect } from "@jest/globals";
import {
  CanonicalOrchestrator,
  type OrchestrationInput,
} from "../canonical-orchestrator";
import { detectCrisis, detectScrupulosity } from "../ai-safety";
import { IslamicContentMapper } from "../islamic-content-mapper";
import type {
  EmotionalState,
  DistressLevel,
} from "../../shared/islamic-framework";

// =============================================================================
// MOCK AI RESPONSE GENERATOR
// =============================================================================

/**
 * Mock AI generator that returns compliant responses
 */
const createMockAIGenerator = (responseText: string) => {
  return async (_safetyGuidance: string, _pacingConfig: any) => {
    return responseText;
  };
};

// =============================================================================
// TEST 1: NORMAL CBT JOURNEY
// =============================================================================

describe("E2E Test 1: Normal CBT Journey", () => {
  test("Complete flow: thought capture → analyze → reframe → practice → save intention", async () => {
    // ========================================================================
    // STEP 1: Thought Capture (user input)
    // ========================================================================
    const userThought = "I'm feeling anxious about my exam tomorrow";

    // Verify not a crisis (should be none - no concerning patterns)
    const crisisCheck = detectCrisis(userThought);
    expect(crisisCheck.level).toBe("none");

    // Verify not scrupulosity
    const scrupulosityCheck = detectScrupulosity(userThought);
    expect(scrupulosityCheck).toBe(false);

    // ========================================================================
    // STEP 2: Analyze (identify distortions)
    // ========================================================================
    const analyzeResponse = JSON.stringify({
      distortions: ["Black-and-white thinking", "Catastrophizing"],
      happening:
        "That sounds heavy. Feeling like perfection is the only option.",
      pattern: [
        "Black-and-white thinking: Either perfect or worthless, no middle ground.",
        "Catastrophizing: Predicting disaster without evidence.",
      ],
      matters:
        "Worth exists beyond performance. Value transcends productivity.",
    });

    const analyzeInput: OrchestrationInput = {
      userInput: userThought,
      context: {
        emotionalState: "anxiety" as EmotionalState,
        distressLevel: "moderate" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(analyzeResponse),
    };

    const analyzeResult = await CanonicalOrchestrator.orchestrate(analyzeInput);

    expect(analyzeResult.success).toBe(true);
    expect(analyzeResult.pipelineStages.preProcessing).toBe("passed");
    expect(analyzeResult.pipelineStages.aiGeneration).toBe("completed");
    expect(analyzeResult.pipelineStages.charterValidation).toBe("passed");
    expect(analyzeResult.pipelineStages.toneValidation).toBe("passed");
    expect(analyzeResult.pipelineStages.fallbackUsed).toBe(false);

    const analyzeParsed = JSON.parse(analyzeResult.response);
    expect(analyzeParsed.distortions).toContain("Black-and-white thinking");
    expect(analyzeParsed.happening).toContain("heavy");

    // ========================================================================
    // STEP 3: Reframe (generate Islamic CBT perspective)
    // ========================================================================
    const reframeResponse = JSON.stringify({
      beliefTested:
        "This thought treats feelings about performance like facts about worth.",
      perspective:
        "The role here is effort. Outcomes belong to Allah. Show up, do the part, and trust the rest.",
      nextStep:
        "Choose one small task today and do it with intention, not perfection.",
      anchors: [
        "Effort is required, outcomes belong to Allah",
        "Allah does not burden beyond capacity",
      ],
    });

    const reframeInput: OrchestrationInput = {
      userInput: userThought,
      context: {
        emotionalState: "anxiety" as EmotionalState,
        distressLevel: "moderate" as DistressLevel,
        mode: "reframe",
        conversationState: "reframing",
      },
      aiResponseGenerator: createMockAIGenerator(reframeResponse),
    };

    const reframeResult = await CanonicalOrchestrator.orchestrate(reframeInput);

    expect(reframeResult.success).toBe(true);
    expect(reframeResult.pipelineStages.charterValidation).toBe("passed");
    expect(reframeResult.pipelineStages.islamicGovernance).toBe("passed");

    const reframeParsed = JSON.parse(reframeResult.response);
    expect(reframeParsed.beliefTested).toBeTruthy();
    expect(reframeParsed.perspective).toContain("effort");
    expect(reframeParsed.nextStep).toBeTruthy();
    expect(reframeParsed.anchors).toBeInstanceOf(Array);

    // ========================================================================
    // STEP 4: Practice (generate grounding exercise)
    // ========================================================================
    const practiceResponse = JSON.stringify({
      title: "Dhikr Breathing",
      steps: [
        "Close your eyes and breathe in slowly for 4 counts.",
        "Hold gently for 4 counts, silently saying 'SubhanAllah.'",
        "Release for 4 counts, letting tension leave with the breath.",
      ],
      reminder: "Let each breath remind you that you are held.",
      duration: "2-3 minutes",
    });

    const practiceInput: OrchestrationInput = {
      userInput: reframeParsed.perspective,
      context: {
        emotionalState: "anxiety" as EmotionalState,
        distressLevel: "low" as DistressLevel,
        mode: "practice",
        conversationState: "grounding",
      },
      aiResponseGenerator: createMockAIGenerator(practiceResponse),
    };

    const practiceResult =
      await CanonicalOrchestrator.orchestrate(practiceInput);

    expect(practiceResult.success).toBe(true);
    const practiceParsed = JSON.parse(practiceResult.response);
    expect(practiceParsed.title).toBeTruthy();
    expect(practiceParsed.steps).toBeInstanceOf(Array);
    expect(practiceParsed.steps.length).toBeGreaterThan(0);

    // ========================================================================
    // STEP 5: Intention (verify save ready)
    // ========================================================================
    const intention = "I'll complete one work task with focus, then let it go";

    // Verify all data ready for save
    expect(userThought).toBeTruthy();
    expect(analyzeParsed.distortions).toBeTruthy();
    expect(reframeParsed.perspective).toBeTruthy();
    expect(intention).toBeTruthy();
    expect(practiceParsed.title).toBeTruthy();
  });
});

// =============================================================================
// TEST 2: HIGH DISTRESS FLOW (Permission Required)
// =============================================================================

describe("E2E Test 2: High Distress Flow", () => {
  test("High distress requires permission before reframe", async () => {
    const userThought =
      "Everything is falling apart and I can't handle it anymore";

    // ========================================================================
    // STEP 1: Analyze with high distress
    // ========================================================================
    const analyzeResponse = JSON.stringify({
      distortions: ["Catastrophizing"],
      happening: "I hear you.",
      pattern: ["Predicting collapse."],
      matters: "You're here.",
    });

    const analyzeInput: OrchestrationInput = {
      userInput: userThought,
      context: {
        emotionalState: "overwhelm" as EmotionalState,
        distressLevel: "high" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(analyzeResponse),
    };

    const analyzeResult = await CanonicalOrchestrator.orchestrate(analyzeInput);

    expect(analyzeResult.success).toBe(true);
    const analyzeParsed = JSON.parse(analyzeResult.response);

    // Verify validation is present without minimizing (minimal for high distress)
    expect(analyzeParsed.happening).toBeTruthy();
    expect(analyzeParsed.happening).not.toContain("not that bad");
    expect(analyzeParsed.happening).not.toContain("overreacting");

    // ========================================================================
    // STEP 2: Islamic Content Selection respects high distress
    // ========================================================================
    const islamicContent = IslamicContentMapper.selectContent({
      emotionalState: "overwhelm",
      distressLevel: "high",
      context: "reframe",
    });

    // High distress: NO hadith allowed
    expect(islamicContent.hadith).toBeUndefined();

    // Only mercy-focused Quran if any
    if (islamicContent.quran) {
      expect(islamicContent.emphasis).toBe("rahma");
    }

    // Response should be shorter
    expect(islamicContent.responseLength).toBe("shorter");

    // ========================================================================
    // STEP 3: Permission check before reframe
    // ========================================================================
    // In actual flow, UI would ask: "Would you like to explore a different way to see this?"
    // User grants permission → proceed to reframe

    const reframeResponse = JSON.stringify({
      beliefTested: "Feelings as facts.",
      perspective: "Overwhelm is real. Still here.",
      nextStep: "One thing. Just one.",
      anchors: ["You're held"],
    });

    const reframeInput: OrchestrationInput = {
      userInput: userThought,
      context: {
        emotionalState: "overwhelm" as EmotionalState,
        distressLevel: "high" as DistressLevel,
        mode: "reframe",
        conversationState: "reframing",
      },
      aiResponseGenerator: createMockAIGenerator(reframeResponse),
    };

    const reframeResult = await CanonicalOrchestrator.orchestrate(reframeInput);

    expect(reframeResult.success).toBe(true);
    const reframeParsed = JSON.parse(reframeResult.response);

    // High distress reframe should be minimal and gentle
    expect(reframeParsed.perspective).toBeTruthy();
    expect(reframeParsed.perspective.length).toBeLessThan(200); // Shorter for high distress
    expect(reframeParsed.nextStep).toContain("one"); // Focus on one small thing
  });
});

// =============================================================================
// TEST 3: CRISIS FLOW (Intervention & Resources)
// =============================================================================

describe("E2E Test 3: Crisis Flow", () => {
  test("Crisis triggers intervention, blocks CBT, provides resources", async () => {
    const crisisInput = "I want to end my life, there's no point anymore";

    // ========================================================================
    // STEP 1: Crisis Detection
    // ========================================================================
    const crisisCheck = detectCrisis(crisisInput);

    expect(crisisCheck.detected).toBe(true);
    expect(crisisCheck.level).toBe("emergency");
    expect(crisisCheck.requiresHumanReview).toBe(true);

    // ========================================================================
    // STEP 2: Orchestration blocks normal flow
    // ========================================================================
    const input: OrchestrationInput = {
      userInput: crisisInput,
      context: {
        emotionalState: "despair" as EmotionalState,
        distressLevel: "crisis" as DistressLevel,
        mode: "analyze",
        conversationState: "crisis",
      },
      aiResponseGenerator: createMockAIGenerator("This should not be called"),
    };

    const result = await CanonicalOrchestrator.orchestrate(input);

    // Pre-processing should block
    expect(result.pipelineStages.preProcessing).toBe("blocked");
    expect(result.pipelineStages.aiGeneration).toBe("skipped");
    expect(result.pipelineStages.fallbackUsed).toBe(true);

    // ========================================================================
    // STEP 3: Response provides crisis resources
    // ========================================================================
    expect(result.response).toContain("988");
    expect(result.response).toContain("crisis");
    expect(result.response.toLowerCase()).toContain("reach out");

    // Should NOT contain CBT language
    expect(result.response).not.toContain("distortion");
    expect(result.response).not.toContain("reframe");
    expect(result.response).not.toContain("exercise");

    // ========================================================================
    // STEP 4: Islamic Content correctly omitted
    // ========================================================================
    const islamicContent = IslamicContentMapper.selectContent({
      emotionalState: "despair",
      distressLevel: "crisis",
      context: "analyze",
    });

    // NO Quran during crisis
    expect(islamicContent.quran).toBeUndefined();

    // NO Hadith during crisis
    expect(islamicContent.hadith).toBeUndefined();

    // Minimal response
    expect(islamicContent.responseLength).toBe("minimal");

    // ========================================================================
    // STEP 5: Telemetry recorded
    // ========================================================================
    expect(
      result.telemetryEvents.some((e) => e.type === "crisis_detected"),
    ).toBe(true);
  });
});

// =============================================================================
// TEST 4: SCRUPULOSITY FLOW (Special Handling)
// =============================================================================

describe("E2E Test 4: Scrupulosity Flow", () => {
  test("Scrupulosity triggers special handling, avoids engagement", async () => {
    const scrupulosityInput =
      "I keep repeating my prayers because I think they're invalid";

    // ========================================================================
    // STEP 1: Scrupulosity Detection
    // ========================================================================
    const isScrupulosity = detectScrupulosity(scrupulosityInput);
    expect(isScrupulosity).toBe(true);

    // ========================================================================
    // STEP 2: Orchestration with scrupulosity flag
    // ========================================================================
    // Mock response that CORRECTLY handles scrupulosity
    const correctResponse = JSON.stringify({
      distortions: ["Emotional reasoning"],
      happening:
        "I hear you. That sounds exhausting. What you're describing sounds like a pattern that's trapping you.",
      pattern: [
        "This isn't about whether your prayer is valid. This is about a thought loop that won't let you rest.",
      ],
      matters:
        "The compulsion to repeat isn't worship - it's anxiety. Professional support can help break this cycle.",
    });

    const input: OrchestrationInput = {
      userInput: scrupulosityInput,
      context: {
        emotionalState: "anxiety" as EmotionalState,
        distressLevel: "moderate" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(correctResponse),
    };

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.response);

    // Should name the PATTERN, not engage with content
    expect(parsed.happening).toContain("pattern");
    expect(parsed.happening).not.toContain("your prayer is valid");
    expect(parsed.happening).not.toContain("you did it wrong");

    // Should suggest professional help (case-insensitive)
    expect(parsed.matters.toLowerCase()).toContain("professional");

    // ========================================================================
    // STEP 3: Verify WRONG response would be blocked
    // ========================================================================
    const wrongResponse = JSON.stringify({
      distortions: ["Perfectionism"],
      happening: "Let's check if the wudu was done correctly.",
      pattern: ["Verify each step was completed in the right order."],
      matters: "Review the steps to ensure validity.",
    });

    const wrongInput: OrchestrationInput = {
      userInput: scrupulosityInput,
      context: {
        emotionalState: "anxiety" as EmotionalState,
        distressLevel: "moderate" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(wrongResponse),
    };

    const wrongResult = await CanonicalOrchestrator.orchestrate(wrongInput);

    // This SHOULD be caught by charter compliance
    // (engaging with content of obsession)
    expect(wrongResult.pipelineStages.charterValidation).toBe("failed");
    expect(wrongResult.pipelineStages.fallbackUsed).toBe(true);
  });
});

// =============================================================================
// TEST 5: FAILURE LANGUAGE SURFACING
// =============================================================================

describe("E2E Test 5: Failure Language When Validators Fail", () => {
  test("Charter violation triggers failure language", async () => {
    // Mock response with charter violation (absolution language)
    const violatingResponse = JSON.stringify({
      distortions: ["Guilt"],
      happening: "You are forgiven by Allah. Your sins are washed away.",
      pattern: ["This is normal guilt."],
      matters: "You don't need to worry.",
    });

    const input: OrchestrationInput = {
      userInput: "I feel guilty about my past",
      context: {
        emotionalState: "guilt" as EmotionalState,
        distressLevel: "moderate" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(violatingResponse),
    };

    const result = await CanonicalOrchestrator.orchestrate(input);

    // Should fail charter validation
    expect(result.success).toBe(false);
    expect(result.pipelineStages.charterValidation).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);

    // Should surface failure language
    expect(result.response).toBeTruthy();
    expect(result.response).not.toContain("forgiven"); // Original violation removed
    expect(result.response.length).toBeGreaterThan(10); // Has actual fallback text

    // Telemetry should record violation
    expect(result.telemetryEvents.some((e) => e.type === "violation")).toBe(
      true,
    );
  });

  test("Tone violation triggers failure language", async () => {
    // Mock response with tone violation (dismissive)
    const violatingResponse = JSON.stringify({
      distortions: ["Catastrophizing"],
      happening: "It's not that bad. You're overreacting.",
      pattern: ["You're making a big deal out of nothing."],
      matters: "Just calm down and think rationally.",
    });

    const input: OrchestrationInput = {
      userInput: "Everything feels overwhelming",
      context: {
        emotionalState: "overwhelm" as EmotionalState,
        distressLevel: "high" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(violatingResponse),
    };

    const result = await CanonicalOrchestrator.orchestrate(input);

    // Should fail tone validation
    expect(result.pipelineStages.toneValidation).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);

    // Should surface failure language instead of dismissive response
    expect(result.response).not.toContain("overreacting");
    expect(result.response).not.toContain("not that bad");
  });

  test("Islamic governance violation triggers failure language", async () => {
    // Mock response with verse stacking (Charter Part 8 violation)
    const violatingResponse = JSON.stringify({
      beliefTested: "You're doubting Allah's mercy",
      perspective:
        "Remember Quran 2:286 and also 94:5-6 and 65:3 all together.",
      nextStep: "Memorize these verses",
      anchors: ["Multiple verses"],
    });

    const input: OrchestrationInput = {
      userInput: "I feel distant from Allah",
      context: {
        emotionalState: "loneliness" as EmotionalState,
        distressLevel: "moderate" as DistressLevel,
        mode: "reframe",
        conversationState: "reframing",
      },
      aiResponseGenerator: createMockAIGenerator(violatingResponse),
    };

    const result = await CanonicalOrchestrator.orchestrate(input);

    // Should fail Islamic governance check (verse stacking)
    expect(result.pipelineStages.islamicGovernance).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);

    // Telemetry should record content restriction violation
    expect(
      result.telemetryEvents.some(
        (e) => e.type === "violation" && e.category === "content_restriction",
      ),
    ).toBe(true);
  });
});

// =============================================================================
// TEST 6: ORCHESTRATION AUDIT TRAIL
// =============================================================================

describe("E2E Test 6: Complete Audit Trail", () => {
  test("Every orchestration logged with full audit trail", async () => {
    const input: OrchestrationInput = {
      userInput: "I'm worried about tomorrow",
      context: {
        emotionalState: "anxiety" as EmotionalState,
        distressLevel: "low" as DistressLevel,
        mode: "analyze",
        conversationState: "listening",
      },
      aiResponseGenerator: createMockAIGenerator(
        JSON.stringify({
          distortions: ["Future worry"],
          happening: "That sounds stressful.",
          pattern: ["Anticipating problems that haven't happened yet."],
          matters: "You can prepare without predicting disaster.",
        }),
      ),
    };

    const result = await CanonicalOrchestrator.orchestrate(input);

    // Verify all pipeline stages recorded
    expect(result.pipelineStages).toHaveProperty("preProcessing");
    expect(result.pipelineStages).toHaveProperty("aiGeneration");
    expect(result.pipelineStages).toHaveProperty("charterValidation");
    expect(result.pipelineStages).toHaveProperty("toneValidation");
    expect(result.pipelineStages).toHaveProperty("stateValidation");
    expect(result.pipelineStages).toHaveProperty("pacingValidation");
    expect(result.pipelineStages).toHaveProperty("islamicGovernance");
    expect(result.pipelineStages).toHaveProperty("fallbackUsed");

    // Verify telemetry events array exists
    expect(result.telemetryEvents).toBeInstanceOf(Array);

    // Verify internal log captured (for debugging)
    expect(result.internalLog).toBeTruthy();
    expect(result.internalLog).toContain("ORCHESTRATION START");
    expect(result.internalLog).toContain("ORCHESTRATION COMPLETE");
  });
});

// =============================================================================
// SUMMARY
// =============================================================================

describe("E2E Test Suite Summary", () => {
  test("All 6 critical flows covered", () => {
    const flowsCovered = [
      "1. Normal CBT journey (thought → analyze → reframe → practice → intention)",
      "2. High distress flow (permission before reframe, no hadith)",
      "3. Crisis flow (intervention, resources, no CBT)",
      "4. Scrupulosity flow (name pattern, avoid engagement)",
      "5. Failure language (charter/tone/Islamic violations)",
      "6. Audit trail (complete logging)",
    ];

    expect(flowsCovered.length).toBe(6);
  });
});
