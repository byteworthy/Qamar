import { useState } from 'react';
import { useStudyPlanStore } from '@/stores/study-plan-store';
import type { StudyPlanInput } from '../../shared/types/study-plan';

export function useStudyPlan() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);

  const { currentPlan, setCurrentPlan, completeTask, uncompleteTask } = useStudyPlanStore();

  const generatePlan = async (input: StudyPlanInput) => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/study-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate study plan');
      }

      const data = await response.json();
      setCurrentPlan(data.plan);
      setRemainingQuota(data.remainingQuota);

      return data.plan;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    currentPlan,
    generatePlan,
    completeTask,
    uncompleteTask,
    isGenerating,
    error,
    remainingQuota,
  };
}
