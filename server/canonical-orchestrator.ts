/**
 * Canonical Response Orchestration for Noor
 *
 * PRIORITY 1: Ensure every AI response follows this exact sequence
 * - Charter compliance
 * - Tone compliance
 * - State machine validation
 * - Pacing enforcement
 * - Islamic content governance
 * - Fallback handling
 *
 * NO EXCEPTIONS.
 *
 * Last Updated: 2026-01-17
 */

import {
  SafetyPipeline,
  type SafetyPipelineInput,
  type SafetyPipelineOutput,
  type OutputValidationResult,
} from "./safety-integration";
import { FailureLanguage } from "./failure-language";
import { SafetyTelemetry, type TelemetryEvent } from "./safety-telemetry";
import type {
  EmotionalState,
  DistressLevel,
} from "../shared/islamic-framework";
import type { ConversationState } from "./conversation-state-machine";
import type { PacingConfig } from "./pacing-controller";

// =============================================================================
// CANONICAL ORCHESTRATION TYPES
// =============================================================================

/**
 * Input configuration for orchestrated AI response generation
 */
export interface OrchestrationInput {
  /** The user's input text to be processed */
  userInput: string;
  /** Context about the user's current state and conversation mode */
  context: {
    emotionalState: EmotionalState;
    distressLevel: DistressLevel;
    mode: "analyze" | "reframe" | "practice" | "dua" | "insight";
    repetitionCount?: number;
    conversationState?: ConversationState;
  };
  /**
   * Function that generates an AI response given safety guidance and pacing config
   * @param safetyGuidance - Safety instructions to guide the AI
   * @param pacingConfig - Pacing configuration to control response characteristics
   * @param islamicContent - Selected Islamic content (Quran/Hadith) for this response
   * @returns The generated AI response
   */
  aiResponseGenerator: (
    safetyGuidance: string,
    pacingConfig: PacingConfig,
    islamicContent?: import("./islamic-content-mapper").IslamicContentSelection,
  ) => Promise<string>;
}

export interface OrchestrationOutput {
  success: boolean;
  response: string;

  // Audit trail
  pipelineStages: {
    preProcessing: "passed" | "blocked";
    aiGeneration: "completed" | "failed" | "skipped";
    charterValidation: "passed" | "failed";
    toneValidation: "passed" | "failed";
    stateValidation: "passed" | "failed";
    pacingValidation: "passed" | "failed";
    islamicGovernance: "passed" | "failed";
    fallbackUsed: boolean;
  };

  // Telemetry
  telemetryEvents: TelemetryEvent[];

  // For debugging only (not sent to client)
  internalLog?: string;
}

// =============================================================================
// CANONICAL ORCHESTRATOR
// =============================================================================

