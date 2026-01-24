import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "./storage";
import { billingService } from "./billing";
import {
  VALIDATION_MODE,
  isAnthropicConfigured,
  getValidationModeAnalyzeResponse,
  getValidationModeReframeResponse,
  getValidationModePracticeResponse,
  getValidationModeInsightSummary,
} from "./config";
import { classifyTone, getTonePromptModifier } from "./toneClassifier";
import {
  inferInnerState,
  getStatePromptModifier,
  detectAssumptionPattern,
  getAssumptionPromptModifier,
} from "./stateInference";
import {
  detectCrisis,
  validateAIOutput,
  CRISIS_RESOURCES,
  detectScrupulosity,
  SCRUPULOSITY_RESPONSE,
  createSafeLogEntry,
  validateAndSanitizeInput,
} from "./ai-safety";
import {
  EmotionalIntelligence,
  buildConversationalPromptModifier,
  PatternDetector,
} from "./conversational-ai";
import {
  QURAN_BY_STATE,
  HADITH_BY_STATE,
  DISTRESS_RESPONSE_MATRIX,
  type EmotionalState,
  type DistressLevel,
} from "../shared/islamic-framework";
import { IslamicContentMapper } from "./islamic-content-mapper";
import { encryptData, decryptData } from "./encryption";
import {
  CanonicalOrchestrator,
  OrchestrationAuditLogger,
} from "./canonical-orchestrator";
import { FailureLanguage } from "./failure-language";
import {
  runManualCleanup,
  verifyAdminToken,
  isAdminEndpointEnabled,
} from "./data-retention";
import { adminLimiter } from "./middleware/rate-limit";
import notificationRoutes from "./notificationRoutes";
import { loadPrompt } from "./utils/promptLoader";

// Lazy Anthropic client getter - only instantiate when needed and validation mode is off
let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic {
  if (VALIDATION_MODE) {
    throw new Error("Anthropic client should not be called in validation mode");
  }
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicClient;
}

const FREE_DAILY_LIMIT = 1;
const FREE_HISTORY_LIMIT = 3;

const ISLAMIC_CONCEPT_WHITELIST = [
  "Allah's mercy exceeds sin",
  "Effort is required, outcomes belong to Allah",
  "Hearts fluctuate and return is always open",
  "Hardship carries wisdom even when unseen",
  "Intention precedes action",
  "Reliance does not cancel effort",
  "Allah is closer than perceived distance",
  "Patience is illumination",
  "Gratitude increases blessing",
  "This world is a test, not a destination",
  "Repentance erases what came before",
  "No soul carries another's burden",
  "Allah does not burden beyond capacity",
  "The heart finds rest in remembrance of Allah",
  "Good opinion of Allah is worship",
  "Certainty brings peace, doubt brings anxiety",
];

