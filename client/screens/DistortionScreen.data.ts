export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
}

export interface CrisisData {
  title: string;
  message: string;
  resources: CrisisResource[];
  islamicContext: string;
}

export interface AnalysisResult {
  distortions: string[];
  happening: string;
  pattern: string[];
  matters: string;
  // Crisis detection fields
  crisis?: boolean;
  level?: "emergency" | "urgent" | "concern";
  resources?: CrisisData;
}
