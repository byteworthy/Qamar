/**
 * Canonical Orchestrator Test Suite for Noor
 *
 * Tests the critical safety pipeline that validates EVERY AI response.
 * This is the core protection mechanism for HIPAA and Charter compliance.
 *
 * NO EXCEPTIONS: Every AI response must pass through this orchestration.
 *
 * Last Updated: 2026-02-01
 */

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import {
  CanonicalOrchestrator,
  enforceCanonicalOrchestration,
  OrchestrationAuditLogger,
  type OrchestrationInput,
  type OrchestrationOutput,
} from "../canonical-orchestrator";
import type {
  EmotionalState,
  DistressLevel,
} from "../../shared/islamic-framework";
import type { ConversationState } from "../conversation-state-machine";
import type { PacingConfig } from "../pacing-controller";
import type { IslamicContentSelection } from "../islamic-content-mapper";

// Mock dependencies
jest.mock("../safety-integration");
jest.mock("../failure-language");
jest.mock("../safety-telemetry");

import { SafetyPipeline } from "../safety-integration";
import { FailureLanguage } from "../failure-language";
import { SafetyTelemetry } from "../safety-telemetry";

// =============================================================================
// TEST FIXTURES
// =============================================================================

const createMockInput = (
  overrides: Partial<OrchestrationInput> = {},
): OrchestrationInput => ({
  userInput: "I'm feeling anxious about my future",
  context: {
    emotionalState: "anxious" as EmotionalState,
    distressLevel: "moderate" as DistressLevel,
    mode: "analyze" as const,
    repetitionCount: 0,
    conversationState: "listening" as ConversationState,
  },
  aiResponseGenerator: jest.fn(
    async (_safetyGuidance: string, _pacingConfig: PacingConfig, _islamicContent?: IslamicContentSelection) =>
      "I hear you. That sounds difficult.",
  ),
  ...overrides,
});

const createMockPreProcessingResult = (blocked: boolean = false) => ({
  safe: !blocked,
  blocked,
  crisisDetected: undefined,
  scrupulosityDetected: false,
  distressLevel: "moderate" as DistressLevel,
  pacingConfig: {
    maxResponseLength: 200,
    suggestionThreshold: 2,
    canReframe: true,
    canChallenge: false,
  },
  islamicContent: undefined,
  conversationState: "listening" as ConversationState,
  safetyGuidance: "Be compassionate and non-judgmental",
  blockReason: blocked ? "Crisis detected" : undefined,
  fallbackResponse: blocked ? "Let me connect you with support" : undefined,
});

const createMockValidationResult = (
  compliant: boolean = true,
  toneScore: number = 100,
) => ({
  approved: compliant && toneScore >= 70,
  severity: compliant ? ("none" as const) : ("major" as const),
  charterReport: {
    compliant,
    severity: compliant ? ("none" as const) : ("major" as const),
    violations: compliant
      ? []
      : [
          {
            category: "judgment" as const,
            severity: "major" as const,
            description: "Response contains judgmental language",
          },
        ],
    blockers: [],
    passed: compliant,
  },
  toneScore,
  issues: compliant ? [] : ["Charter validation failed"],
  shouldRegenerate: !compliant,
  regenerationGuidance: !compliant ? "Remove judgmental language" : undefined,
});

// =============================================================================
// SETUP AND TEARDOWN
// =============================================================================

beforeEach(() => {
  jest.clearAllMocks();
  OrchestrationAuditLogger.clearLogs();

  // Default mock implementations
  (SafetyPipeline.preProcess as jest.Mock) = jest.fn(() =>
    createMockPreProcessingResult(false),
  );
  (SafetyPipeline.validateOutput as jest.Mock) = jest.fn(() =>
    createMockValidationResult(true, 100),
  );
  (FailureLanguage.systemPause as jest.Mock) = jest.fn(
    () => "Let me take a moment to respond more carefully.",
  );
  (FailureLanguage.needsRefinement as jest.Mock) = jest.fn(
    () => "I want to get this right. Let me rephrase that.",
  );
  (SafetyTelemetry.recordViolation as jest.Mock) = jest.fn();
  (SafetyTelemetry.recordCrisisEvent as jest.Mock) = jest.fn();
  (SafetyTelemetry.recordSystemFailure as jest.Mock) = jest.fn();
  (SafetyTelemetry.recordSuccessfulResponse as jest.Mock) = jest.fn();
});

// =============================================================================
// SUCCESSFUL ORCHESTRATION FLOW TESTS
// =============================================================================

