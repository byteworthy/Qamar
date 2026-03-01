/**
 * Safety Integration Layer for Qamar
 *
 * Charter Version: 1.0
 * Charter URL: /AI_ISLAMIC_SAFETY_CHARTER.md
 * Last Reviewed: 2026-01-17
 *
 * This module provides a unified safety pipeline that integrates all
 * safety systems before and after AI interactions.
 */

import {
  detectCrisis,
  detectScrupulosity,
  validateAIOutput,
  type CrisisDetectionResult,
} from "./ai-safety";
import {
  CharterCompliance,
  validateOutput,
  shouldRejectOutput,
  type ComplianceReport,
} from "./charter-compliance";
import {
  checkToneCompliance,
  isToneCompliant,
  type ToneComplianceResult,
} from "./tone-compliance-checker";
import { defaultLogger } from "./utils/logger";
import {
  createConversationStateMachine,
  STATE_GUIDANCE,
  type ConversationStateMachine,
  type ConversationState,
} from "./conversation-state-machine";
import {
  IslamicContentMapper,
  enforceNoVerseAfterCrisis,
  type IslamicContentSelection,
} from "./islamic-content-mapper";
import {
  PacingController,
  PermissionChecker,
  type PacingConfig,
} from "./pacing-controller";
import type {
  EmotionalState,
  DistressLevel,
} from "../shared/islamic-framework";

// =============================================================================
// TYPES
// =============================================================================

export interface SafetyPipelineInput {
  userInput: string;
  context: {
    emotionalState: EmotionalState;
    distressLevel: DistressLevel;
    mode: "analyze" | "reframe" | "practice" | "dua" | "insight";
    repetitionCount?: number;
    conversationState?: ConversationState;
  };
  conversationMachine?: ConversationStateMachine;
}

export interface SafetyPipelineOutput {
  // Safety status
  safe: boolean;
  blocked: boolean;

  // Detections
  crisisDetected?: CrisisDetectionResult;
  scrupulosityDetected: boolean;

  // Context for AI
  distressLevel: DistressLevel;
  pacingConfig: PacingConfig;
  islamicContent?: IslamicContentSelection;
  conversationState: ConversationState;

  // Guidance for AI prompt
  safetyGuidance: string;

  // If blocked
  blockReason?: string;
  fallbackResponse?: string;
}

export interface OutputValidationResult {
  approved: boolean;
  severity: "none" | "minor" | "major" | "critical";
  charterReport: ComplianceReport;
  toneScore: number;
  issues: string[];

  // For regeneration
  shouldRegenerate: boolean;
  regenerationGuidance?: string;

  // For logging
  logEntry: string;
}

// =============================================================================
// PRE-PROCESSING SAFETY PIPELINE
// =============================================================================

/**
 * Run all safety checks BEFORE sending to AI
 */
export function runPreProcessingSafety(
  input: SafetyPipelineInput,
): SafetyPipelineOutput {
  const { userInput, context, conversationMachine } = input;

  // Initialize conversation machine if not provided
  const machine = conversationMachine || createConversationStateMachine();
  machine.updateContext({
    emotionalState: context.emotionalState,
    distressLevel: context.distressLevel,
    repetitionCount: context.repetitionCount || 0,
  });

  // Step 1: Crisis Detection (HIGHEST PRIORITY)
  const crisisDetected = detectCrisis(userInput);
  if (
    crisisDetected.level === "emergency" ||
    crisisDetected.level === "urgent"
  ) {
    machine.enterCrisis(crisisDetected);

    return {
      safe: false,
      blocked: true,
      crisisDetected,
      scrupulosityDetected: false,
      distressLevel: "crisis",
      pacingConfig: PacingController.getPacingConfig("crisis", "crisis", 0),
      conversationState: "crisis",
      safetyGuidance: "",
      blockReason: "Crisis detected - provide resources immediately",
      fallbackResponse: generateCrisisResponse(crisisDetected),
    };
  }

  // Step 2: Scrupulosity Detection
  const scrupulosityDetected = detectScrupulosity(userInput);

  // Step 3: Get Pacing Configuration
  const pacingConfig = PacingController.getPacingConfig(
    context.distressLevel,
    machine.getCurrentState(),
    context.repetitionCount || 0,
  );

  // Step 4: Select Islamic Content (respecting Charter rules)
  let islamicContent: IslamicContentSelection | undefined;
  try {
    const selection = IslamicContentMapper.selectContent({
      emotionalState: context.emotionalState,
      distressLevel: context.distressLevel,
      context: context.mode,
    });

    // Enforce Charter Part 8: No Verse After Crisis Rule
    islamicContent = enforceNoVerseAfterCrisis(
      crisisDetected.detected ? crisisDetected : undefined,
      context.distressLevel,
      selection,
    );
  } catch (error) {
    defaultLogger.error(
      "Safety Pipeline: Error selecting Islamic content",
      error instanceof Error ? error : new Error(String(error)),
      {
        operation: "safety_pipeline_islamic_content",
        emotionalState: context.emotionalState,
        distressLevel: context.distressLevel,
      },
    );
  }

  // Step 5: Build Safety Guidance for AI
  const safetyGuidance = buildSafetyGuidance({
    crisisDetected: crisisDetected.detected ? crisisDetected : undefined,
    scrupulosityDetected,
    distressLevel: context.distressLevel,
    pacingConfig,
    conversationState: machine.getCurrentState(),
  });

  return {
    safe: true,
    blocked: false,
    crisisDetected: crisisDetected.detected ? crisisDetected : undefined,
    scrupulosityDetected,
    distressLevel: context.distressLevel,
    pacingConfig,
    islamicContent,
    conversationState: machine.getCurrentState(),
    safetyGuidance,
  };
}

