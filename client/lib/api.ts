import { getApiUrl, apiRequest } from "./query-client";

export interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
}

export interface ReframeResult {
  beliefTested: string;
  perspective: string;
  nextStep: string;
  anchors: string[];
}

export interface PracticeResult {
  title: string;
  steps: string[];
  reminder: string;
  duration: string;
}

export async function analyzeThought(thought: string): Promise<AnalysisResult> {
  const response = await apiRequest("POST", "/api/analyze", { thought });
  return response.json();
}

export async function generateReframe(
  thought: string,
  distortions: string[],
  analysis: string
): Promise<ReframeResult> {
  const response = await apiRequest("POST", "/api/reframe", {
    thought,
    distortions,
    analysis,
  });
  return response.json();
}

export async function generatePractice(reframe: string): Promise<PracticeResult> {
  const response = await apiRequest("POST", "/api/practice", { reframe });
  return response.json();
}