describe("CanonicalOrchestrator - Successful Flow", () => {
  test("orchestrates successful AI response with all validations passing", async () => {
    const input = createMockInput();

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(true);
    expect(result.response).toBe("I hear you. That sounds difficult.");
    expect(result.pipelineStages.preProcessing).toBe("passed");
    expect(result.pipelineStages.aiGeneration).toBe("completed");
    expect(result.pipelineStages.charterValidation).toBe("passed");
    expect(result.pipelineStages.toneValidation).toBe("passed");
    expect(result.pipelineStages.stateValidation).toBe("passed");
    expect(result.pipelineStages.pacingValidation).toBe("passed");
    expect(result.pipelineStages.islamicGovernance).toBe("passed");
    expect(result.pipelineStages.fallbackUsed).toBe(false);
  });

  test("records telemetry event for successful response", async () => {
    const input = createMockInput();

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyTelemetry.recordSuccessfulResponse).toHaveBeenCalledWith(
      "moderate",
    );
    expect(result.telemetryEvents).toContainEqual({
      type: "response_approved",
      timestamp: expect.any(Number),
    });
  });

  test("passes safety guidance to AI generator", async () => {
    const mockGenerator = jest.fn(
      async (_safetyGuidance: string, _pacingConfig: PacingConfig, _islamicContent?: IslamicContentSelection) =>
        "Response",
    );
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
    });

    await CanonicalOrchestrator.orchestrate(input);

    expect(mockGenerator).toHaveBeenCalledWith(
      "Be compassionate and non-judgmental",
      expect.any(Object), // pacing config
      undefined, // islamic content
    );
  });

  test("includes audit trail in output", async () => {
    const input = createMockInput();

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.internalLog).toBeDefined();
    expect(result.internalLog).toContain("CANONICAL ORCHESTRATION START");
    expect(result.internalLog).toContain("ORCHESTRATION COMPLETE: SUCCESS");
  });
});

// =============================================================================
// PRE-PROCESSING SAFETY TESTS
// =============================================================================

describe("CanonicalOrchestrator - Pre-Processing", () => {
  test("blocks orchestration when pre-processing detects crisis", async () => {
    (SafetyPipeline.preProcess as jest.Mock).mockReturnValueOnce({
      ...createMockPreProcessingResult(true),
      crisisDetected: {
        level: "emergency",
        indicators: ["harm"],
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.preProcessing).toBe("blocked");
    expect(result.pipelineStages.aiGeneration).toBe("skipped");
    expect(result.pipelineStages.fallbackUsed).toBe(true);
    expect(result.response).toBe("Let me connect you with support");
  });

  test("records crisis telemetry when crisis detected", async () => {
    (SafetyPipeline.preProcess as jest.Mock).mockReturnValueOnce({
      ...createMockPreProcessingResult(true),
      crisisDetected: {
        level: "urgent",
        indicators: ["suicide"],
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyTelemetry.recordCrisisEvent).toHaveBeenCalledWith("urgent");
    expect(result.telemetryEvents).toContainEqual({
      type: "crisis_detected",
      level: "urgent",
      timestamp: expect.any(Number),
    });
  });

  test("uses system pause fallback when no specific fallback provided", async () => {
    (SafetyPipeline.preProcess as jest.Mock).mockReturnValueOnce({
      ...createMockPreProcessingResult(true),
      fallbackResponse: undefined,
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(FailureLanguage.systemPause).toHaveBeenCalled();
    expect(result.response).toBe(
      "Let me take a moment to respond more carefully.",
    );
  });
});

// =============================================================================
// AI GENERATION FAILURE TESTS
// =============================================================================

describe("CanonicalOrchestrator - AI Generation Failures", () => {
  test("handles AI generator throwing error gracefully", async () => {
    const mockGenerator = jest.fn(async () => {
      throw new Error("API timeout");
    });
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
    });

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.aiGeneration).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);
    expect(result.response).toBe(
      "Let me take a moment to respond more carefully.",
    );
  });

  test("records system failure telemetry on AI generation error", async () => {
    const mockGenerator = jest.fn(async () => {
      throw new Error("OpenAI error");
    });
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
    });

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyTelemetry.recordSystemFailure).toHaveBeenCalledWith(
      "ai_generation_error",
    );
    expect(result.telemetryEvents).toContainEqual({
      type: "system_failure",
      category: "ai_generation",
      timestamp: expect.any(Number),
    });
  });

  test("does not call validation when AI generation fails", async () => {
    const mockGenerator = jest.fn(async () => {
      throw new Error("Network error");
    });
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
    });

    await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyPipeline.validateOutput).not.toHaveBeenCalled();
  });
});

