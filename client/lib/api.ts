import { getApiUrl, apiRequest } from "./query-client";

interface AnalysisResult {
  distortions: string[];
  analysis: string;
}

interface ReframeResult {
  reframe: string;
  source: string;
}

interface PracticeResult {
  title: string;
  instructions: string;
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
