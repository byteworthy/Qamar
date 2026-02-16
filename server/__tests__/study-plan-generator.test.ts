// server/__tests__/study-plan-generator.test.ts
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { generateWeeklyPlan } from '../services/study-plan-generator';
import type { StudyPlanInput } from '../../shared/types/study-plan';

// Mock Anthropic
let mockAnthropicCreate: any;
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      get create() {
        return mockAnthropicCreate;
      },
    },
  }));
});

describe('generateWeeklyPlan', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Claude response
    mockAnthropicCreate = jest.fn(() => Promise.resolve({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            tasks: [
              {
                dayOfWeek: 0,
                title: 'Sunday: Review Surah An-Nas',
                description: 'Practice recitation with tajweed',
                estimatedMinutes: 20,
                screenDeepLink: 'HifzRecitation?surahNumber=114&verseNumber=1',
              },
              {
                dayOfWeek: 1,
                title: 'Monday: Memorize Al-Falaq verses 1-2',
                description: 'Learn first two verses',
                estimatedMinutes: 20,
                screenDeepLink: 'HifzRecitation?surahNumber=113&verseNumber=1',
              },
              {
                dayOfWeek: 2,
                title: 'Tuesday: Review Al-Falaq',
                description: 'Consolidate yesterday\'s memorization',
                estimatedMinutes: 20,
                screenDeepLink: 'HifzRecitation?surahNumber=113&verseNumber=1',
              },
              {
                dayOfWeek: 3,
                title: 'Wednesday: Memorize Al-Ikhlas',
                description: 'Complete surah memorization',
                estimatedMinutes: 20,
                screenDeepLink: 'HifzRecitation?surahNumber=112&verseNumber=1',
              },
              {
                dayOfWeek: 4,
                title: 'Thursday: Review all three surahs',
                description: 'Recite An-Nas, Al-Falaq, Al-Ikhlas',
                estimatedMinutes: 20,
                screenDeepLink: 'HifzRecitation?surahNumber=114&verseNumber=1',
              },
              {
                dayOfWeek: 5,
                title: 'Friday: Tajweed practice',
                description: 'Focus on pronunciation rules',
                estimatedMinutes: 20,
                screenDeepLink: 'TajweedGuide',
              },
              {
                dayOfWeek: 6,
                title: 'Saturday: Full week review',
                description: 'Test retention of all surahs',
                estimatedMinutes: 20,
                screenDeepLink: 'HifzRecitation?surahNumber=112&verseNumber=1',
              },
            ],
          }),
        },
      ],
    }));
  });

  test('generates 7-day plan with tasks', async () => {
    const input: StudyPlanInput = {
      goal: 'memorize_juz_30',
      timeCommitment: '20min',
      skillLevel: 'intermediate',
    };

    const plan = await generateWeeklyPlan(input);

    expect(plan.tasks).toHaveLength(7);
    expect(plan.tasks[0].dayOfWeek).toBe(0); // Sunday
    expect(plan.tasks[0].title).toBeTruthy();
    expect(plan.tasks[0].screenDeepLink).toBeTruthy();
    expect(plan.goal).toBe('memorize_juz_30');
    expect(plan.timeCommitment).toBe('20min');
    expect(plan.skillLevel).toBe('intermediate');
    expect(plan.completionRate).toBe(0);
    expect(plan.streak).toBe(0);
  });
});