// =============================================================================
// CHARTER VALIDATION FAILURE TESTS
// =============================================================================

describe("CanonicalOrchestrator - Charter Validation Failures", () => {
  test("blocks response when charter validation fails", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(false, 100),
    );

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.charterValidation).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);
    expect(FailureLanguage.needsRefinement).toHaveBeenCalledWith("moderate");
  });

  test("records violation telemetry for charter failures", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(false, 100),
      charterReport: {
        compliant: false,
        severity: "critical",
        violations: [
          {
            category: "spiritual_bypassing",
            severity: "critical",
            description: "Just pray more",
          },
          {
            category: "judgment",
            severity: "major",
            description: "You should be grateful",
          },
        ],
        blockers: [],
        passed: false,
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyTelemetry.recordViolation).toHaveBeenCalledWith(
      "spiritual_bypassing",
      "critical",
    );
    expect(SafetyTelemetry.recordViolation).toHaveBeenCalledWith(
      "judgment",
      "major",
    );
    expect(result.telemetryEvents).toHaveLength(2);
  });

  test("uses distress-appropriate fallback language", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(false, 100),
    );

    const input = createMockInput({
      context: {
        ...createMockInput().context,
        distressLevel: "high" as DistressLevel,
      },
    });

    await CanonicalOrchestrator.orchestrate(input);

    expect(FailureLanguage.needsRefinement).toHaveBeenCalledWith("high");
  });
});

// =============================================================================
// TONE COMPLIANCE FAILURE TESTS
// =============================================================================

describe("CanonicalOrchestrator - Tone Validation Failures", () => {
  test("blocks response when tone score is below threshold", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(true, 65),
    );

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.toneValidation).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);
  });

  test("passes when tone score is exactly at threshold (70)", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(true, 70),
    );

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(true);
    expect(result.pipelineStages.toneValidation).toBe("passed");
  });

  test("records tone violation telemetry", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(true, 55),
    );

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyTelemetry.recordViolation).toHaveBeenCalledWith(
      "tone",
      "major",
    );
    expect(result.telemetryEvents).toContainEqual({
      type: "violation",
      category: "tone",
      severity: "major",
      timestamp: expect.any(Number),
    });
  });
});

// =============================================================================
// STATE MACHINE VALIDATION TESTS
// =============================================================================

describe("CanonicalOrchestrator - State Validation", () => {
  test("passes state validation when response matches listening state", async () => {
    const mockGenerator = jest.fn(
      async () => "I hear you. Tell me more about what you're feeling.",
    );
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
    });

    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.pipelineStages.stateValidation).toBe("passed");
  });

  test("fails state validation when response doesn't match expected state", async () => {
    const mockGenerator = jest.fn(
      async () => "Let's try this specific action step.",
    );
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
      context: {
        ...createMockInput().context,
        conversationState: "listening" as ConversationState,
      },
    });

    (SafetyPipeline.preProcess as jest.Mock).mockReturnValueOnce({
      ...createMockPreProcessingResult(false),
      conversationState: "listening" as ConversationState,
    });

    const result = await CanonicalOrchestrator.orchestrate(input);

    // State validation failure is logged but doesn't block response
    expect(result.pipelineStages.stateValidation).toBe("failed");
    expect(SafetyTelemetry.recordViolation).toHaveBeenCalledWith(
      "state_mismatch",
      "minor",
    );
  });

  test("allows response to proceed even with state mismatch", async () => {
    const mockGenerator = jest.fn(async () => "Response without state match");
    const input = createMockInput({
      aiResponseGenerator: mockGenerator,
    });

    const result = await CanonicalOrchestrator.orchestrate(input);

    // State validation is non-blocking
    expect(result.success).toBe(true);
  });
});

// =============================================================================
// PACING VALIDATION TESTS
// =============================================================================

describe("CanonicalOrchestrator - Pacing Validation", () => {
  test("passes pacing validation when no issues detected", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      issues: [],
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.pipelineStages.pacingValidation).toBe("passed");
  });

  test("fails pacing validation when pacing issues detected", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      issues: ["pacing: response too long for distress level"],
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.pipelineStages.pacingValidation).toBe("failed");
    expect(SafetyTelemetry.recordViolation).toHaveBeenCalledWith(
      "pacing",
      "minor",
    );
  });

  test("allows response to proceed with pacing issues (non-blocking)", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      issues: ["pacing: too complex", "pacing: too many suggestions"],
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    // Pacing is non-blocking
    expect(result.success).toBe(true);
    expect(result.pipelineStages.pacingValidation).toBe("failed");
  });
});