export class CanonicalOrchestrator {
  /**
   * The ONLY way AI responses are generated in this system.
   * Every response must pass through this orchestration.
   */
  static async orchestrate(
    input: OrchestrationInput,
  ): Promise<OrchestrationOutput> {
    const output: OrchestrationOutput = {
      success: false,
      response: "",
      pipelineStages: {
        preProcessing: "blocked",
        aiGeneration: "skipped",
        charterValidation: "failed",
        toneValidation: "failed",
        stateValidation: "failed",
        pacingValidation: "failed",
        islamicGovernance: "failed",
        fallbackUsed: false,
      },
      telemetryEvents: [],
      internalLog: "",
    };

    const log = (message: string) => {
      output.internalLog += `[${new Date().toISOString()}] ${message}\n`;
    };

    try {
      log("=== CANONICAL ORCHESTRATION START ===");

      // ========================================================================
      // STAGE 1: PRE-PROCESSING SAFETY
      // ========================================================================
      log("STAGE 1: Pre-processing safety checks");

      const preProcessingResult = SafetyPipeline.preProcess({
        userInput: input.userInput,
        context: input.context,
      });

      if (preProcessingResult.blocked) {
        log(`Pre-processing BLOCKED: ${preProcessingResult.blockReason}`);
        output.pipelineStages.preProcessing = "blocked";
        output.response =
          preProcessingResult.fallbackResponse || FailureLanguage.systemPause();
        output.pipelineStages.fallbackUsed = true;

        // Record telemetry
        if (preProcessingResult.crisisDetected) {
          output.telemetryEvents.push({
            type: "crisis_detected",
            level: preProcessingResult.crisisDetected.level,
            timestamp: Date.now(),
          });
          SafetyTelemetry.recordCrisisEvent(
            preProcessingResult.crisisDetected.level,
          );
        }

        return output;
      }

      output.pipelineStages.preProcessing = "passed";
      log("Pre-processing PASSED");

      // ========================================================================
      // STAGE 2: AI GENERATION
      // ========================================================================
      log("STAGE 2: AI generation with safety guidance");

      let aiResponse: string;
      try {
        aiResponse = await input.aiResponseGenerator(
          preProcessingResult.safetyGuidance,
          preProcessingResult.pacingConfig,
          preProcessingResult.islamicContent,
        );
        output.pipelineStages.aiGeneration = "completed";
        log(`AI generated response (${aiResponse.length} chars)`);
      } catch (error) {
        log(`AI generation FAILED: ${error}`);
        output.pipelineStages.aiGeneration = "failed";
        output.response = FailureLanguage.systemPause();
        output.pipelineStages.fallbackUsed = true;

        SafetyTelemetry.recordSystemFailure("ai_generation_error");
        output.telemetryEvents.push({
          type: "system_failure",
          category: "ai_generation",
          timestamp: Date.now(),
        });

        return output;
      }

      // ========================================================================
      // STAGE 3: CHARTER COMPLIANCE
      // ========================================================================
      log("STAGE 3: Charter compliance validation");

      const validation = SafetyPipeline.validateOutput(aiResponse, {
        emotionalState: input.context.emotionalState,
        distressLevel: input.context.distressLevel,
        crisisDetected: preProcessingResult.crisisDetected,
        scrupulosityDetected: preProcessingResult.scrupulosityDetected,
        conversationState: preProcessingResult.conversationState,
        repetitionCount: input.context.repetitionCount,
      });

      if (!validation.charterReport.compliant) {
        log(`Charter validation FAILED: ${validation.charterReport.severity}`);
        output.pipelineStages.charterValidation = "failed";

        // Record violation telemetry
        for (const violation of validation.charterReport.violations) {
          SafetyTelemetry.recordViolation(
            violation.category,
            violation.severity,
          );
          output.telemetryEvents.push({
            type: "violation",
            category: violation.category,
            severity: violation.severity,
            timestamp: Date.now(),
          });
        }

        // Use fallback
        output.response = FailureLanguage.needsRefinement(
          input.context.distressLevel,
        );
        output.pipelineStages.fallbackUsed = true;
        return output;
      }

      output.pipelineStages.charterValidation = "passed";
      log("Charter validation PASSED");

      // ========================================================================
      // STAGE 4: TONE COMPLIANCE
      // ========================================================================
      log("STAGE 4: Tone compliance validation");

      if (validation.toneScore < 70) {
        log(`Tone validation FAILED: score ${validation.toneScore}`);
        output.pipelineStages.toneValidation = "failed";

        SafetyTelemetry.recordViolation("tone", "major");
        output.telemetryEvents.push({
          type: "violation",
          category: "tone",
          severity: "major",
          timestamp: Date.now(),
        });

        output.response = FailureLanguage.needsRefinement(
          input.context.distressLevel,
        );
        output.pipelineStages.fallbackUsed = true;
        return output;
      }

      output.pipelineStages.toneValidation = "passed";
      log(`Tone validation PASSED: score ${validation.toneScore}`);

      // ========================================================================
      // STAGE 5: STATE MACHINE VALIDATION
      // ========================================================================
      log("STAGE 5: State machine validation");

      // Verify response matches expected conversation state
      const stateValid = this.validateConversationState(
        aiResponse,
        preProcessingResult.conversationState,
      );

      if (!stateValid) {
        log(`State validation FAILED`);
        output.pipelineStages.stateValidation = "failed";

        SafetyTelemetry.recordViolation("state_mismatch", "minor");
        output.telemetryEvents.push({
          type: "violation",
          category: "state_mismatch",
          severity: "minor",
          timestamp: Date.now(),
        });

        // Allow to proceed but log
      }

      output.pipelineStages.stateValidation = stateValid ? "passed" : "failed";
      log(`State validation ${stateValid ? "PASSED" : "FAILED"}`);

      // ========================================================================
      // STAGE 6: PACING ENFORCEMENT
      // ========================================================================
      log("STAGE 6: Pacing enforcement validation");

      // Already checked in validation, just verify
      const pacingIssues = validation.issues.filter((issue) =>
        issue.startsWith("pacing:"),
      );

      if (pacingIssues.length > 0) {
        log(`Pacing validation FAILED: ${pacingIssues.length} issues`);
        output.pipelineStages.pacingValidation = "failed";

        SafetyTelemetry.recordViolation("pacing", "minor");

        // For pacing, we allow through but log
      }

      output.pipelineStages.pacingValidation =
        pacingIssues.length === 0 ? "passed" : "failed";
      log(
        `Pacing validation ${pacingIssues.length === 0 ? "PASSED" : "FAILED"}`,
      );

      // ========================================================================
      // STAGE 7: ISLAMIC CONTENT GOVERNANCE
      // ========================================================================
      log("STAGE 7: Islamic content governance");

      const islamicViolations = validation.charterReport.violations.filter(
        (v) =>
          v.category === "content_restriction" ||
          v.category === "spiritual_bypassing" ||
          v.category === "theological_distortion",
      );

      if (islamicViolations.length > 0) {
        log(
          `Islamic governance FAILED: ${islamicViolations.length} violations`,
        );
        output.pipelineStages.islamicGovernance = "failed";

        for (const violation of islamicViolations) {
          SafetyTelemetry.recordViolation(
            violation.category,
            violation.severity,
          );
        }

        output.response = FailureLanguage.needsRefinement(
          input.context.distressLevel,
        );
        output.pipelineStages.fallbackUsed = true;
        return output;
      }

      output.pipelineStages.islamicGovernance = "passed";
      log("Islamic governance PASSED");

      // ========================================================================
      // STAGE 8: FINAL APPROVAL
      // ========================================================================
      log("STAGE 8: Final approval");

      if (validation.approved && !validation.shouldRegenerate) {
        output.success = true;
        output.response = aiResponse;
        log("=== ORCHESTRATION COMPLETE: SUCCESS ===");

        // Record successful completion
        SafetyTelemetry.recordSuccessfulResponse(input.context.distressLevel);
        output.telemetryEvents.push({
          type: "response_approved",
          timestamp: Date.now(),
        });
      } else {
        log("Final approval DENIED - using fallback");
        output.response = FailureLanguage.needsRefinement(
          input.context.distressLevel,
        );
        output.pipelineStages.fallbackUsed = true;
        log("=== ORCHESTRATION COMPLETE: FALLBACK USED ===");
      }
    } catch (error) {
      log(`ORCHESTRATION ERROR: ${error}`);
      output.response = FailureLanguage.systemPause();
      output.pipelineStages.fallbackUsed = true;

      SafetyTelemetry.recordSystemFailure("orchestration_error");
      output.telemetryEvents.push({
        type: "system_failure",
        category: "orchestration",
        timestamp: Date.now(),
      });
    }

    return output;
  }

