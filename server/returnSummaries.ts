import OpenAI from "openai";

interface ReflectionSummaryData {
  thought: string;
  distortions: string[];
  intention?: string;
}

interface ThemeSummary {
  summary: string;
  patterns: string[];
  generatedAt: Date;
}

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generateReturnSummary(
  reflections: ReflectionSummaryData[],
): Promise<ThemeSummary | null> {
  if (reflections.length < 3) {
    return null;
  }

  const recentReflections = reflections.slice(-7);

  const thoughtSummaries = recentReflections
    .map(
      (r, i) =>
        `Reflection ${i + 1}: "${r.thought.slice(0, 200)}..." | Patterns: ${r.distortions.join(", ")}`,
    )
    .join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 512,
      messages: [
        {
          role: "system",
          content: `You are a neutral observer reviewing a user's recent reflections.

YOUR TASK: Generate a brief summary paragraph that observes patterns across their reflections.

TONE:
- Wise, neutral observer
- No advice
- No encouragement
- No judgment
- Simply notice and name

CONSTRAINTS:
- One paragraph, 2-4 sentences
- Name recurring themes or patterns
- Do not prescribe solutions
- Do not use "you should" or "try to"
- Do not use spiritual flattery

EXAMPLE OUTPUT:
"These reflections return often to themes of provision and control—a sense that effort should guarantee outcome. There is also a recurring pattern of self-blame when circumstances do not shift. The heart seems to oscillate between exhaustion and renewed commitment."

Respond with a JSON object containing:
- summary: one paragraph observing patterns
- patterns: array of 2-4 short pattern names observed`,
        },
        {
          role: "user",
          content: thoughtSummaries,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const result = JSON.parse(content);

    return {
      summary: result.summary || "",
      patterns: result.patterns || [],
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error generating return summary:", error);
    return null;
  }
}

export function shouldGenerateSummary(
  reflectionCount: number,
  lastSummaryDate?: Date,
): boolean {
  if (reflectionCount < 5) {
    return false;
  }

  if (!lastSummaryDate) {
    return true;
  }

  const daysSinceLastSummary =
    (Date.now() - lastSummaryDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLastSummary >= 7 && reflectionCount >= 5;
}