// =============================================================================
// ISLAMIC CONTENT GOVERNANCE TESTS
// =============================================================================

describe("CanonicalOrchestrator - Islamic Governance", () => {
  test("passes Islamic governance when no violations", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      charterReport: {
        compliant: true,
        severity: "none",
        violations: [],
        blockers: [],
        passed: true,
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.pipelineStages.islamicGovernance).toBe("passed");
  });

  test("fails Islamic governance on content restriction violation", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      charterReport: {
        compliant: false,
        severity: "critical",
        violations: [
          {
            category: "content_restriction",
            severity: "critical",
            description: "Theological advice beyond scope",
          },
        ],
        blockers: [],
        passed: false,
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.islamicGovernance).toBe("failed");
    expect(result.pipelineStages.fallbackUsed).toBe(true);
  });

  test("fails Islamic governance on spiritual bypassing", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      charterReport: {
        compliant: false,
        severity: "critical",
        violations: [
          {
            category: "spiritual_bypassing",
            severity: "critical",
            description: "Just trust Allah more",
          },
        ],
        blockers: [],
        passed: false,
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.pipelineStages.islamicGovernance).toBe("failed");
    expect(SafetyTelemetry.recordViolation).toHaveBeenCalledWith(
      "spiritual_bypassing",
      "critical",
    );
  });

  test("fails Islamic governance on theological distortion", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      charterReport: {
        compliant: false,
        severity: "critical",
        violations: [
          {
            category: "theological_distortion",
            severity: "critical",
            description: "Incorrect Islamic teaching",
          },
        ],
        blockers: [],
        passed: false,
      },
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.pipelineStages.islamicGovernance).toBe("failed");
  });
});

// =============================================================================
// FINAL APPROVAL TESTS
// =============================================================================

describe("CanonicalOrchestrator - Final Approval", () => {
  test("approves when validation approved and no regeneration needed", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      approved: true,
      shouldRegenerate: false,
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(true);
    expect(result.pipelineStages.fallbackUsed).toBe(false);
  });

  test("uses fallback when shouldRegenerate is true", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce({
      ...createMockValidationResult(true, 100),
      approved: false,
      shouldRegenerate: true,
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.fallbackUsed).toBe(true);
    expect(result.response).toBe(
      "I want to get this right. Let me rephrase that.",
    );
  });
});

// =============================================================================
// ERROR HANDLING TESTS
// =============================================================================

describe("CanonicalOrchestrator - Error Handling", () => {
  test("catches and handles unexpected orchestration errors", async () => {
    (SafetyPipeline.preProcess as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Unexpected error");
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(result.success).toBe(false);
    expect(result.pipelineStages.fallbackUsed).toBe(true);
    expect(result.response).toBe(
      "Let me take a moment to respond more carefully.",
    );
  });

  test("records system failure on orchestration error", async () => {
    (SafetyPipeline.preProcess as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Catastrophic failure");
    });

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    expect(SafetyTelemetry.recordSystemFailure).toHaveBeenCalledWith(
      "orchestration_error",
    );
    expect(result.telemetryEvents).toContainEqual({
      type: "system_failure",
      category: "orchestration",
      timestamp: expect.any(Number),
    });
  });

  test("never propagates exceptions to caller", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockImplementationOnce(() => {
      throw new Error("Validation crashed");
    });

    const input = createMockInput();

    // Should not throw
    await expect(
      CanonicalOrchestrator.orchestrate(input),
    ).resolves.toBeDefined();
  });
});

// =============================================================================
// ENFORCEMENT WRAPPER TESTS
// =============================================================================

describe("enforceCanonicalOrchestration", () => {
  test("calls onSuccess callback when orchestration succeeds", async () => {
    const onSuccess = jest.fn(
      (result: OrchestrationOutput) => result.response,
    );
    const input = createMockInput();

    const result = await enforceCanonicalOrchestration(
      input,
      onSuccess,
      undefined,
    );

    expect(onSuccess).toHaveBeenCalled();
    expect(result).toBe("I hear you. That sounds difficult.");
  });

  test("calls onFailure callback when orchestration fails", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(false, 100),
    );

    const onFailure = jest.fn(
      (result: OrchestrationOutput) => "Custom failure response",
    );
    const input = createMockInput();

    const result = await enforceCanonicalOrchestration(
      input,
      undefined,
      onFailure,
    );

    expect(onFailure).toHaveBeenCalled();
    expect(result).toBe("Custom failure response");
  });

  test("returns orchestration result when no callbacks provided", async () => {
    const input = createMockInput();

    const result = await enforceCanonicalOrchestration(input);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("response");
    expect(result).toHaveProperty("pipelineStages");
  });
});

