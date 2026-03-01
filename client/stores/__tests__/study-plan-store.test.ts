import { renderHook, act, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useStudyPlanStore } from "../study-plan-store";
import type { WeeklyPlan } from "@/shared/types/study-plan";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe("useStudyPlanStore", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    const { result } = renderHook(() => useStudyPlanStore());
    await act(async () => {
      result.current.clearPlan();
    });
  });

  test("sets current plan", () => {
    const { result } = renderHook(() => useStudyPlanStore());
    const mockPlan: WeeklyPlan = {
      id: "plan-1",
      createdAt: Date.now(),
      weekStartDate: "2026-02-17",
      goal: "memorize_juz_30",
      timeCommitment: "20min",
      skillLevel: "intermediate",
      tasks: [
        {
          id: "task-1",
          dayOfWeek: 0,
          title: "Test task",
          description: "Description",
          estimatedMinutes: 20,
          screenDeepLink: "VerseReader",
          completed: false,
        },
      ],
      completionRate: 0,
      streak: 0,
    };

    act(() => {
      result.current.setCurrentPlan(mockPlan);
    });

    expect(result.current.currentPlan).toMatchObject({ id: "plan-1" });
  });

  test("completes task and updates completion rate", () => {
    const { result } = renderHook(() => useStudyPlanStore());
    const mockPlan: WeeklyPlan = {
      id: "plan-1",
      createdAt: Date.now(),
      weekStartDate: "2026-02-17",
      goal: "memorize_juz_30",
      timeCommitment: "20min",
      skillLevel: "intermediate",
      tasks: [
        {
          id: "task-1",
          dayOfWeek: 0,
          title: "Task 1",
          description: "Description",
          estimatedMinutes: 20,
          screenDeepLink: "VerseReader",
          completed: false,
        },
        {
          id: "task-2",
          dayOfWeek: 1,
          title: "Task 2",
          description: "Description",
          estimatedMinutes: 20,
          screenDeepLink: "VerseReader",
          completed: false,
        },
      ],
      completionRate: 0,
      streak: 0,
    };

    act(() => {
      result.current.setCurrentPlan(mockPlan);
      result.current.completeTask("task-1");
    });

    expect(result.current.currentPlan?.tasks[0].completed).toBe(true);
    expect(result.current.currentPlan?.completionRate).toBe(50); // 1 of 2 tasks
  });
});
