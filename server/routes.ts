import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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
            content: `You are a compassionate Islamic cognitive behavioral therapy assistant. Your role is to identify cognitive distortions in thoughts while maintaining Islamic theological accuracy and emotional sensitivity.

IMPORTANT RULES:
- Never shame or preach
- Never invalidate emotions
- Separate the feeling (valid) from the truth claim (may be distorted)
- Use Islamic-aligned language for distortions

Available distortions to identify (choose 1-2 that fit best):
${DISTORTIONS.map((d) => `- ${d}`).join("\n")}

Respond with a JSON object containing:
- distortions: array of 1-2 distortion names from the list above
- analysis: a brief (2-3 sentences), gentle explanation of how these patterns appear in the thought. Be validating of the emotions while noting the cognitive pattern.`,
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
            content: `You are a compassionate Islamic cognitive behavioral therapy assistant. Generate an Islamic cognitive reframe for the user's thought.

IMPORTANT RULES:
- The reframe must correct the belief error
- Ground it in Quran or authentic hadith MEANING (not long quotations)
- Be emotionally validating without affirming the distortion
- Never preach or shame
- Emphasize trust in Allah, effort, and return
- Avoid fatalism and excessive self-blame

The user's distortions: ${distortions.join(", ")}

Respond with a JSON object containing:
- reframe: A concise (3-4 sentences) reframe that offers a truer perspective grounded in Islamic wisdom
- source: A brief mention of the Islamic concept or principle referenced (e.g., "Tawakkul - trust in Allah's plan" or "Quran concept of patience")`,
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
            content: `You are a compassionate Islamic cognitive behavioral therapy assistant. Generate a short regulation practice (under 2 minutes) to help the reframe land in the user's heart.

PRACTICE TYPES (choose one that fits the reframe):
1. Slow breathing with dhikr count (e.g., breathe in for 4, hold for 4, breathe out for 4, repeating SubhanAllah or Alhamdulillah)
2. Grounded remembrance (brief reflection on Allah's attributes relevant to the situation)
3. Gratitude recall (identifying 3 specific blessings related to the situation)

The practice should:
- Calm the nervous system
- Connect the heart to the reframe
- Be simple and achievable in under 2 minutes

Respond with a JSON object containing:
- title: Short name for the practice (e.g., "Dhikr Breathing" or "Gratitude Remembrance")
- instructions: Clear, gentle instructions for the practice (4-6 sentences)
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
