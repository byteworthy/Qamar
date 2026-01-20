/**
 * AI Provider Adapter for Noor CBT
 *
 * Provides a single interface for all AI model calls.
 * Currently implements Anthropic Claude adapter.
 * All calls route through the safety orchestrator.
 */

import Anthropic from "@anthropic-ai/sdk";
import { config, VALIDATION_MODE, isAIConfigured } from "./config";

// =============================================================================
// AI PROVIDER INTERFACE
// =============================================================================

export interface AIGenerateOptions {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AIGenerateResult {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface AIProvider {
  generateResponse(options: AIGenerateOptions): Promise<AIGenerateResult>;
  moderateInput(text: string): Promise<{ safe: boolean; reason?: string }>;
}

// =============================================================================
// CLAUDE ADAPTER
// =============================================================================

class ClaudeAdapter implements AIProvider {
  private client: Anthropic;
  private model: string;
  private maxRetries: number;
  private timeout: number;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
    this.model = config.aiModel || "claude-sonnet-4-20250514";
    this.maxRetries = config.aiMaxRetries || 3;
    this.timeout = config.aiTimeoutMs || 30000;
  }

  async generateResponse(options: AIGenerateOptions): Promise<AIGenerateResult> {
    const startTime = Date.now();

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: options.maxTokens || 1024,
      system: options.systemPrompt,
      messages: [
        {
          role: "user",
          content: options.userMessage,
        },
      ],
    });

    const latencyMs = Date.now() - startTime;

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === "text");
    const content = textContent?.type === "text" ? textContent.text : "";

    return {
      content,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      latencyMs,
    };
  }

  async moderateInput(text: string): Promise<{ safe: boolean; reason?: string }> {
    // Claude doesn't have a separate moderation endpoint
    // We rely on our built-in safety system for moderation
    // This is a passthrough that could be enhanced with Claude's refusal detection
    return { safe: true };
  }
}

// =============================================================================
// MOCK ADAPTER (FOR VALIDATION MODE)
// =============================================================================

class MockAIAdapter implements AIProvider {
  async generateResponse(options: AIGenerateOptions): Promise<AIGenerateResult> {
    return {
      content: JSON.stringify({
        placeholder: true,
        message: "[VALIDATION MODE] Configure ANTHROPIC_API_KEY for real responses",
      }),
      model: "mock-model",
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: 0,
    };
  }

  async moderateInput(_text: string): Promise<{ safe: boolean; reason?: string }> {
    return { safe: true };
  }
}

// =============================================================================
// AI PROVIDER FACTORY
// =============================================================================

let aiProviderInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (aiProviderInstance) {
    return aiProviderInstance;
  }

  if (VALIDATION_MODE || !isAIConfigured()) {
    aiProviderInstance = new MockAIAdapter();
  } else {
    aiProviderInstance = new ClaudeAdapter();
  }

  return aiProviderInstance;
}

/**
 * Reset provider instance (useful for testing)
 */
export function resetAIProvider(): void {
  aiProviderInstance = null;
}

// =============================================================================
// CONVENIENCE WRAPPER
// =============================================================================

/**
 * Generate AI response through the provider
 * This should be called AFTER safety orchestration
 */
export async function generateAIResponse(
  options: AIGenerateOptions
): Promise<AIGenerateResult> {
  const provider = getAIProvider();
  return provider.generateResponse(options);
}

/**
 * Log AI metrics for monitoring
 */
export function logAIMetrics(result: AIGenerateResult, endpoint: string): void {
  if (process.env.NODE_ENV === "development") {
    console.log(`[AI Metrics] ${endpoint}:`, {
      model: result.model,
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    });
  }
}