// =============================================================================
// POST-PROCESSING OUTPUT VALIDATION
// =============================================================================

/**
 * Validate AI output BEFORE sending to user
 */
export function validateAIOutputSafety(
  aiOutput: string,
  context: {
    emotionalState: EmotionalState;
    distressLevel: DistressLevel;
    crisisDetected?: CrisisDetectionResult;
    scrupulosityDetected?: boolean;
    conversationState: ConversationState;
    repetitionCount?: number;
  },
): OutputValidationResult {
  const issues: string[] = [];

  // Step 1: Charter Compliance Check
  const charterReport = CharterCompliance.validate({
    inputText: "",
    outputText: aiOutput,
    emotionalState: context.emotionalState,
    distressLevel: context.distressLevel,
    crisisDetected: context.crisisDetected,
    scrupulosityDetected: context.scrupulosityDetected,
    conversationContext: {
      mode: "analyze",
      repetitionDetected: (context.repetitionCount || 0) > 2,
    },
  });

  if (!charterReport.compliant) {
    for (const violation of charterReport.violations) {
      issues.push(`${violation.category}: ${violation.rule}`);
    }
  }

  // Step 2: Tone Compliance Check
  const toneResult = checkToneCompliance(aiOutput);
  const toneScore = toneResult.score;

  if (!toneResult.compliant) {
    for (const issue of toneResult.issues) {
      issues.push(`tone_${issue.type}: ${issue.phrase}`);
    }
  }

  // Step 3: Pacing Compliance Check
  const pacingConfig = PacingController.getPacingConfig(
    context.distressLevel,
    context.conversationState,
    context.repetitionCount || 0,
  );

  const pacingCheck = PacingController.needsSimplification(
    aiOutput,
    pacingConfig,
  );
  if (pacingCheck.needsSimplification) {
    issues.push(`pacing: ${pacingCheck.reason}`);
  }

  // Step 4: Determine if output should be rejected
  const shouldReject = shouldRejectOutput(charterReport) || toneScore < 70;

  // Step 5: Generate regeneration guidance if needed
  let regenerationGuidance: string | undefined;
  if (shouldReject) {
    regenerationGuidance = generateRegenerationGuidance(
      charterReport,
      toneResult,
      pacingCheck,
    );
  }

  // Step 6: Create log entry
  const logEntry = generateLogEntry(charterReport, toneResult, issues);

  return {
    approved: !shouldReject && issues.length === 0,
    severity: charterReport.severity,
    charterReport,
    toneScore,
    issues,
    shouldRegenerate: shouldReject,
    regenerationGuidance,
    logEntry,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Build comprehensive safety guidance for AI prompt
 */
function buildSafetyGuidance(params: {
  crisisDetected?: CrisisDetectionResult;
  scrupulosityDetected: boolean;
  distressLevel: DistressLevel;
  pacingConfig: PacingConfig;
  conversationState: ConversationState;
}): string {
  let guidance = "\n\n=== SAFETY & CHARTER COMPLIANCE GUIDANCE ===\n";

  // Crisis handling
  if (params.crisisDetected && params.crisisDetected.level !== "none") {
    guidance += "\n⚠️  CRISIS DETECTED\n";
    guidance += "- Do NOT continue normal reflection journey\n";
    guidance += "- Provide crisis resources immediately\n";
    guidance += "- Use simple, caring language\n";
    guidance += "- No analysis, no exercises, no verses\n";
  }

  // Scrupulosity handling
  if (params.scrupulosityDetected) {
    guidance += "\n⚠️  SCRUPULOSITY (WASWASA) DETECTED\n";
    guidance += "- Do NOT engage with content of obsession\n";
    guidance += "- Do NOT provide reassurance or checking\n";
    guidance += "- Gently name the pattern\n";
    guidance += "- Redirect to structure, not content\n";
  }

  // Pacing guidance
  guidance += `\n📏 PACING REQUIREMENTS (Distress: ${params.distressLevel})\n`;
  guidance += PacingController.getPacingGuidanceForPrompt(params.pacingConfig);

  // Conversation state guidance
  guidance += `\n🗣️  CONVERSATION STATE: ${params.conversationState}\n`;
  const stateGuidance = STATE_GUIDANCE[params.conversationState];
  if (stateGuidance) {
    guidance += `Purpose: ${stateGuidance.purpose}\n`;
    guidance += `Tone emphasis: ${stateGuidance.toneEmphasis.join(", ")}\n`;
    guidance += "Do this: " + stateGuidance.doThis.join("; ") + "\n";
    guidance += "Avoid this: " + stateGuidance.avoidThis.join("; ") + "\n";
  }

  // Charter compliance reminders
  guidance += "\n📜 CHARTER COMPLIANCE (v1.0)\n";
  guidance += "- NEVER issue religious rulings (fatwas)\n";
  guidance += "- NEVER claim outcomes (no guarantees)\n";
  guidance += "- NEVER use absolution language\n";
  guidance += "- NEVER make diagnoses\n";
  guidance += "- ALWAYS validate before reframing\n";
  guidance += "- ALWAYS use mercy-first tone\n";
  guidance += "- Maximum 1 Quranic verse per response\n";
  guidance += "- Maximum 1 hadith per response\n";

  return guidance;
}

/**
 * Generate crisis response
 */
function generateCrisisResponse(crisis: CrisisDetectionResult): string {
  if (crisis.level === "emergency") {
    return `You're in a lot of pain right now. Please reach out for immediate support:

**988 Suicide & Crisis Lifeline** (call or text 988)
Available 24/7 for anyone in crisis.

**Crisis Text Line**: Text HOME to 741741

You matter. You deserve support that can meet you in this moment.`;
  }

  if (crisis.level === "urgent") {
    return `This sounds really heavy. You don't have to carry this alone.

If you're having thoughts of self-harm:
**988 Suicide & Crisis Lifeline** (call or text 988)

You're worth more care than I can give right now. Please reach out.`;
  }

  return "Your feelings are valid. Please consider reaching out for support.";
}

/**
 * Generate regeneration guidance for failed validation
 */
function generateRegenerationGuidance(
  charterReport: ComplianceReport,
  toneResult: ToneComplianceResult,
  pacingCheck: { needsSimplification: boolean; reason: string },
): string {
  let guidance = "REGENERATION REQUIRED:\n\n";

  if (charterReport.severity === "critical") {
    guidance += "🚨 CRITICAL CHARTER VIOLATIONS:\n";
    for (const violation of charterReport.violations.filter(
      (v) => v.severity === "critical",
    )) {
      guidance += `- ${violation.rule}: ${violation.evidence}\n`;
      guidance += `  Fix: Remove this content\n`;
    }
  }

  if (charterReport.severity === "major") {
    guidance += "⚠️  MAJOR CHARTER VIOLATIONS:\n";
    for (const violation of charterReport.violations.filter(
      (v) => v.severity === "major",
    )) {
      guidance += `- ${violation.rule}\n`;
    }
  }

  if (toneResult.score < 70) {
    guidance += `\n📢 TONE ISSUES (Score: ${toneResult.score}/100):\n`;
    for (const suggestion of toneResult.suggestions) {
      guidance += `- ${suggestion}\n`;
    }
  }

  if (pacingCheck.needsSimplification) {
    guidance += `\n⏱️  PACING ISSUE:\n- ${pacingCheck.reason}\n`;
  }

  return guidance;
}

/**
 * Generate log entry for monitoring
 */
function generateLogEntry(
  charterReport: ComplianceReport,
  toneResult: ToneComplianceResult,
  issues: string[],
): string {
  const timestamp = new Date().toISOString();
  const status =
    issues.length === 0 ? "PASS" : charterReport.severity.toUpperCase();

  return `[${timestamp}] Safety Check ${status} | Charter: ${charterReport.severity} | Tone: ${toneResult.score} | Issues: ${issues.length}`;
}

// =============================================================================
// FALLBACK RESPONSES
// =============================================================================

/**
 * Generate safe fallback response when AI output fails validation
 */
export function generateFallbackResponse(context: {
  distressLevel: DistressLevel;
  conversationState: ConversationState;
}): string {
  if (context.distressLevel === "crisis" || context.distressLevel === "high") {
    return "I hear you. That sounds really difficult. Let me take a moment to respond more carefully.";
  }

  if (context.conversationState === "listening") {
    return "I want to make sure I understand what you're going through. Can you tell me more?";
  }

  if (context.conversationState === "reflection") {
    return "That makes sense given what you're experiencing. Your feelings are valid.";
  }

  return "Let me think about this for a moment. Your experience deserves a thoughtful response.";
}

// =============================================================================
// EXPORTS
// =============================================================================

export const SafetyPipeline = {
  preProcess: runPreProcessingSafety,
  validateOutput: validateAIOutputSafety,
  generateFallback: generateFallbackResponse,
};
