import type { Express } from "express";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import {
  VALIDATION_MODE,
  isAnthropicConfigured,
  getValidationModeAnalyzeResponse,
} from "../config";
import { classifyTone, getTonePromptModifier } from "../toneClassifier";
import { inferInnerState, getStatePromptModifier } from "../stateInference";
import {
  detectCrisis,
  detectScrupulosity,
  CRISIS_RESOURCES,
  validateAndSanitizeInput,
} from "../ai-safety";
import {
  EmotionalIntelligence,
  buildConversationalPromptModifier,
  PatternDetector,
} from "../conversational-ai";
import {
  DISTRESS_RESPONSE_MATRIX,
  type EmotionalState,
  type DistressLevel,
} from "../../shared/islamic-framework";
import { IslamicContentMapper } from "../islamic-content-mapper";
import {
  CanonicalOrchestrator,
  OrchestrationAuditLogger,
} from "../canonical-orchestrator";
import { loadPrompt } from "../utils/promptLoader";
import {
  createErrorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "../types/error-response";
import {
  analyzeSchema,
  getAnthropicClient,
  SYSTEM_FOUNDATION,
  THOUGHT_PATTERNS,
} from "./constants";

export function registerAiRoutes(app: Express): void {
  app.post("/api/analyze", aiRateLimiter, async (req, res) => {
    try {
      // Validate request body
      const validationResult = analyzeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.VALIDATION_FAILED,
              req.id,
              "Invalid request data",
              { validationErrors: validationResult.error.issues },
            ),
          );
      }

      const { thought, emotionalIntensity } = validationResult.data;

      // VALIDATION MODE GUARD: Return placeholder if AI not configured
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        req.logger.info(
          "Validation mode: returning placeholder analyze response",
        );
        return res.json(getValidationModeAnalyzeResponse());
      }

      // OPENAI CONFIGURATION GUARD: Fail clearly if not in validation mode
      if (!isAnthropicConfigured()) {
        return res
          .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
          .json(
            createErrorResponse(
              HTTP_STATUS.SERVICE_UNAVAILABLE,
              ERROR_CODES.AI_SERVICE_UNAVAILABLE,
              req.id,
              "AI service not configured. Set VALIDATION_MODE=true for testing.",
            ),
          );
      }

      // INPUT VALIDATION & SANITIZATION
      const inputValidation = validateAndSanitizeInput(thought);
      if (!inputValidation.valid) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json(
            createErrorResponse(
              HTTP_STATUS.BAD_REQUEST,
              ERROR_CODES.INVALID_INPUT,
              req.id,
              "Invalid input",
            ),
          );
      }
      const sanitizedThought = inputValidation.sanitized;

      // SAFETY CHECK 1: Crisis Detection (HIGHEST PRIORITY)
      const crisisCheck = detectCrisis(sanitizedThought);
      if (crisisCheck.level === "emergency") {
        // Log crisis event for review (hashed, no raw content)
        const userId = req.auth?.userId;
        if (userId) {
          req.logger.warn("Crisis detected", {
            userId,
            crisisLevel: crisisCheck.level,
            safetyChecksPassed: false,
          });
        }

        return res.json({
          crisis: true,
          level: crisisCheck.level,
          resources: CRISIS_RESOURCES.emergency,
          // Minimal analysis to not leave user hanging
          distortions: [],
          happening:
            "What you're going through sounds incredibly painful. Right now, the most important thing is getting you real support.",
          pattern: [],
          matters: CRISIS_RESOURCES.emergency.islamicContext,
        });
      }

      if (crisisCheck.level === "urgent") {
        return res.json({
          crisis: true,
          level: crisisCheck.level,
          resources: CRISIS_RESOURCES.urgent,
          distortions: [],
          happening:
            "This sounds really heavy. You don't have to carry this alone.",
          pattern: [],
          matters: CRISIS_RESOURCES.urgent.islamicContext,
        });
      }

      // SAFETY CHECK 2: Religious Scrupulosity Detection
      const hasScrupulosity = detectScrupulosity(sanitizedThought);
      const scrupulosityModifier = hasScrupulosity
        ? `\n\nSCRUPULOSITY DETECTED: User shows signs of religious OCD (waswasa). DO NOT reinforce compulsive patterns. Emphasize Allah's mercy and ease. Gently suggest professional support.\n`
        : "";

      // ADAPTIVE INTELLIGENCE: Tone & Emotional State Detection
      const toneClassification = classifyTone(sanitizedThought);
      const toneModifier = getTonePromptModifier(toneClassification.mode);

      const stateInference = inferInnerState(sanitizedThought);
      const stateModifier = getStatePromptModifier(stateInference.state);

      // EMOTIONAL INTELLIGENCE: Detect intensity and suggest emotion
      const detectedIntensity =
        EmotionalIntelligence.detectIntensity(sanitizedThought);
      const suggestedEmotion =
        EmotionalIntelligence.suggestEmotionalLabel(sanitizedThought);

      // Determine distress level (use emotionalIntensity from client if provided, otherwise detect)
      let distressLevel: DistressLevel = "moderate";
      if (emotionalIntensity) {
        // Map client-provided intensity to distress level
        const intensityMap: Record<string, DistressLevel> = {
          mild: "low",
          moderate: "moderate",
          high: "high",
          crisis: "crisis",
        };
        distressLevel = intensityMap[emotionalIntensity] || "moderate";
      } else {
        // Auto-detect from content
        if (detectedIntensity < 30) distressLevel = "low";
        else if (detectedIntensity < 60) distressLevel = "moderate";
        else if (detectedIntensity < 85) distressLevel = "high";
        else distressLevel = "crisis";
      }

      // CONVERSATIONAL ADAPTATION: Build context-aware prompt modifier
      const conversationalContext = buildConversationalPromptModifier({
        mode: "listening",
        distressLevel,
        emotionalState:
          suggestedEmotion === "mixed"
            ? "anxiety"
            : (suggestedEmotion as EmotionalState),
        repetitionDetected: false,
        avoidanceDetected: PatternDetector.detectAvoidance(sanitizedThought),
      });

      // DISTRESS-LEVEL RESPONSE ADAPTATION
      const distressResponse = DISTRESS_RESPONSE_MATRIX[distressLevel];
      const distressModifier = `\n\nDISTRESS LEVEL: ${distressLevel}\nTone adjustment: ${distressResponse.toneAdjustment}\nResponse length: ${distressResponse.responseLength}\n`;

      // Developer-only logging for adaptive intelligence (not exposed to users)
      if (process.env.NODE_ENV === "development") {
        req.logger.debug("Adaptive intelligence analysis", {
          tone: {
            mode: toneClassification.mode,
            confidence: toneClassification.confidence.toFixed(2),
          },
          state: stateInference.state,
          emotionalIntensity: detectedIntensity,
          distressLevel,
          suggestedEmotion,
          crisisLevel: crisisCheck.level,
          hasScrupulosity,
        });
      }

      // CANONICAL ORCHESTRATION ENFORCEMENT
      const orchestrationResult = await CanonicalOrchestrator.orchestrate({
        userInput: sanitizedThought,
        context: {
          emotionalState:
            suggestedEmotion === "mixed"
              ? "anxiety"
              : (suggestedEmotion as EmotionalState),
          distressLevel,
          mode: "analyze",
          conversationState: "listening",
        },
        aiResponseGenerator: async (
          safetyGuidance,
          pacingConfig,
          islamicContent,
        ) => {
          // Build Islamic content modifier if available
          const islamicModifier = islamicContent
            ? IslamicContentMapper.buildIslamicPromptModifier(islamicContent)
            : "";

          // Load analyze-distortions prompt with DISTORTIONS_LIST replacement
          const analyzePrompt = loadPrompt("analyze-distortions.txt", {
            DISTORTIONS_LIST: THOUGHT_PATTERNS.map(
              (d: string) => `- ${d}`,
            ).join("\n"),
          });

          const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1024,
            system: `${SYSTEM_FOUNDATION}

${toneModifier}

${stateModifier}

${safetyGuidance}

${islamicModifier}

${analyzePrompt}`,
            messages: [
              {
                role: "user",
                content: thought,
              },
            ],
          });

          const firstBlock = response.content[0];
          return firstBlock?.type === "text" ? firstBlock.text : "{}";
        },
      });

      // Log orchestration for audit
      OrchestrationAuditLogger.log(orchestrationResult);

      // Handle orchestration failure
      if (!orchestrationResult.success) {
        return res.json({
          distortions: ["Emotional reasoning"],
          happening: orchestrationResult.response,
          pattern: ["We're taking a moment to ensure quality."],
          matters: "Your reflection matters. Please try again.",
        });
      }

      // Parse successful response
      const result = JSON.parse(orchestrationResult.response);

      res.json({
        distortions: result.distortions || ["Emotional reasoning"],
        happening:
          result.happening ||
          "The pain you feel is real and deserves acknowledgment.",
        pattern: result.pattern || [
          "This thought pattern involves interpreting feelings as facts.",
        ],
        matters:
          result.matters ||
          "Your emotions are valid, but they may not reflect the full truth of your situation.",
      });
    } catch (error) {
      req.logger.error("Failed to analyze thought", error, {
        operation: "analyze_thought",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to analyze thought",
          ),
        );
    }
  });
}
