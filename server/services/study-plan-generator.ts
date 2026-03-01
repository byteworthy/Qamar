// server/services/study-plan-generator.ts
import Anthropic from "@anthropic-ai/sdk";
import type {
  StudyPlanInput,
  WeeklyPlan,
  DailyTask,
} from "../../shared/types/study-plan";
import { randomUUID } from "crypto";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a Quran study plan generator for the Qamar app.

Generate a 7-day weekly study plan as valid JSON matching this schema:

{
  "tasks": [
    {
      "dayOfWeek": 0-6,
      "title": "Brief task title",
      "description": "Detailed instructions",
      "estimatedMinutes": number,
      "screenDeepLink": "ScreenName?params"
    }
  ]
}

Available screens and parameters:
- VerseReader?surahId={1-114}&startVerse={n}&endVerse={m}
- HifzRecitation?surahNumber={n}&verseNumber={m}
- ArabicTutor (no params)
- TajweedGuide (no params)

Guidelines:
- Respect time commitment (distribute minutes across 7 days)
- Adapt difficulty to skill level (beginner = slower pace, more review)
- Include variety: reading, memorization, review, reflection
- For memorization goals: use spaced repetition (review previous verses)
- Be realistic and achievable
- Return ONLY valid JSON, no markdown`;

export async function generateWeeklyPlan(
  input: StudyPlanInput,
): Promise<WeeklyPlan> {
  const userPrompt = buildUserPrompt(input);

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const tasksData = JSON.parse(content.text);

  const tasks: DailyTask[] = tasksData.tasks.map((t: any) => ({
    id: randomUUID(),
    dayOfWeek: t.dayOfWeek,
    title: t.title,
    description: t.description,
    estimatedMinutes: t.estimatedMinutes,
    screenDeepLink: t.screenDeepLink,
    completed: false,
  }));

  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - now.getDay() + 1); // Next Monday

  return {
    id: randomUUID(),
    createdAt: Date.now(),
    weekStartDate: monday.toISOString().split("T")[0],
    goal: input.goal,
    customGoalText: input.customGoalText,
    timeCommitment: input.timeCommitment,
    skillLevel: input.skillLevel,
    tasks,
    completionRate: 0,
    streak: 0,
  };
}

function buildUserPrompt(input: StudyPlanInput): string {
  let prompt = `Generate a weekly Quran study plan:\n\n`;

  if (input.goal === "memorize_juz_30") {
    prompt += `Goal: Memorize Juz 30 (Juz 'Amma)\n`;
  } else if (input.goal === "read_entire_quran") {
    prompt += `Goal: Read the entire Quran in one year\n`;
  } else if (input.goal === "understand_specific_surah") {
    prompt += `Goal: Deeply understand Surah ${input.specificSurah}\n`;
  } else if (input.goal === "improve_tajweed") {
    prompt += `Goal: Improve tajweed (pronunciation rules)\n`;
  } else if (input.goal === "custom") {
    prompt += `Goal: ${input.customGoalText}\n`;
  }

  prompt += `Time commitment: ${input.timeCommitment} per day\n`;
  prompt += `Skill level: ${input.skillLevel}\n\n`;
  prompt += `Generate tasks for all 7 days (Sunday=0 through Saturday=6).`;

  return prompt;
}
