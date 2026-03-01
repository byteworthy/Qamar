import type { Express } from "express";
import { aiRateLimiter } from "../middleware/ai-rate-limiter";
import {
  VALIDATION_MODE,
  isAnthropicConfigured,
  getValidationModeReframeResponse,
  getValidationModePracticeResponse,
} from "../config";
import { classifyTone, getTonePromptModifier } from "../toneClassifier";
import {
  inferInnerState,
  getStatePromptModifier,
  detectAssumptionPattern,
  getAssumptionPromptModifier,
} from "../stateInference";
import { EmotionalIntelligence } from "../conversational-ai";
import {
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
  reframeSchema,
  practiceSchema,
  getAnthropicClient,
  SYSTEM_FOUNDATION,
} from "./constants";

export function registerReframePracticeRoutes(app: Express): void {
  app.post("/api/reframe", aiRateLimiter, async (req, res) => {
    try {
      // Validate request body
      const validationResult = reframeSchema.safeParse(req.body);
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

      const { thought, patterns, analysis, emotionalIntensity } =
        validationResult.data;
      const distortions = patterns; // backward compat

      // VALIDATION MODE GUARD
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        return res.json(getValidationModeReframeResponse());
      }
      if (!isAnthropicConfigured()) {
        return res
          .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
          .json(
            createErrorResponse(
              HTTP_STATUS.SERVICE_UNAVAILABLE,
              ERROR_CODES.AI_SERVICE_UNAVAILABLE,
              req.id,
              "AI service not configured",
            ),
          );
      }

      const toneClassification = classifyTone(thought);
      const toneModifier = getTonePromptModifier(toneClassification.mode);

      const stateInference = inferInnerState(thought);
      const stateModifier = getStatePromptModifier(stateInference.state);

      const assumptionDetection = detectAssumptionPattern(thought);
      const assumptionModifier =
        getAssumptionPromptModifier(assumptionDetection);

      // Determine distress level for Islamic content selection
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
        const detectedIntensity =
          EmotionalIntelligence.detectIntensity(thought);
        if (detectedIntensity < 30) distressLevel = "low";
        else if (detectedIntensity < 60) distressLevel = "moderate";
        else if (detectedIntensity < 85) distressLevel = "high";
        else distressLevel = "crisis";
      }

      const emotionalState = stateInference.state as EmotionalState;

      // Developer-only logging for adaptive intelligence (not exposed to users)
      if (process.env.NODE_ENV === "development") {
        req.logger.debug("Adaptive intelligence reframe", {
          tone: {
            mode: toneClassification.mode,
            confidence: toneClassification.confidence.toFixed(2),
          },
          state: stateInference.state,
          distressLevel,
          assumptionDetected: assumptionDetection.detected
            ? assumptionDetection.assumption
            : null,
        });
      }

      // CANONICAL ORCHESTRATION ENFORCEMENT
      const orchestrationResult = await CanonicalOrchestrator.orchestrate({
        userInput: thought,
        context: {
          emotionalState,
          distressLevel,
          mode: "reframe",
          conversationState: "reframing",
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

          // Load generate-reframe prompt with DISTORTIONS replacement
          const reframePrompt = loadPrompt("generate-reframe.txt", {
            DISTORTIONS: distortions.join(", "),
          });

          const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1024,
            system: `${SYSTEM_FOUNDATION}

${toneModifier}

${stateModifier}

${assumptionModifier}

${safetyGuidance}

${islamicModifier}

${reframePrompt}`,
            messages: [
              {
                role: "user",
                content: `Original thought: ${thought}\n\nReflection: ${analysis}`,
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
          beliefTested: orchestrationResult.response,
          perspective:
            "We're ensuring this guidance aligns with what you need right now.",
          nextStep: "Take a moment, then try again.",
          anchors: ["Allah's mercy exceeds sin"],
        });
      }

      // Parse successful response
      const result = JSON.parse(orchestrationResult.response);

      res.json({
        beliefTested:
          result.beliefTested ||
          "This thought assumes your feeling equals reality.",
        perspective:
          result.perspective ||
          "Feelings fluctuate. Your role is effort; the outcome belongs to Allah.",
        nextStep:
          result.nextStep ||
          "Take one small step of effort today, trusting the outcome to Allah.",
        anchors: result.anchors || [
          "Effort is required, outcomes belong to Allah",
        ],
      });
    } catch (error) {
      req.logger.error("Failed to generate reframe", error, {
        operation: "generate_reframe",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to generate reframe",
          ),
        );
    }
  });

  app.post("/api/practice", aiRateLimiter, async (req, res) => {
    try {
      // Validate request body
      const validationResult = practiceSchema.safeParse(req.body);
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

      const { reframe } = validationResult.data;

      // VALIDATION MODE GUARD
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        return res.json(getValidationModePracticeResponse());
      }
      if (!isAnthropicConfigured()) {
        return res
          .status(HTTP_STATUS.SERVICE_UNAVAILABLE)
          .json(
            createErrorResponse(
              HTTP_STATUS.SERVICE_UNAVAILABLE,
              ERROR_CODES.AI_SERVICE_UNAVAILABLE,
              req.id,
              "AI service not configured",
            ),
          );
      }

      // CANONICAL ORCHESTRATION ENFORCEMENT
      const orchestrationResult = await CanonicalOrchestrator.orchestrate({
        userInput: reframe,
        context: {
          emotionalState: "anxiety",
          distressLevel: "low",
          mode: "practice",
          conversationState: "grounding",
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

          // Load suggest-practice prompt
          const practicePrompt = loadPrompt("suggest-practice.txt");

          const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 512,
            system: `${SYSTEM_FOUNDATION}

${safetyGuidance}

${islamicModifier}

${practicePrompt}`,
            messages: [
              {
                role: "user",
                content: `Reframe to help land: ${reframe}`,
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
          title: "Grounding Practice",
          steps: [orchestrationResult.response],
          reminder: "Take it one breath at a time.",
          duration: "1-2 minutes",
        });
      }

      // Parse successful response
      const result = JSON.parse(orchestrationResult.response);

      res.json({
        title: result.title || "Dhikr Breathing",
        steps: result.steps || [
          "Close your eyes and breathe in slowly for 4 counts.",
          "Hold gently for 4 counts, silently saying 'SubhanAllah.'",
          "Release for 4 counts, letting tension leave with the breath.",
        ],
        reminder:
          result.reminder || "Let each breath remind you that you are held.",
        duration: result.duration || "1-2 minutes",
      });
    } catch (error) {
      req.logger.error("Failed to generate practice", error, {
        operation: "generate_practice",
      });
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(
          createErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            ERROR_CODES.INTERNAL_ERROR,
            req.id,
            "Failed to generate practice",
          ),
        );
    }
  });
}
