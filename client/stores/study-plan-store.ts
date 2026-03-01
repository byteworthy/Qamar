import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WeeklyPlan, DailyTask } from "../../shared/types/study-plan";

interface StudyPlanState {
  currentPlan: WeeklyPlan | null;
  setCurrentPlan: (plan: WeeklyPlan) => void;
  completeTask: (taskId: string) => void;
  uncompleteTask: (taskId: string) => void;
  updateCompletionRate: () => void;
  clearPlan: () => void;
}

export const useStudyPlanStore = create<StudyPlanState>()(
  persist(
    (set, get) => ({
      currentPlan: null,

      setCurrentPlan: (plan) => {
        set({ currentPlan: plan });
      },

      completeTask: (taskId) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedTasks = currentPlan.tasks.map((task: DailyTask) =>
          task.id === taskId
            ? { ...task, completed: true, completedAt: Date.now() }
            : task,
        );

        set({
          currentPlan: {
            ...currentPlan,
            tasks: updatedTasks,
          },
        });

        get().updateCompletionRate();
      },

      uncompleteTask: (taskId) => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const updatedTasks = currentPlan.tasks.map((task: DailyTask) =>
          task.id === taskId
            ? { ...task, completed: false, completedAt: undefined }
            : task,
        );

        set({
          currentPlan: {
            ...currentPlan,
            tasks: updatedTasks,
          },
        });

        get().updateCompletionRate();
      },

      updateCompletionRate: () => {
        const { currentPlan } = get();
        if (!currentPlan) return;

        const completedCount = currentPlan.tasks.filter(
          (t: DailyTask) => t.completed,
        ).length;
        const completionRate = Math.round(
          (completedCount / currentPlan.tasks.length) * 100,
        );

        set({
          currentPlan: {
            ...currentPlan,
            completionRate,
          },
        });
      },

      clearPlan: () => {
        set({ currentPlan: null });
      },
    }),
    {
      name: "noor-study-plan",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
