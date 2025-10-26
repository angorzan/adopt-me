# OpenRouter Integration Service – Implementation Guide (v0.1.0)

> End-to-end plan for integrating OpenRouter LLM completions with the existing Astro 5 / React 19 / Supabase stack.

---

## 1. Service Overview
`OpenRouterService` jest jednolitym punktem dostępu do OpenRouter API. Zapewnia:
1. Konfigurację środowiskową (klucze, endpoint, time-outy).
2. Generowanie poprawnych zapytań (`system`, `user`, `model`, `parameters`, `response_format`).
3. Obsługę kolejkowania / limitów, retry z back-offem oraz cache’owanie.
4. Normalizację i walidację odpowiedzi (strict JSON schema).
5. Centralne logowanie i metryki (Supabase table `ai_logs`).

---

## 2. Constructor
```ts
class OpenRouterService {
  constructor(opts: {
    supabase: SupabaseClient
    apiKey: string      // taken from ENV
    baseUrl?: string    // defaults to https://openrouter.ai/api/v1/chat/completions
    defaultModel?: string
    timeoutMs?: number  // default 30_000
  })
}
```

---

## 3. Public Methods & Fields

| Method | Purpose | Signature |
| ------ | ------- | --------- |
| `chatCompletion()` | Single completion call (stream / non-stream) | `(options: ChatOptions) => Promise<ChatResponse>` |
| `getModels()` | Return cached list of available models (24h TTL) | `() => Promise<ModelInfo[]>` |
| `usage()` | Summarise token usage per user / day | `(userId: string) => Promise<UsageStats>` |
| `onError` | **Event Emitter** for centralized error tracking | `EventEmitter<'openrouter-error'>` |

**ChatOptions**
```ts
interface ChatOptions {
  userId: string
  userMessage: string
  systemMessage?: string
  model?: string            // gpt-4o-1106-preview, mistral-7b etc.
  parameters?: Partial<{
    temperature: number
    max_tokens: number
    top_p: number
    frequency_penalty: number
    presence_penalty: number
  }>
  responseFormat?: JsonSchemaFormat
  stream?: boolean
}
```

---

## 4. Private Methods & Fields

| Private | Responsibility |
| ------- | -------------- |
| `#buildPayload()` | Łączy wszystkie części komunikatu w payload zgodny z OpenRouter |
| `#send()` | Fetch with timeout, handles retries & exponential back-off |
| `#handleStream()` | Dekoduje `text/event-stream` i emituje tokeny |
| `#validateResponse()` | Waliduje JSON wg przekazanego `response_format` (ajv) |
| `#log()` | Zapisuje request/response do `ai_logs` w Supabase |
| **Fields** | `#supabase`, `#key`, `#baseUrl`, `#defaultModel`, `#timeout` |

---

## 5. Error Handling

| # | Scenario | Handling |
| - | -------- | -------- |
| 1 | **Network** (`ECONNRESET`, `ETIMEDOUT`) | 3 retrysy (1000 ms → 2000 ms → 4000 ms) następnie emit `openrouter-error`. |
| 2 | **5xx / 429** | Retry w/g nagłówka `Retry-After` lub exponential back-off. |
| 3 | **4xx (invalid_key, bad_request)** | Zwróć `OpenRouterError` z `code`, `message`. Nie retry. |
| 4 | **JSON schema validation fail** | Rzuci `ValidationError`, loguje `rawResponse`. |
| 5 | **Token quota exceeded** | Zwróć `UsageExceededError`, front-end pokazuje komunikat. |

---

## 6. Security Considerations

1. **API KEY** przechowywany w `.env` → `process.env.OPENROUTER_API_KEY`, nigdy nie wysyłany do klienta.
2. **RLS** dla tabeli `ai_logs` (wyłącznie admin).
3. Ograniczenie długości `userMessage` (< 4 k tokenów).
4. Sanitizacja `systemMessage` (bez wstrzyknięć prompt injection – whitelist prefix).
5. Rate-limit per user (np. 60 req/min) – tabela `ai_usage`, `supabase.functions.ratelimit()`.

---

## 7. Step-by-Step Deployment Plan

| Step | Action |
| ---- | ------ |
| **1** | **Env setup** – add `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL` (optional) to `.env` + Supabase secret store. |
| **2** | `src/lib/services/OpenRouterService.ts` – implement class per spec. |
| **3** | Install deps: `npm i undici ajv nanoid zod eventemitter3` |
| **4** | Create Supabase table **`ai_logs`**<br>`(id uuid, user_id uuid, model text, prompt text, response jsonb, tokens integer, created_at timestamptz)` + RLS. |
| **5** | Create Supabase table **`ai_usage`**<br>`(user_id uuid, day date, tokens integer)`; increment tokens in `#log()`. |
| **6** | Add server-side route `/api/ai/chat` (Astro)*<br>– Validate input via Zod.<br>– `new OpenRouterService().chatCompletion(...)`.<br>– Stream response to client. |
| **7** | **Response format example** – strict JSON schema (see below). |
| **8** | Front-end hook `useAIRecommendation()` → fetch `/api/ai/chat` (SSE). |
| **9** | Dashboard metrics page (admin) → query `ai_usage`, `ai_logs`. |
| **10**| Update **CHANGELOG** to `0.2.0-alpha`, bump `package.json` when merged. |

> \*Astro server route example in guide body.

---

## 8. OpenRouter Payload Elements

| Field | Usage |
| ----- | ----- |
| **System Message** | `systemMessage` param – np. `"You are a helpful adoption assistant."` |
| **User Message** | `userMessage` param – tekst od użytkownika. |
| **Model Name** | `model` param – domyślnie `gpt-4o-1106-preview`. |
| **Model Params** | `parameters` object – np. `{ temperature: 0.7, max_tokens: 512 }`. |
| **response_format** | strict schema as shown below. |

### Strict JSON Schema Example
```ts
const format: JsonSchemaFormat = {
  type: 'json_schema',
  json_schema: {
    name: 'AdoptionRecommendation',
    strict: true,
    schema: {
      type: 'object',
      properties: {
        dogId: { type: 'string' },
        score: { type: 'number', minimum: 0, maximum: 1 },
        rationale: { type: 'string' }
      },
      required: ['dogId', 'score']
    }
  }
};
```

---

## 9. Example Final Payload
```json
{
  "model": "mistral-7b-instruct",
  "messages": [
    { "role": "system", "content": "You are a helpful adoption assistant." },
    { "role": "user", "content": "Jaki pies będzie najlepszy dla aktywnej rodziny z dziećmi?" }
  ],
  "temperature": 0.7,
  "max_tokens": 512,
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "AdoptionRecommendation",
      "strict": true,
      "schema": {
        "type": "object",
        "properties": {
          "dogId": { "type": "string" },
          "score": { "type": "number" },
          "rationale": { "type": "string" }
        },
        "required": ["dogId", "score"]
      }
    }
  }
}
```

---

## 10. Next Steps Checklist
- [ ] Implement `OpenRouterService` class.
- [ ] Add `/api/ai/chat` server route.
- [ ] Create Supabase tables `ai_logs`, `ai_usage` + RLS.
- [ ] Write front-end hook `useAIRecommendation()`.
- [ ] QA: latency, error scenarios, cost tracking.

---

> **ETA:** 2 dev-days for initial integration + 1 day QA.
