// Test type safety for feature flags
import { isFeatureEnabled, type FeatureName } from "./src/features/index.ts";

console.log("=== Type Safety Test ===");

// ✅ These should work (valid flags)
const authEnabled: boolean = isFeatureEnabled("auth");
const collectionsEnabled: boolean = isFeatureEnabled("collections");

console.log("Auth enabled:", authEnabled);
console.log("Collections enabled:", collectionsEnabled);

// ❌ This should cause TypeScript error (invalid flag)
// Uncomment the line below to see the error:
// const invalidFlag = isFeatureEnabled('invalid-flag');

// ✅ Type-safe flag names
const validFlags: FeatureName[] = ["auth", "collections"];
validFlags.forEach((flag) => {
  console.log(`${flag}:`, isFeatureEnabled(flag));
});

// ❌ This should cause TypeScript error (invalid flag in array)
// Uncomment the line below to see the error:
// const invalidFlags: FeatureName[] = ['auth', 'invalid-flag'];

console.log("=== Type Safety Test Completed ===");