// =============================================================================
// AUDIT LOGGER TESTS
// =============================================================================

describe("OrchestrationAuditLogger", () => {
  test("logs orchestration output", () => {
    const mockOutput: OrchestrationOutput = {
      success: true,
      response: "Test response",
      pipelineStages: {
        preProcessing: "passed",
        aiGeneration: "completed",
        charterValidation: "passed",
        toneValidation: "passed",
        stateValidation: "passed",
        pacingValidation: "passed",
        islamicGovernance: "passed",
        fallbackUsed: false,
      },
      telemetryEvents: [],
    };

    OrchestrationAuditLogger.log(mockOutput);

    const logs = OrchestrationAuditLogger.getRecentLogs(10);
    expect(logs).toHaveLength(1);
    expect(logs[0]).toEqual(mockOutput);
  });

  test("retrieves failed orchestrations", async () => {
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(false, 100),
    );

    const input = createMockInput();
    const result = await CanonicalOrchestrator.orchestrate(input);

    OrchestrationAuditLogger.log(result);

    const failedLogs = OrchestrationAuditLogger.getFailedOrchestrations();
    expect(failedLogs).toHaveLength(1);
    expect(failedLogs[0].success).toBe(false);
  });

  test("retrieves orchestrations that used fallback", async () => {
    const mockGenerator = jest.fn(async () => {
      throw new Error("AI error");
    });
    const input = createMockInput({ aiResponseGenerator: mockGenerator });

    const result = await CanonicalOrchestrator.orchestrate(input);
    OrchestrationAuditLogger.log(result);

    const fallbackLogs = OrchestrationAuditLogger.getByFallbackUsage();
    expect(fallbackLogs).toHaveLength(1);
    expect(fallbackLogs[0].pipelineStages.fallbackUsed).toBe(true);
  });

  test("calculates statistics correctly", async () => {
    // Log 2 successes
    const input1 = createMockInput();
    const result1 = await CanonicalOrchestrator.orchestrate(input1);
    OrchestrationAuditLogger.log(result1);

    const input2 = createMockInput();
    const result2 = await CanonicalOrchestrator.orchestrate(input2);
    OrchestrationAuditLogger.log(result2);

    // Log 1 failure
    (SafetyPipeline.validateOutput as jest.Mock).mockReturnValueOnce(
      createMockValidationResult(false, 100),
    );
    const input3 = createMockInput();
    const result3 = await CanonicalOrchestrator.orchestrate(input3);
    OrchestrationAuditLogger.log(result3);

    const stats = OrchestrationAuditLogger.getStatistics();

    expect(stats.totalOrchestrations).toBe(3);
    expect(stats.successRate).toBeCloseTo(66.67, 1);
    expect(stats.fallbackRate).toBeCloseTo(33.33, 1);
  });

  test("maintains max log size", () => {
    // Log more than MAX_LOGS (1000)
    for (let i = 0; i < 1100; i++) {
      OrchestrationAuditLogger.log({
        success: true,
        response: `Response ${i}`,
        pipelineStages: {
          preProcessing: "passed",
          aiGeneration: "completed",
          charterValidation: "passed",
          toneValidation: "passed",
          stateValidation: "passed",
          pacingValidation: "passed",
          islamicGovernance: "passed",
          fallbackUsed: false,
        },
        telemetryEvents: [],
      });
    }

    const logs = OrchestrationAuditLogger.getRecentLogs(2000);
    expect(logs.length).toBeLessThanOrEqual(1000);
  });

  test("clears logs", () => {
    const mockOutput: OrchestrationOutput = {
      success: true,
      response: "Test",
      pipelineStages: {
        preProcessing: "passed",
        aiGeneration: "completed",
        charterValidation: "passed",
        toneValidation: "passed",
        stateValidation: "passed",
        pacingValidation: "passed",
        islamicGovernance: "passed",
        fallbackUsed: false,
      },
      telemetryEvents: [],
    };

    OrchestrationAuditLogger.log(mockOutput);
    OrchestrationAuditLogger.clearLogs();

    const logs = OrchestrationAuditLogger.getRecentLogs(10);
    expect(logs).toHaveLength(0);
  });
});
