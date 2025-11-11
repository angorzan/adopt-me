import { expect, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
/* eslint-disable @typescript-eslint/no-empty-function */
global.IntersectionObserver = class IntersectionObserver {
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  disconnect(): void {}
  observe(): void {}
  unobserve(): void {}
} as unknown as typeof ResizeObserver;
/* eslint-enable @typescript-eslint/no-empty-function */

// Mock pointer capture methods for Radix UI components
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = vi.fn();
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = vi.fn();
}

// Mock scrollIntoView for Radix UI Select
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = vi.fn();
}

// Mock getAnimations for Radix UI components
if (!Element.prototype.getAnimations) {
  Element.prototype.getAnimations = vi.fn().mockReturnValue([]);
}

// Environment variables for tests
process.env.PUBLIC_SUPABASE_URL = "http://localhost:54321";
process.env.PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";

// Extend expect with custom matchers if needed
expect.extend({
  // Add custom matchers here if needed
});
