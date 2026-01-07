import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { storage } from "./storage";
import { billingService } from "./billing";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

const SYSTEM_FOUNDATION = `You are operating inside an Islamic epistemological framework.

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

ISLAMIC CONCEPT WHITELIST (ONLY reference these concepts):
${ISLAMIC_CONCEPT_WHITELIST.map((c) => `- ${c}`).join("\n")}

ABSOLUTE PROHIBITIONS:
- Never claim healing, cure, or guarantees
- Never override personal responsibility with destiny talk
- Never reduce Islam to positive thinking
- Never reduce CBT to affirmation or platitudes
- Never shame the user for struggle
- Never dismiss psychology in favor of faith or vice versa
- Never quote full verses or hadith - only reference concepts
- Never use vague comfort like "Allah is merciful so feel better"`;

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
  app.post("/api/analyze", async (req, res) => {
    try {
      const { thought } = req.body;

      if (!thought || typeof thought !== "string") {
        return res.status(400).json({ error: "Thought is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        max_completion_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_FOUNDATION}

YOUR TASK: Identify cognitive distortions in the user's thought and structure your response clearly.

CBT MECHANICS TO APPLY:
- Identify automatic thoughts
- Label cognitive distortions precisely
- Separate belief from feeling
- The standard for accurate thinking is Islamic truth, not personal preference

DISTORTIONS TO IDENTIFY (choose 1-2 that fit best):
${DISTORTIONS.map((d) => `- ${d}`).join("\n")}

RESPONSE STRUCTURE:
You must respond with THREE distinct sections:
1. "happening" - One short paragraph describing what the user is experiencing emotionally. Validate the emotion.
2. "pattern" - Two bullet points, each naming ONE distortion and ONE sentence explaining it.
3. "matters" - One short paragraph that validates emotion without agreeing with the distorted conclusion.

EDGE CASE HANDLING:
- If user expresses anger at Allah: validate the frustration, do not shame, note that questioning is human
- If user feels abandoned: validate the loneliness, gently note that feeling abandoned differs from being abandoned
- If user is ashamed to make dua: validate the shame, note that shame itself can be a distortion

Respond with a JSON object containing:
- distortions: array of 1-2 distortion names from the list above
- happening: one short paragraph validating the emotional experience
- pattern: array of 2 strings, each a one-sentence explanation of one distortion
- matters: one short paragraph that validates without affirming the distortion`,
          },
          {
            role: "user",
            content: thought,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);

      res.json({
        distortions: result.distortions || ["Emotional reasoning"],
        happening: result.happening || "The pain you feel is real and deserves acknowledgment.",
        pattern: result.pattern || ["This thought pattern involves interpreting feelings as facts."],
        matters: result.matters || "Your emotions are valid, but they may not reflect the full truth of your situation.",
      });
    } catch (error) {
      console.error("Error analyzing thought:", error);
      res.status(500).json({ error: "Failed to analyze thought" });
    }
  });

  app.post("/api/reframe", async (req, res) => {
    try {
      const { thought, distortions, analysis } = req.body;

      if (!thought || !distortions) {
        return res.status(400).json({ error: "Thought and distortions are required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        max_completion_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_FOUNDATION}

YOUR TASK: Generate a cognitive reframe structured in three blocks.

BLOCK 1 - THE BELIEF BEING TESTED:
One sentence naming the specific belief error.
Example: "This thought assumes your feeling equals Allah's judgment of you."

BLOCK 2 - A TRUER PERSPECTIVE:
Two to three sentences max, grounded in the concept whitelist. This is the core reframe.
Example: "Feelings fluctuate, but Allah's mercy is constant. Hardship carries wisdom even when unseen. Your role is effort; the outcome belongs to Him."

BLOCK 3 - ONE NEXT STEP:
One simple action that can be done today.
Example: "Make one small dua, even if your heart feels heavy."

ANCHORS:
List 2-4 concept names from the whitelist that you referenced (names only, not full text).

ONLY use concepts from the whitelist. No full verses or hadith.

The user's distortions: ${distortions.join(", ")}

Respond with a JSON object containing:
- beliefTested: one sentence naming the belief error
- perspective: 2-3 sentences with the truer perspective
- nextStep: one simple action for today
- anchors: array of 2-4 concept names from the whitelist`,
          },
          {
            role: "user",
            content: `Original thought: ${thought}\n\nReflection: ${analysis}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);

      res.json({
        beliefTested: result.beliefTested || "This thought assumes your feeling equals reality.",
        perspective: result.perspective || "Feelings fluctuate. Your role is effort; the outcome belongs to Allah.",
        nextStep: result.nextStep || "Take one small step of effort today, trusting the outcome to Allah.",
        anchors: result.anchors || ["Effort is required, outcomes belong to Allah"],
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

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        max_completion_tokens: 512,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_FOUNDATION}

YOUR TASK: Generate a short calming practice (under 2 minutes) formatted as numbered steps.

OUTPUT FORMAT:
- title: Short name (e.g., "Dhikr Breathing" or "Gratitude Recall")
- steps: An array of exactly 3 short steps (one sentence each). Each step should be clear and actionable.
- reminder: One short sentence to close the practice.
- duration: Estimated time (e.g., "1-2 minutes")

PRACTICE TYPES (choose one that fits the reframe):
1. Dhikr breathing (breathe in 4, hold 4, out 4, with SubhanAllah or Alhamdulillah)
2. Grounded remembrance (brief reflection on a divine attribute: Al-Wadud, Ar-Rahman, Al-Lateef)
3. Gratitude recall (name 3 specific blessings, cultivating shukr)

The tone should be inviting, not commanding. Keep each step to one clear sentence.

Respond with a JSON object containing:
- title: string
- steps: array of exactly 3 strings (one sentence each)
- reminder: one short sentence
- duration: string`,
          },
          {
            role: "user",
            content: `Reframe to help land: ${reframe}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);

      res.json({
        title: result.title || "Dhikr Breathing",
        steps: result.steps || [
          "Close your eyes and breathe in slowly for 4 counts.",
          "Hold gently for 4 counts, silently saying 'SubhanAllah.'",
          "Release for 4 counts, letting tension leave with the breath."
        ],
        reminder: result.reminder || "Let each breath remind you that you are held.",
        duration: result.duration || "1-2 minutes",
      });
    } catch (error) {
      console.error("Error generating practice:", error);
      res.status(500).json({ error: "Failed to generate practice" });
    }
  });

  app.post("/api/reflection/save", async (req, res) => {
    try {
      const { userId, thought, distortions, reframe, intention, practice } = req.body;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const user = await storage.getOrCreateUser(userId);
      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      if (!isPaid) {
        const todayCount = await storage.getTodayReflectionCount(userId);
        if (todayCount >= FREE_DAILY_LIMIT) {
          return res.status(402).json({ 
            error: "Upgrade to Noor Plus for unlimited reflections",
            code: "LIMIT_EXCEEDED"
          });
        }
      }

      await storage.saveReflection(userId, {
        thought,
        distortions,
        reframe,
        intention,
        practice,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error saving reflection:", error);
      res.status(500).json({ error: "Failed to save reflection" });
    }
  });

  app.get("/api/reflection/history", async (req, res) => {
    try {
      const userId = req.query.userId as string;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const { status } = await billingService.getBillingStatus(userId);
      const isPaid = billingService.isPaidUser(status);

      const limit = isPaid ? undefined : FREE_HISTORY_LIMIT;
      const history = await storage.getReflectionHistory(userId, limit);

      res.json({ 
        history, 
        isLimited: !isPaid,
        limit: isPaid ? null : FREE_HISTORY_LIMIT
      });
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/reflection/can-reflect", async (req, res) => {
    try {
      const userId = req.query.userId as string;

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
        isPaid: false
      });
    } catch (error) {
      console.error("Error checking reflection limit:", error);
      res.status(500).json({ error: "Failed to check limit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
