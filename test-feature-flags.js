// Quick test script for feature flags
import { isFeatureEnabled, getCurrentEnvironment } from "./src/features/index.ts";

console.log("=== Feature Flags Test ===");

// Test environment detection
console.log("Current environment:", getCurrentEnvironment());

// Test feature flags
console.log("Auth enabled:", isFeatureEnabled("auth"));
console.log("Collections enabled:", isFeatureEnabled("collections"));
console.log("Non-existent flag:", isFeatureEnabled("non-existent"));

console.log("=== Test completed ===");