const SYSTEM_FOUNDATION = `You are operating inside an Islamic epistemological framework, speaking to American Muslims.

VOICE & SPEAKING STYLE:
- Write like you're talking to a friend at the masjid after Jummah - warm, real, grounded
- Use everyday American English with natural Islamic terminology woven in
- Say "Allah" not "God" - your audience knows the difference and prefers it
- Use Arabic terms Muslims know: dua, tawakkul, sabr, shukr, fitna, dunya, akhira - but don't overdo it
- Keep sentences conversational, not academic or preachy
- Avoid clinical therapy-speak - this isn't a psychology textbook
- Be direct but gentle, like a wise older sibling
- It's okay to say "I hear you" or "that's real" - be human
- Never say "as Muslims we should..." - you're not lecturing

FOUNDATIONAL PRINCIPLES:

1. TAWHID AS THE COGNITIVE CENTER
- Allah is the source of meaning, mercy, order, and causality
- Human effort exists within divine decree
- Outcomes belong to Allah, responsibility belongs to the servant
- Never frame humans as fully autonomous or powerless. Balance effort and trust.

2. ISLAMIC MODEL OF THE HUMAN BEING
The user consists of:
- Qalb: governs spiritual and emotional states
- Aql: reasons and interprets
- Nafs: inclines toward comfort, avoidance, or ego
- Ruh: orients toward meaning, surrender, and alignment
Psychological struggle is not pathology. It is imbalance, misinterpretation, or unresolved meaning.

3. ROLE OF SUFFERING
Hardship is meaningful, not accidental. It may serve growth, purification, redirection, awareness, or reliance on Allah.
Never frame suffering as punishment unless explicitly stated in revelation.
Never guarantee relief timelines.

4. EMOTIONS VERSUS TRUTH
- Emotional experience is valid
- Cognitive interpretation may be distorted
Never invalidate emotions. Never equate feelings with objective reality.

5. LANGUAGE AND TONE
Be calm, grounded, compassionate, clear, non-preachy, non-clinical.
You are a guide, not a judge. A mirror, not a lecturer.
Sound like someone who gets it - not like a pamphlet.

ISLAMIC CONCEPT WHITELIST (ONLY reference these concepts):
${ISLAMIC_CONCEPT_WHITELIST.map((c) => `- ${c}`).join("\n")}

NLP TRANSFORMS TO APPLY INTERNALLY:

1. DEFUSION REWRITE
When the user writes a fused identity statement like "I am a failure" or "I am worthless", 
internally reframe as: "I am having the thought that I am a failure."
This is not shown as a lecture - it is used to generate clearer reframes.
Fused statements to detect: "I am [negative identity]", "I'll never be", "I'm always"

2. FRAME SHIFT
Provide ONE alternative frame that changes meaning without denying reality.
Common shifts:
- Control → Responsibility (what you can control vs what happens)
- Feeling → Conclusion (the emotion vs the meaning assigned to it)
- Test → Verdict (ongoing process vs final judgment)
- Effort → Outcome (what you do vs what results)

Use these transforms to generate responses. Do not lecture about them.

ISLAMIC SPIRITUALITY LAYER (implicit, not stated):
- Intention shapes attention
- Attention amplifies state
- Repetition engrains pathways
- State has momentum
- Alignment is return, not perfection
These inform wording. Never use "quantum" or pseudoscience claims.

ABSOLUTE PROHIBITIONS:
- Never claim healing, cure, or guarantees
- Never override personal responsibility with destiny talk
- Never reduce Islam to positive thinking
- Never reduce CBT to affirmation or platitudes
- Never shame the user for struggle
- Never dismiss psychology in favor of faith or vice versa
- Never quote full verses or hadith - only reference concepts
- Never use vague comfort like "Allah is merciful so feel better"
- Never sound like an imam giving a khutbah - be conversational
- Never use "we as an ummah" or other community generalizations`;