  /**
   * Validate that response matches expected conversation state
   */
  private static validateConversationState(
    response: string,
    expectedState: ConversationState,
  ): boolean {
    // Simple heuristic validation
    const lowerResponse = response.toLowerCase();

    const stateIndicators: Record<ConversationState, string[]> = {
      listening: ["hear", "sounds", "tell me", "feeling", "experiencing"],
      reflection: [
        "understand",
        "seems like",
        "what i'm hearing",
        "makes sense",
      ],
      clarification: [
        "more about",
        "wondering",
        "curious",
        "help me understand",
      ],
      reframing: ["another way", "perspective", "what if", "consider"],
      grounding: ["step", "practice", "try", "action", "forward"],
      closure: ["progress", "remember", "learned", "continue"],
      crisis: ["support", "resources", "help", "reach out"],
      pause: ["break", "rest", "when ready", "take time"],
    };

    const indicators = stateIndicators[expectedState] || [];
    return indicators.some((indicator) => lowerResponse.includes(indicator));
  }
}

// =============================================================================
// ENFORCEMENT WRAPPER
// =============================================================================

/**
 * Wrap any AI interaction to ensure canonical orchestration
 */
export async function enforceCanonicalOrchestration<T>(
  input: OrchestrationInput,
  onSuccess?: (result: OrchestrationOutput) => T,
  onFailure?: (result: OrchestrationOutput) => T,
): Promise<T | OrchestrationOutput> {
  const result = await CanonicalOrchestrator.orchestrate(input);

  if (result.success && onSuccess) {
    return onSuccess(result);
  }

  if (!result.success && onFailure) {
    return onFailure(result);
  }

  return result;
}

// =============================================================================
// AUDIT LOGGER
// =============================================================================

export class OrchestrationAuditLogger {
  private static logs: OrchestrationOutput[] = [];
  private static readonly MAX_LOGS = 1000;

  static log(output: OrchestrationOutput): void {
    this.logs.push(output);

    // Maintain max size
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  static getRecentLogs(count: number = 100): OrchestrationOutput[] {
    return this.logs.slice(-count);
  }

  static getFailedOrchestrations(): OrchestrationOutput[] {
    return this.logs.filter((log) => !log.success);
  }

  static getByFallbackUsage(): OrchestrationOutput[] {
    return this.logs.filter((log) => log.pipelineStages.fallbackUsed);
  }

  static getStatistics(): {
    totalOrchestrations: number;
    successRate: number;
    fallbackRate: number;
    stageFailures: Record<string, number>;
  } {
    const total = this.logs.length;
    const successes = this.logs.filter((log) => log.success).length;
    const fallbacks = this.logs.filter(
      (log) => log.pipelineStages.fallbackUsed,
    ).length;

    const stageFailures: Record<string, number> = {};
    for (const log of this.logs) {
      for (const [stage, status] of Object.entries(log.pipelineStages)) {
        if (status === "failed" || status === "blocked") {
          stageFailures[stage] = (stageFailures[stage] || 0) + 1;
        }
      }
    }

    return {
      totalOrchestrations: total,
      successRate: total > 0 ? (successes / total) * 100 : 0,
      fallbackRate: total > 0 ? (fallbacks / total) * 100 : 0,
      stageFailures,
    };
  }

  static clearLogs(): void {
    this.logs = [];
  }
}
