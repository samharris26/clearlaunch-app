import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

// Map our plan names to Stripe Price IDs
export const STRIPE_PRICE_IDS = {
  free: process.env.STRIPE_PRICE_ID_FREE || null, // Free plan doesn't need a price ID
  pro: process.env.STRIPE_PRICE_ID_PRO || "",
  power: process.env.STRIPE_PRICE_ID_POWER || "",
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

