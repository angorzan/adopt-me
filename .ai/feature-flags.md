# Feature Flags Implementation Plan

## Goal
Separate deployments from releases using static, build-time feature flags available on both frontend (Astro / React) and backend (API routes & middleware).

## Requirements
1. Flags defined once per environment (`local`, `integration`, `production`).
2. Boolean values only (on/off).
3. Accessed via TypeScript helper: `isFeatureEnabled("flag")`.
4. Must work in:
   - Astro pages (`login`, `signup`, `reset-password`, …)
   - API endpoints & middleware
5. Environment resolved using:
   - Browser / client: `import.meta.env.PUBLIC_ENV_NAME`
   - Server / SSR: `process.env.ENV_NAME`
6. Provide console logs for each flag lookup for easier debugging.

## Module (`src/features/index.ts`)
```ts
export type EnvName = "local" | "integration" | "production";
export type FeatureName = "auth" | "collections" | (string & {});

export const FEATURE_CONFIG = {
  local: { auth: true, collections: true },
  integration: { auth: true, collections: true },
  production: { auth: true, collections: false },
} as const;

export function getCurrentEnvironment(): EnvName {
  const envClient = (import.meta as any).env?.PUBLIC_ENV_NAME as string | undefined;
  const envServer = typeof process !== "undefined" ? process.env.ENV_NAME : undefined;
  const name = (envClient || envServer || "local").toLowerCase();
  if (name.startsWith("prod")) return "production";
  if (name.startsWith("int")) return "integration";
  if (name === "local") return "local";
  console.warn(`[FeatureFlags] Unknown ENV_NAME='${name}' – defaulting to 'local'`);
  return "local";
}

export function isFeatureEnabled(flag: FeatureName): boolean {
  const env = getCurrentEnvironment();
  const enabled = FEATURE_CONFIG[env]?.[flag] ?? false;
  console.log(`[FeatureFlags] env=%s flag=%s enabled=%s`, env, flag, enabled);
  if (FEATURE_CONFIG[env]?.[flag] === undefined) {
    console.warn(`[FeatureFlags] Flag '${flag}' not defined for env='${env}' – returning false`);
  }
  return enabled;
}
```

## Usage Examples
### Astro Page
```astro
---
import { isFeatureEnabled } from "@/features";
if (!isFeatureEnabled("collections")) {
  return Astro.redirect("/404");
}
---
```

### API Endpoint
```ts
import type { APIRoute } from "astro";
import { isFeatureEnabled } from "@/features";

export const GET: APIRoute = () => {
  if (!isFeatureEnabled("auth")) {
    return new Response("Feature disabled", { status: 404 });
  }
  // ...normal logic
};
```

## Next Steps
1. Update `.env.example` with `PUBLIC_ENV_NAME` placeholder.
2. Add runtime checks in key pages/components.
3. (Future) Extend with remote overrides (cookies, database) if needed.
