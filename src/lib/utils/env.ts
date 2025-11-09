/**
 * Helper to safely access environment variables
 * Workaround for TypeScript import.meta.env errors
 */
export function getEnv(key: string): string {
  // @ts-expect-error - import.meta.env is available in Astro but TypeScript doesn't know about it
  return import.meta.env[key] as string;
}

export function isProd(): boolean {
  // @ts-expect-error - import.meta.env.PROD is available in Astro
  return import.meta.env.PROD === true;
}
