import { EventEmitter } from "eventemitter3";
import Ajv from "ajv";
import { encoding_for_model } from "tiktoken";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ChatOptions,
  ModelInfo,
  UsageStats,
  OpenRouterServiceConfig,
  AILogEntry,
  JsonSchemaFormat,
} from "../types/openrouter.types";
import { OpenRouterError, ValidationError } from "../types/openrouter.types";

// Service implementation
export class OpenRouterService {
  // Private fields
  readonly #supabase: SupabaseClient;
  readonly #key: string;
  readonly #baseUrl: string;
  readonly #defaultModel: string;
  readonly #timeout: number;
  readonly #maxRetries = 3;
  readonly #maxTokenLength = 4096;
  readonly #ajv: Ajv;
  readonly #encodingCache = new Map<string, unknown>();

  // Event emitter for error tracking
  public readonly onError = new EventEmitter<"openrouter-error">();

  // Model-specific token encoders
  readonly #tokenModel = "gpt-4" as const;
  readonly #modelMappings: Record<string, "gpt-4"> = {
    "gpt-4o-1106-preview": "gpt-4",
    "claude-2": "gpt-4",
    "claude-instant-1": "gpt-4",
    "mistral-7b-instruct": "gpt-4",
    "llama-2-70b-chat": "gpt-4",
  };

  constructor(opts: OpenRouterServiceConfig) {
    // Validate required fields
    if (!opts.apiKey) throw new Error("OpenRouter API key is required");
    if (!opts.supabase) throw new Error("Supabase client is required");

    // Initialize private fields
    this.#supabase = opts.supabase;
    this.#key = opts.apiKey;
    this.#baseUrl = opts.baseUrl ?? "https://openrouter.ai/api/v1/chat/completions";
    this.#defaultModel = opts.defaultModel ?? "gpt-4o-1106-preview";
    this.#timeout = opts.timeoutMs ?? 30_000;

    // Initialize Ajv with strict mode and custom error messages
    this.#ajv = new Ajv({
      strict: true,
      allErrors: true,
      verbose: true,
      messages: true,
      code: {
        esm: true,
        source: true,
      },
    });
  }

  // Public methods
  public async chatCompletion(options: ChatOptions): Promise<Response> {
    try {
      // 1. Validate input
      this.#validateInput(options);

      // 2. Build payload
      const payload = await this.#buildPayload(options);

      // 3. Send request with retries
      const response = await this.#send(payload, options.stream);

      // 4. Handle streaming if enabled
      if (options.stream) {
        return this.#handleStream(response);
      }

      // 5. Validate and return response
      const data = await response.json();
      await this.#validateResponse(data, options.responseFormat);
      await this.#log({
        user_id: options.userId,
        model: options.model ?? this.#defaultModel,
        prompt: options.userMessage,
        response: data,
      });

      return new Response(JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      // Handle errors and emit events
      if (error instanceof OpenRouterError) {
        this.onError.emit("openrouter-error", error);
        throw error;
      }

      // Wrap unknown errors
      const wrapped = new OpenRouterError(error instanceof Error ? error.message : "Unknown error", "unknown_error");
      this.onError.emit("openrouter-error", wrapped);
      throw wrapped;
    }
  }

  public async getModels(): Promise<ModelInfo[]> {
    try {
      // Try to get models from cache
      const { data: cache } = await this.#supabase.from("model_cache").select("*").single();

      // Check if cache is valid
      if (cache && new Date(cache.expires_at) > new Date()) {
        return cache.models;
      }

      // Fetch fresh models from API
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${this.#key}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new OpenRouterError("Failed to fetch models", "api_error", response.status);
      }

      const models = (await response.json()) as ModelInfo[];

      // Update cache with 24h TTL
      const now = new Date();
      const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await this.#supabase.from("model_cache").upsert(
        {
          id: "default",
          models,
          updated_at: now.toISOString(),
          expires_at: expires.toISOString(),
        },
        {
          onConflict: "id",
        }
      );

      return models;
    } catch (error) {
      // Log error but don't fail - return empty array
      this.onError.emit("openrouter-error", error instanceof Error ? error : new Error("Unknown error"));
      return [];
    }
  }

  public async usage(userId: string): Promise<UsageStats> {
    // TODO: Implement usage stats from ai_usage table
    void userId; // Mark as intentionally unused for future implementation
    throw new Error("Not implemented");
  }

  // Private methods
  async #validateInput(options: ChatOptions): Promise<void> {
    // Get token count for messages
    const tokenCount = await this.#countTokens(
      options.model ?? this.#defaultModel,
      options.userMessage,
      options.systemMessage
    );

    if (tokenCount > this.#maxTokenLength) {
      throw new OpenRouterError(
        `Message too long (${tokenCount} tokens, max ${this.#maxTokenLength})`,
        "message_too_long",
        413
      );
    }

    // Validate system message if present
    if (options.systemMessage) {
      const systemPrefix = "You are a helpful adoption assistant";
      if (!options.systemMessage.startsWith(systemPrefix)) {
        throw new OpenRouterError(
          "Invalid system message - must start with approved prefix",
          "invalid_system_message",
          400
        );
      }
    }
  }

  async #countTokens(model: string, ...texts: (string | undefined)[]): Promise<number> {
    try {
      // Map model to supported encoding model
      const encodingModel = this.#modelMappings[model] ?? this.#tokenModel;

      // Check cache first
      let enc = this.#encodingCache.get(encodingModel);
      if (!enc) {
        enc = await encoding_for_model(encodingModel);
        this.#encodingCache.set(encodingModel, enc);
      }

      // Count tokens for all texts
      let total = 0;
      for (const text of texts) {
        if (text) {
          const tokens = enc.encode(text);
          total += tokens.length;
        }
      }

      return total;
    } catch (_error) {
      // Fallback to rough estimation
      return Math.ceil(texts.reduce((sum, text) => sum + (text?.length ?? 0), 0) / 4);
    }
  }

  async #buildPayload(options: ChatOptions): Promise<unknown> {
    return {
      model: options.model ?? this.#defaultModel,
      messages: [
        ...(options.systemMessage
          ? [
              {
                role: "system",
                content: options.systemMessage,
              },
            ]
          : []),
        {
          role: "user",
          content: options.userMessage,
        },
      ],
      ...(options.parameters && Object.keys(options.parameters).length > 0 ? options.parameters : {}),
      ...(options.responseFormat ? { response_format: options.responseFormat } : {}),
    };
  }

  async #send(payload: unknown, stream = false): Promise<Response> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.#maxRetries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.#timeout);

        const response = await fetch(this.#baseUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.#key}`,
            ...(stream ? { Accept: "text/event-stream" } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        // Handle rate limits and server errors
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
          continue;
        }

        // Handle other errors
        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: "Unknown error" }));
          throw new OpenRouterError(error.message || "Request failed", "api_error", response.status);
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Don't retry client errors
        if (error instanceof OpenRouterError && error.status && error.status < 500) {
          throw error;
        }

        attempt++;
        if (attempt === this.#maxRetries) break;

        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError ?? new Error("Max retries exceeded");
  }

  #handleStream(response: Response): Response {
    // Return response as-is for streaming
    return response;
  }

  async #validateResponse(data: unknown, schema?: JsonSchemaFormat): Promise<void> {
    if (!schema) return;

    try {
      // Get or compile validator for this schema
      const validate = this.#ajv.getSchema(schema.json_schema.name) ?? this.#ajv.compile(schema.json_schema.schema);

      // Validate data
      const valid = validate(data);

      if (!valid) {
        const errors = validate.errors?.map((err) => ({
          path: err.instancePath,
          message: err.message,
          params: err.params,
        }));

        throw new ValidationError(`Response validation failed: ${errors?.[0]?.message ?? "Unknown error"}`, {
          data,
          errors,
        });
      }
    } catch (error) {
      // If error is already ValidationError, rethrow
      if (error instanceof ValidationError) throw error;

      // Otherwise wrap in ValidationError
      throw new ValidationError(error instanceof Error ? error.message : "Schema validation failed", { data, error });
    }
  }

  async #log(data: Omit<AILogEntry, "created_at" | "tokens">): Promise<void> {
    try {
      // Count tokens
      const tokenCount = await this.#countTokens(data.model, data.prompt);

      // Log to ai_logs table
      await this.#supabase.from("ai_logs").insert({
        user_id: data.user_id,
        model: data.model,
        prompt: data.prompt,
        response: data.response,
        tokens: tokenCount,
        created_at: new Date().toISOString(),
      });

      // Update ai_usage table
      await this.#supabase.rpc("increment_ai_usage", {
        p_user_id: data.user_id,
        p_tokens: tokenCount,
      });
    } catch (_error) {
      // Non-blocking - don't throw
    }
  }
}
