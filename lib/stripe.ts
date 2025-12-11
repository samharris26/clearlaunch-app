import Stripe from "stripe";

/**
 * Assert that required environment variables are set
 * Throws an error if any required env var is missing
 */
function assertEnv() {
  const required = [
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    "STRIPE_PRICE_PRO_MONTHLY",
    "NEXT_PUBLIC_APP_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Stripe environment variables: ${missing.join(", ")}`
    );
  }
}

// Assert env vars on module load (only in production/server)
if (typeof window === "undefined") {
  try {
    assertEnv();
  } catch (error) {
    // Only throw in production - allow dev to continue with warnings
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("Stripe environment variables not fully configured:", error);
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover" as any,
  typescript: true,
});

// Map our plan names to Stripe Price IDs
// Using new environment variable names as specified
export const STRIPE_PRICE_IDS = {
  free: null, // Free plan doesn't need a price ID
  pro: process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  power: process.env.STRIPE_PRICE_POWER_MONTHLY || "",
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

