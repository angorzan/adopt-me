export type EnvName = "local" | "integration" | "production";

/**
 * Static configuration of feature flags per environment.
 * WARNING: Build-time only – runtime modifications are not supported.
 */
export const FEATURE_CONFIG = {
  local: {
    auth: true,
    collections: true,
  },
  integration: {
    auth: true,
    collections: true,
  },
  production: {
    auth: true,
    collections: false,
  },
} as const;

/**
 * Feature flag names derived from the configuration.
 * This ensures type safety - only defined flags can be used.
 */
export type FeatureName = keyof typeof FEATURE_CONFIG.local;

/**
 * Mapping of feature flags for a single environment.
 */
export type FeatureFlags = Record<FeatureName, boolean>;

/**
 * Attempt to resolve current environment using both server (process.env) and
 * client (import.meta.env) variables. Defaults to "local".
 */
export function getCurrentEnvironment(): EnvName {
  // According to Astro environment variable conventions:
  // - Variables prefixed with PUBLIC_ are exposed to the client and server.
  // - Non-prefixed variables are only available on the server.

  const envFromClient = (import.meta as unknown as Record<string, unknown>).env?.PUBLIC_ENV_NAME as string | undefined;
  const envFromServer = typeof process !== "undefined" ? process.env.ENV_NAME : undefined;

  const name = (envFromClient || envFromServer || "local").toLowerCase();

  if (name.startsWith("prod")) return "production";
  if (name.startsWith("int")) return "integration";
  if (name === "local") return "local";

  // Fallback to local for unknown values, but log a warning.
  /* eslint-disable no-console */
  console.warn(`[FeatureFlags] Unknown ENV_NAME="${name}" – defaulting to "local"`);
  return "local";
}

/**
 * Check whether a feature flag is enabled for the current environment.
 *
 * @param flagName – Name of the feature, e.g. "auth" or "collections".
 * @returns Boolean indicating if the feature is active.
 */
export function isFeatureEnabled(flagName: FeatureName): boolean {
  const env = getCurrentEnvironment();
  const featureFlags = FEATURE_CONFIG[env] ?? {};
  const enabled = featureFlags[flagName] ?? false;

  /* eslint-disable no-console */
  console.log(`[FeatureFlags] env=%s flag=%s enabled=%s`, env, flagName, enabled);

  if (featureFlags[flagName] === undefined) {
    console.warn(`[FeatureFlags] Flag "${flagName}" not defined for env="${env}" – returning false`);
  }

  return enabled;
}
