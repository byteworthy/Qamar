import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

YOUR TASK: Identify cognitive distortions in the user's thought.

CBT MECHANICS TO APPLY:
- Identify automatic thoughts
- Label cognitive distortions precisely
- Separate belief from feeling
- The standard for accurate thinking is Islamic truth, not personal preference

DISTORTIONS TO IDENTIFY (choose 1-2 that fit best):
${DISTORTIONS.map((d) => `- ${d}`).join("\n")}

RESPONSE RULES:
- Never shame or preach
- Never invalidate the emotion behind the thought
- Validate the emotion explicitly: "The pain you feel is real"
- Then identify the cognitive leap: "The thought that follows..."
- Be specific about what belief is being tested

EDGE CASE HANDLING:
- If user expresses anger at Allah: validate the frustration, do not shame, note that questioning is human
- If user feels abandoned: validate the loneliness, gently note that feeling abandoned differs from being abandoned
- If user is ashamed to make dua: validate the shame, note that shame itself can be a distortion

Respond with a JSON object containing:
- distortions: array of 1-2 distortion names from the list above
- analysis: a brief (2-3 sentences) reflection. First validate the emotional experience. Then name the cognitive pattern precisely.`,
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
        analysis:
          result.analysis ||
          "Your feelings are valid. Let us explore a different perspective together.",
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

YOUR TASK: Generate a cognitive reframe that DISPUTES the distorted belief, not just comforts.

REFRAME REQUIREMENTS:
1. Name the specific belief error (e.g., "This thought assumes your feeling equals Allah's judgment")
2. Dispute it with Islamic truth (e.g., "Feelings fluctuate. Judgment belongs to Allah alone")
3. Offer a concrete alternative thought the user can test

BAD REFRAME (vague comfort):
"Allah is merciful so feel better"

GOOD REFRAME (precise dispute):
"This thought assumes your suffering means Allah has abandoned you. But hardship carries wisdom even when unseen. Your role is effort; the outcome belongs to Him. The question is not 'why me' but 'what now.'"

ONLY use concepts from the whitelist. No full verses or hadith.

The user's distortions: ${distortions.join(", ")}

Respond with a JSON object containing:
- reframe: A concise (3-4 sentences) reframe that disputes the belief error with precision, not platitude
- source: The specific Islamic concept referenced (from whitelist)`,
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
        reframe:
          result.reframe ||
          "This thought assumes your feeling equals reality. Feelings fluctuate. Your role is effort; the outcome belongs to Allah.",
        source: result.source || "Effort is required, outcomes belong to Allah",
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

YOUR TASK: Generate a short calming practice (under 2 minutes) to help the reframe settle.

The practice should:
- Calm the nervous system
- Connect the qalb (heart) to the reframe
- Be simple and achievable in under 2 minutes
- Include a concrete, doable step

PRACTICE TYPES (choose one that fits the reframe):
1. Dhikr breathing (breathe in 4, hold 4, out 4, with SubhanAllah or Alhamdulillah)
2. Grounded remembrance (brief reflection on a divine attribute: Al-Wadud, Ar-Rahman, Al-Lateef)
3. Gratitude recall (name 3 specific blessings, cultivating shukr)

The tone should be inviting, not commanding.

Respond with a JSON object containing:
- title: Short name (e.g., "Dhikr Breathing" or "Gratitude Recall")
- instructions: Clear, gentle instructions (4-6 sentences). Include specific counts or steps.
- duration: Estimated time (e.g., "1-2 minutes")`,
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
        instructions:
          result.instructions ||
          "Close your eyes. Breathe in slowly for 4 counts. Hold gently for 4 counts. Release for 4 counts while silently saying 'SubhanAllah.' Repeat 4 times, letting each breath release tension.",
        duration: result.duration || "1-2 minutes",
      });
    } catch (error) {
      console.error("Error generating practice:", error);
      res.status(500).json({ error: "Failed to generate practice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
