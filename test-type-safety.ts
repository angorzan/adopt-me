// Test type safety for feature flags
import { isFeatureEnabled, type FeatureName } from "./src/features/index.ts";

// ✅ These should work (valid flags)
const _authEnabled: boolean = isFeatureEnabled("auth");
const _collectionsEnabled: boolean = isFeatureEnabled("collections");

// ❌ This should cause TypeScript error (invalid flag)
// Uncomment the line below to see the error:
// const invalidFlag = isFeatureEnabled('invalid-flag');

// ✅ Type-safe flag names
const validFlags: FeatureName[] = ["auth", "collections"];
validFlags.forEach((flag) => {
  isFeatureEnabled(flag);
});

// ❌ This should cause TypeScript error (invalid flag in array)
// Uncomment the line below to see the error:
// const invalidFlags: FeatureName[] = ['auth', 'invalid-flag'];