const DISTORTIONS = [
  "Despair of Allah's Mercy",
  "Over-attachment to dunya outcome",
  "Mind reading",
  "Catastrophizing",
  "Emotional reasoning",
  "Black-and-white thinking",
  "Hasty generalization",
  "Self-blame beyond accountability",
  "Ingratitude bias",
  "Comparison to others' blessings",
];

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount notification routes
  app.use("/api/notifications", notificationRoutes);

  // Health check endpoint for monitoring and uptime checks
  app.get("/api/health", async (_req, res) => {
    try {
      // Test database connection by querying sessions table
      await storage.getReflectionHistory("health-check", 1);

      res.status(200).json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
        version: "1.0.0",
      });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(503).json({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed",
      });
    }
  });

  // Validation schema for analyze request
  const analyzeSchema = z.object({
    thought: z.string().min(1).max(5000),
    emotionalIntensity: z
      .enum(["mild", "moderate", "high", "crisis"])
      .optional(),
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate request body
      const validationResult = analyzeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const { thought, emotionalIntensity } = validationResult.data;

      // VALIDATION MODE GUARD: Return placeholder if AI not configured
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        console.log(
          "[VALIDATION MODE] /api/analyze - returning placeholder response",
        );
        return res.json(getValidationModeAnalyzeResponse());
      }

      // OPENAI CONFIGURATION GUARD: Fail clearly if not in validation mode
      if (!isAnthropicConfigured()) {
        return res.status(503).json({
          error: "AI service not configured",
          code: "CONFIG_MISSING",
          message:
            "AI_INTEGRATIONS_OPENAI_API_KEY is missing or placeholder. Set VALIDATION_MODE=true for testing.",
        });
      }

      // INPUT VALIDATION & SANITIZATION
      const inputValidation = validateAndSanitizeInput(thought);
      if (!inputValidation.valid) {
        return res.status(400).json({ error: "Invalid input" });
      }
      const sanitizedThought = inputValidation.sanitized;

      // SAFETY CHECK 1: Crisis Detection (HIGHEST PRIORITY)
      const crisisCheck = detectCrisis(sanitizedThought);
      if (crisisCheck.level === "emergency") {
        // Log crisis event for review (hashed, no raw content)
        const userId = req.auth?.userId;
        if (userId) {
          console.log(
            "[AI Safety] Crisis detected:",
            createSafeLogEntry(userId, "crisis_detected", {
              crisisLevel: crisisCheck.level,
              safetyChecksPassed: false,
            }),
          );
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
        console.log("[Adaptive Intelligence] /api/analyze", {
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
            DISTORTIONS_LIST: DISTORTIONS.map((d) => `- ${d}`).join("\n"),
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
      console.error("Error analyzing thought:", error);
      res.status(500).json({ error: "Failed to analyze thought" });
    }
  });

  // Validation schema for reframe request
  const reframeSchema = z.object({
    thought: z.string().min(1).max(5000),
    distortions: z.array(z.string()).min(1).max(20),
    analysis: z.string().max(3000).optional(),
    emotionalIntensity: z
      .enum(["mild", "moderate", "high", "crisis"])
      .optional(),
  });

  app.post("/api/reframe", async (req, res) => {
    try {
      // Validate request body
      const validationResult = reframeSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const { thought, distortions, analysis, emotionalIntensity } =
        validationResult.data;

      // VALIDATION MODE GUARD
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        return res.json(getValidationModeReframeResponse());
      }
      if (!isAnthropicConfigured()) {
        return res.status(503).json({
          error: "AI service not configured",
          code: "CONFIG_MISSING",
        });
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
        console.log("[Adaptive Intelligence] /api/reframe", {
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
      console.error("Error generating reframe:", error);
      res.status(500).json({ error: "Failed to generate reframe" });
    }
  });

  app.post("/api/practice", async (req, res) => {
    try {
      const { reframe } = req.body;

      if (!reframe) {
        return res.status(400).json({ error: "Reframe is required" });
      }

      // VALIDATION MODE GUARD
      if (VALIDATION_MODE && !isAnthropicConfigured()) {
        return res.json(getValidationModePracticeResponse());
      }
      if (!isAnthropicConfigured()) {
        return res.status(503).json({
          error: "AI service not configured",
          code: "CONFIG_MISSING",
        });
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
      console.error("Error generating practice:", error);
      res.status(500).json({ error: "Failed to generate practice" });
    }
  });

  // POST /api/reflection/save
  // SECURITY: userId is derived from server-side session, NOT from request body.
  // ENCRYPTION: Sensitive fields are encrypted before storage
  // Validation schema for reflection save request
  const reflectionSaveSchema = z.object({
    thought: z.string().min(1).max(5000),
    distortions: z.array(z.string()).max(20), // Max 20 distortions
    reframe: z.string().min(1).max(5000),
    intention: z.string().max(2000).optional(),
    practice: z.string().max(2000),
    anchor: z.string().max(1000).optional(),
  });

  app.post("/api/reflection/save", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Validate request body
      const validationResult = reflectionSaveSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const { thought, distortions, reframe, intention, practice, anchor } =
        validationResult.data;

      const user = await storage.getOrCreateUser(userId);
      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        const todayCount = await storage.getTodayReflectionCount(userId);
        if (todayCount >= FREE_DAILY_LIMIT) {
          return res.status(402).json({
            error: "Upgrade to Noor Plus for unlimited reflections",
            code: "LIMIT_EXCEEDED",
          });
        }
      }

      const stateInference = inferInnerState(thought);
      const assumptionDetection = detectAssumptionPattern(thought);

      const detectedState = stateInference.state;
      const keyAssumption =
        assumptionDetection.detected && assumptionDetection.assumption
          ? assumptionDetection.assumption
          : undefined;

      // ENCRYPT SENSITIVE FIELDS before saving
      const encryptedThought = encryptData(thought);
      const encryptedReframe = encryptData(reframe);
      const encryptedIntention = intention ? encryptData(intention) : undefined;

      await storage.saveReflection(userId, {
        thought: encryptedThought,
        distortions,
        reframe: encryptedReframe,
        intention: encryptedIntention || "",
        practice,
        keyAssumption,
        detectedState,
        anchor,
      });

      res.json({
        success: true,
        detectedState: isPaid ? detectedState : undefined,
      });
    } catch (error) {
      console.error("Error saving reflection:", error);
      res.status(500).json({ error: "Failed to save reflection" });
    }
  });

  // GET /api/reflection/history
  // SECURITY: userId is derived from server-side session, NOT from query params.
  // DECRYPTION: Sensitive fields are decrypted before sending to client
  app.get("/api/reflection/history", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      const limit = isPaid ? undefined : FREE_HISTORY_LIMIT;
      const history = await storage.getReflectionHistory(userId, limit);

      // DECRYPT SENSITIVE FIELDS before sending to client
      const decryptedHistory = history.map((reflection) => ({
        ...reflection,
        thought: decryptData(reflection.thought),
        reframe: decryptData(reflection.reframe),
        intention: reflection.intention
          ? decryptData(reflection.intention)
          : undefined,
      }));

      res.json({
        history: decryptedHistory,
        isLimited: !isPaid,
        limit: isPaid ? null : FREE_HISTORY_LIMIT,
      });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // DELETE /api/reflection/:id
  // Delete a single reflection by ID
  // SECURITY: userId is derived from server-side session, ensures user owns the reflection
  app.delete("/api/reflection/:id", async (req, res) => {
    try {
      const userId = req.auth?.userId;
      const sessionId = parseInt(req.params.id, 10);

      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      if (isNaN(sessionId)) {
        return res.status(400).json({
          error: "Invalid reflection ID",
          code: "INVALID_ID",
        });
      }

      const deletedCount = await storage.deleteReflection(userId, sessionId);

      if (deletedCount === 0) {
        return res.status(404).json({
          error: "Reflection not found or already deleted",
          code: "NOT_FOUND",
        });
      }

      res.json({ success: true, deletedCount });
    } catch (error) {
      console.error("Error deleting reflection:", error);
      res.status(500).json({ error: "Failed to delete reflection" });
    }
  });

  // GET /api/reflection/can-reflect
  // SECURITY: userId is derived from server-side session, NOT from query params.
  app.get("/api/reflection/can-reflect", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.json({ canReflect: true, remaining: FREE_DAILY_LIMIT });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (isPaid) {
        return res.json({ canReflect: true, remaining: null, isPaid: true });
      }

      const todayCount = await storage.getTodayReflectionCount(userId);
      const remaining = Math.max(0, FREE_DAILY_LIMIT - todayCount);

      res.json({
        canReflect: remaining > 0,
        remaining,
        isPaid: false,
      });
    } catch (error) {
      console.error("Error checking reflection limit:", error);
      res.status(500).json({ error: "Failed to check limit" });
    }
  });

  // GET /api/reflection/patterns
  // PRO ONLY: Returns pattern data for insights screen
  app.get("/api/reflection/patterns", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(401).json({
          error: "Authentication required",
          code: "AUTH_REQUIRED",
        });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(403).json({
          error: "This feature requires Noor Plus",
          code: "PRO_REQUIRED",
        });
      }

      const reflectionCount = await storage.getReflectionCount(userId);

      if (reflectionCount < 3) {
        return res.json({
          summary: null,
          assumptions: [],
        });
      }

      const recentReflections = await storage.getRecentReflections(userId, 15);

      const assumptionCounts: Record<string, number> = {};
      recentReflections.forEach((r) => {
        if (r.keyAssumption) {
          assumptionCounts[r.keyAssumption] =
            (assumptionCounts[r.keyAssumption] || 0) + 1;
        }
      });

      const assumptions = Object.entries(assumptionCounts)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const states = recentReflections
        .filter((r) => r.detectedState)
        .map((r) => r.detectedState);
      const distortions = recentReflections.flatMap((r) => r.distortions || []);

      const mostCommonState =
        states.length > 0
          ? states.sort(
              (a, b) =>
                states.filter((v) => v === b).length -
                states.filter((v) => v === a).length,
            )[0]
          : null;

      const mostCommonDistortion =
        distortions.length > 0
          ? distortions.sort(
              (a, b) =>
                distortions.filter((v) => v === b).length -
                distortions.filter((v) => v === a).length,
            )[0]
          : null;

      let summary = "";
      if (mostCommonState && mostCommonDistortion) {
        summary = `Your reflections often arise from feelings of ${mostCommonState}. The thinking pattern "${mostCommonDistortion}" appears frequently. This is observation, not judgment - just data to help you see yourself more clearly.`;
      } else if (reflectionCount >= 3) {
        summary = `You've completed ${reflectionCount} reflections. Patterns are still emerging. Keep reflecting - clarity comes with consistency.`;
      }

      res.json({
        summary: summary || null,
        assumptions,
      });
    } catch (error) {
      console.error("Error fetching patterns:", error);
      res.status(500).json({ error: "Failed to fetch patterns" });
    }
  });

  // GET /api/insights/summary
  // PRO ONLY: Returns pattern insight summaries for the user
  app.get("/api/insights/summary", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(403).json({
          error: "This feature requires Noor Plus",
          code: "PRO_REQUIRED",
        });
      }

      const reflectionCount = await storage.getReflectionCount(userId);

      if (reflectionCount < 5) {
        return res.json({
          available: false,
          message: "Complete 5 reflections to unlock your pattern summary.",
          reflectionCount,
          requiredCount: 5,
        });
      }

      const existingSummary = await storage.getLatestInsightSummary(userId);

      if (
        existingSummary &&
        existingSummary.reflectionCount === reflectionCount
      ) {
        return res.json({
          available: true,
          summary: existingSummary.summary,
          reflectionCount,
          generatedAt: existingSummary.generatedAt,
        });
      }

      const recentReflections = await storage.getRecentReflections(userId, 15);
      const assumptions = recentReflections
        .filter((r) => r.keyAssumption)
        .map((r) => r.keyAssumption);
      const states = recentReflections
        .filter((r) => r.detectedState)
        .map((r) => r.detectedState);
      const distortions = recentReflections.flatMap((r) => r.distortions || []);

      const summaryPrompt = `Based on these patterns from ${reflectionCount} reflections:
- Recurring assumptions: ${assumptions.join(", ") || "None detected yet"}
- Common emotional states: ${states.join(", ") || "Various"}
- Frequent distortions: ${distortions.join(", ") || "Various"}

Write a 2-3 sentence insight summary that:
1. Names the user's most common cognitive pattern without judgment
2. Notes one area where growth is already visible
3. Offers one gentle observation about what tends to trigger their distortions

Keep the tone warm, observational, not prescriptive. Do not give advice.`;

      // CANONICAL ORCHESTRATION ENFORCEMENT
      const orchestrationResult = await CanonicalOrchestrator.orchestrate({
        userInput: summaryPrompt,
        context: {
          emotionalState: "anxiety",
          distressLevel: "low",
          mode: "dua",
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

          // Load generate-summary prompt
          const summaryPrompt = loadPrompt("generate-summary.txt");

          const response = await getAnthropicClient().messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 256,
            system: `${SYSTEM_FOUNDATION}

${safetyGuidance}

${islamicModifier}

${summaryPrompt}`,
            messages: [
              {
                role: "user",
                content: summaryPrompt,
              },
            ],
          });

          return (
            response.content[0]?.text ||
            "Your reflections show a pattern of growth. Continue observing your thoughts with curiosity."
          );
        },
      });

      // Log orchestration for audit
      OrchestrationAuditLogger.log(orchestrationResult);

      // Use orchestration response (includes fallback language if failed)
      const summary = orchestrationResult.response;

      await storage.saveInsightSummary(userId, summary, reflectionCount);

      res.json({
        available: true,
        summary,
        reflectionCount,
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error generating insight summary:", error);
      res.status(500).json({ error: "Failed to generate insight summary" });
    }
  });

  // GET /api/insights/assumptions
  // PRO ONLY: Returns the user's personal assumption library
  app.get("/api/insights/assumptions", async (req, res) => {
    try {
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(403).json({
          error: "This feature requires Noor Plus",
          code: "PRO_REQUIRED",
        });
      }

      const assumptions = await storage.getAssumptionLibrary(userId);

      res.json({
        assumptions,
        total: assumptions.length,
      });
    } catch (error) {
      console.error("Error fetching assumption library:", error);
      res.status(500).json({ error: "Failed to fetch assumption library" });
    }
  });

  // POST /api/duas/contextual
  // PRO ONLY: Returns a contextual dua based on the user's inner state
  interface DuaEntry {
    arabic: string;
    transliteration: string;
    meaning: string;
  }

  const DUA_BY_STATE: Record<string, DuaEntry> = {
    grief: {
      arabic: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
      transliteration: "Inna lillahi wa inna ilayhi raji'un",
      meaning: "Indeed, to Allah we belong and to Him we shall return.",
    },
    fear: {
      arabic: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ ۖ عَلَيْهِ تَوَكَّلْتُ",
      transliteration: "Hasbiyallahu la ilaha illa huwa, 'alayhi tawakkaltu",
      meaning:
        "Sufficient for me is Allah; there is no deity except Him. On Him I rely.",
    },
    shame: {
      arabic: "رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي",
      transliteration: "Rabbi inni dhalamtu nafsi faghfir li",
      meaning: "My Lord, indeed I have wronged myself, so forgive me.",
    },
    anger: {
      arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
      transliteration: "A'udhu billahi min ash-shaytanir-rajim",
      meaning: "I seek refuge in Allah from the accursed Satan.",
    },
    loneliness: {
      arabic:
        "لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ",
      transliteration:
        "La ilaha illa anta subhanaka inni kuntu min adh-dhalimin",
      meaning:
        "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.",
    },
    doubt: {
      arabic: "رَبِّ زِدْنِي عِلْمًا",
      transliteration: "Rabbi zidni 'ilma",
      meaning: "My Lord, increase me in knowledge.",
    },
    despair: {
      arabic: "لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ",
      transliteration: "La taqnatu min rahmatillah",
      meaning: "Do not despair of the mercy of Allah.",
    },
    exhaustion: {
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
      transliteration: "Allahumma inni a'udhu bika min al-hammi wal-hazan",
      meaning: "O Allah, I seek refuge in You from anxiety and sorrow.",
    },
  };

  app.post("/api/duas/contextual", async (req, res) => {
    try {
      const userId = req.auth?.userId;
      const { state } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        return res.status(403).json({
          error: "This feature requires Noor Plus",
          code: "PRO_REQUIRED",
        });
      }

      const normalizedState = (state || "").toLowerCase();
      const dua = DUA_BY_STATE[normalizedState] || DUA_BY_STATE["exhaustion"];

      res.json({
        state: normalizedState || "general",
        dua,
      });
    } catch (error) {
      console.error("Error fetching contextual dua:", error);
      res.status(500).json({ error: "Failed to fetch contextual dua" });
    }
  });

  // ADMIN: Manual data retention cleanup trigger
  // Protected by ADMIN_TOKEN - disabled unless env var is set
  // Rate limited to prevent brute force attacks
  app.post("/api/admin/retention/run", adminLimiter, async (req, res) => {
    // Check if admin endpoint is enabled
    if (!isAdminEndpointEnabled()) {
      return res.status(404).json({
        error: "Not found",
        code: "ENDPOINT_DISABLED",
      });
    }

    // Verify admin token
    const token = req.headers["x-admin-token"] as string | undefined;
    if (!verifyAdminToken(token)) {
      return res.status(401).json({
        error: "Unauthorized",
        code: "INVALID_ADMIN_TOKEN",
      });
    }

    try {
      console.log("[Admin] Manual retention cleanup triggered");
      const result = await runManualCleanup();
      res.json({
        success: true,
        message: "Data retention cleanup completed",
        result,
      });
    } catch (error) {
      console.error("[Admin] Manual cleanup failed:", error);
      res.status(500).json({
        error: "Cleanup failed",
        code: "CLEANUP_ERROR",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
