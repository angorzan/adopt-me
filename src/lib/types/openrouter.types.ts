/**
 * OpenRouter API Types
 * @see https://openrouter.ai/docs
 */
import type { SupabaseClient } from "@supabase/supabase-js";

// Request types
export interface JsonSchemaFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: true;
    schema: Record<string, unknown>;
  };
}

export interface ChatOptions {
  userId: string;
  userMessage: string;
  systemMessage?: string;
  model?: string;
  parameters?: Partial<{
    temperature: number;
    max_tokens: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  }>;
  responseFormat?: JsonSchemaFormat;
  stream?: boolean;
}

// Response types
export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: number;
    completion: number;
  };
}

export interface UsageStats {
  userId: string;
  day: string;
  tokens: number;
}

// Error types
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public rawResponse: unknown
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UsageExceededError extends Error {
  constructor(message = "Token quota exceeded") {
    super(message);
    this.name = "UsageExceededError";
  }
}

// Database types
export interface AILogEntry {
  user_id: string;
  model: string;
  prompt: string;
  response: unknown;
  tokens: number;
  created_at: string;
}

export interface AIUsageEntry {
  user_id: string;
  day: string;
  tokens: number;
}

export interface ModelCacheEntry {
  id: string;
  models: ModelInfo[];
  updated_at: string;
  expires_at: string;
}

// Service configuration
export interface OpenRouterServiceConfig {
  supabase: SupabaseClient;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  timeoutMs?: number;
}
