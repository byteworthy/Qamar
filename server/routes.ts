import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

ABSOLUTE PROHIBITIONS:
- Never claim healing, cure, or guarantees
- Never override personal responsibility with destiny talk
- Never reduce Islam to positive thinking
- Never reduce CBT to affirmation
- Never shame the user for struggle
- Never dismiss psychology in favor of faith or vice versa`;

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
- Label cognitive distortions using Islamic-aligned language
- Separate belief from feeling
- The standard for accurate thinking is Islamic truth, not personal preference

DISTORTIONS TO IDENTIFY (choose 1-2 that fit best):
${DISTORTIONS.map((d) => `- ${d}`).join("\n")}

RESPONSE RULES:
- Never shame or preach
- Never invalidate the emotion behind the thought
- Distinguish the valid feeling from the potentially distorted interpretation
- Be brief and gentle in your analysis

Respond with a JSON object containing:
- distortions: array of 1-2 distortion names from the list above
- analysis: a brief (2-3 sentences), gentle explanation. Validate the emotional experience while noting the cognitive pattern that may need examination.`,
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

YOUR TASK: Generate an Islamic cognitive reframe for the user's thought.

QURAN USAGE RULES:
- Use meaning-based references rather than long quotations
- Never take verses out of context
- Never weaponize verses to shame or silence emotion
- Prioritize themes of mercy, patience, reliance, accountability, hope, and return

Thematic anchors you may draw from:
- Allah is closer than perceived distance
- Mercy exceeds sin
- Effort is required but outcomes are not owned
- Hardship contains ease even if unseen
- Hearts fluctuate and return is always open

HADITH USAGE RULES:
- Only reference well-established authentic narrations
- Focus on meanings, not legal rulings
- Emphasize mercy, balance, moderation, intention, and emotional realism
- Avoid fear-based framing unless contextually necessary

You are guiding cognition, not issuing fatwas.

The user's distortions: ${distortions.join(", ")}

Respond with a JSON object containing:
- reframe: A concise (3-4 sentences) reframe that corrects the belief error while validating the emotion. Ground it in Islamic wisdom without preaching.
- source: A brief mention of the Islamic concept or principle referenced (e.g., "Tawakkul" or "Divine closeness")`,
          },
          {
            role: "user",
            content: `Original thought: ${thought}\n\nAnalysis: ${analysis}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message?.content || "{}";
      const result = JSON.parse(content);

      res.json({
        reframe:
          result.reframe ||
          "Your feelings acknowledge a real challenge. And Allah has promised that with every hardship comes ease. Your role is effort; the outcome belongs to Him.",
        source: result.source || "Tawakkul - Trust in Allah's decree",
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

YOUR TASK: Generate a short regulation practice (under 2 minutes) to help the reframe settle in the user's heart.

The practice should:
- Calm the nervous system
- Connect the qalb (heart) to the reframe
- Support the ruh's orientation toward meaning and surrender
- Be simple and achievable in under 2 minutes

PRACTICE TYPES (choose one that fits the reframe):
1. Slow breathing with dhikr (e.g., breathe in for 4, hold for 4, breathe out for 4, repeating SubhanAllah or Alhamdulillah)
2. Grounded remembrance (brief reflection on Allah's attributes relevant to the situation - Al-Wadud, Ar-Rahman, Al-Lateef, etc.)
3. Gratitude recall (identifying 3 specific blessings, cultivating shukr)

The tone should be calm and inviting, not commanding.

Respond with a JSON object containing:
- title: Short name for the practice (e.g., "Dhikr Breathing" or "Gratitude Remembrance")
- instructions: Clear, gentle instructions (4-6 sentences). Guide, don't lecture.
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
          "Close your eyes and take a slow, deep breath in through your nose for 4 counts. Hold gently for 4 counts. Release slowly through your mouth for 4 counts. As you exhale, silently say 'SubhanAllah.' Repeat this 4 times, letting each breath release tension and invite peace.",
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
