"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser, createClient } from "@/lib/supabase/server";
import { upsertBusinessProfile } from "@/lib/business-profile";

export interface BusinessOnboardingPayload {
  business_name: string;
  business_type: string | null;
  website_url: string | null;
  audience: string | null;
  tone_preset: string | null;
  timezone: string | null;
}

export async function completeBusinessOnboarding(payload: BusinessOnboardingPayload) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }

  if (!payload.business_name || payload.business_name.trim().length === 0) {
    throw new Error("Business name is required");
  }

  // Upsert business profile
  const result = await upsertBusinessProfile({
    business_name: payload.business_name,
    business_type: payload.business_type,
    website_url: payload.website_url,
    audience: payload.audience,
    tone_preset: payload.tone_preset,
    timezone: payload.timezone,
  });

  if (!result.success) {
    throw new Error(result.error || "Failed to save business profile");
  }

  // Mark user as onboarded
  const supabase = await createClient();
  const { error: onboardError } = await supabase
    .from("users")
    .update({ onboarded: true })
    .eq("userId", user.id);

  if (onboardError) {
    console.warn("Failed to flag user as onboarded", onboardError);
    // Don't throw - business profile was saved successfully
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings/business");
}
