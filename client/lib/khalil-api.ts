/**
 * Khalil API Client
 *
 * Types and functions for communicating with the Khalil muhasaba endpoint.
 */

import { apiRequest } from "./query-client";

// =============================================================================
// TYPES
// =============================================================================

export interface KhalilTextBlock {
  type: "text";
  content: string;
}

export interface KhalilWaswasaBlock {
  type: "waswasa_card";
  whispers: string[];
  insight: string;
}

export interface KhalilBasiraBlock {
  type: "basira_card";
  whisper: string;
  clarity: string;
  ayahOrHadith?: string;
}

export interface KhalilDhikrBlock {
  type: "dhikr_card";
  title: string;
  steps: string[];
  duration: string;
}

export interface KhalilMuhasabaBlock {
  type: "muhasaba_card";
  summary: string;
  whispersFound: string[];
  clarity: string;
  duaForNext: string;
}

export type KhalilResponseBlock =
  | KhalilTextBlock
  | KhalilWaswasaBlock
  | KhalilBasiraBlock
  | KhalilDhikrBlock
  | KhalilMuhasabaBlock;

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

export interface KhalilResponse {
  sessionId: string;
  blocks: KhalilResponseBlock[];
  state: string;
  crisis?: boolean;
  crisisLevel?: "emergency" | "urgent";
  resources?: CrisisData;
}

// =============================================================================
// API
// =============================================================================

export async function sendKhalilMessage(
  message: string,
  sessionId?: string,
): Promise<KhalilResponse> {
  const response = await apiRequest("POST", "/api/khalil/message", {
    message,
    sessionId,
  });
  return response.json() as Promise<KhalilResponse>;
}
