import Stripe from "stripe";

/**
 * Assert that required environment variables are set
 * Throws an error if any required env var is missing
 * Only checks at runtime, not during build
 */
function assertEnv() {
  // Skip check during build time
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    // Support both old and new env var names
    process.env.STRIPE_PRICE_PRO_MONTHLY ? "STRIPE_PRICE_PRO_MONTHLY" : "STRIPE_PRICE_ID_PRO",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Stripe environment variables: ${missing.join(", ")}`
    );
  }
}

// Don't assert env vars on module load - let API routes handle it at runtime
// This prevents build-time errors when env vars aren't available

// Use a fallback secret key during build to prevent errors
// Actual API routes will validate env vars at runtime
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_build_time_placeholder";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-10-29.clover" as any,
  typescript: true,
});

// Map our plan names to Stripe Price IDs
// Support both old and new env var names for backward compatibility
export const STRIPE_PRICE_IDS = {
  free: null, // Free plan doesn't need a price ID
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_ID_PRO || "",
  power: process.env.STRIPE_PRICE_POWER_MONTHLY || process.env.STRIPE_PRICE_ID_POWER || "",
} as const;

// Map Stripe Price IDs to our plan names (reverse lookup)
export function getPlanFromPriceId(priceId: string): "free" | "pro" | "power" | null {
  if (priceId === STRIPE_PRICE_IDS.pro) return "pro";
  if (priceId === STRIPE_PRICE_IDS.power) return "power";
  if (priceId === STRIPE_PRICE_IDS.free) return "free";
  return null;
}

// Get price ID from plan name
export function getPriceIdFromPlan(plan: "free" | "pro" | "power"): string | null {
  return STRIPE_PRICE_IDS[plan] || null;
}

// Export assertEnv for use in API routes if needed
export { assertEnv };

