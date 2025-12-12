"use server";

import { createClient, getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string | null;
  website_url: string | null;
  audience: string | null;
  tone_preset: string | null;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface BusinessProfileInput {
  business_name: string;
  business_type?: string | null;
  website_url?: string | null;
  audience?: string | null;
  tone_preset?: string | null;
  timezone?: string | null;
}

/**
 * Get business profile for the current authenticated user
 */
export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const user = await getUser();
  if (!user) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error fetching business profile:", error);
    return null;
  }

  return data;
}

/**
 * Upsert business profile for the current authenticated user
 */
export async function upsertBusinessProfile(
  data: BusinessProfileInput
): Promise<{ success: boolean; error?: string }> {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }

  if (!data.business_name || data.business_name.trim().length === 0) {
    return { success: false, error: "Business name is required" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("business_profiles")
    .upsert(
      {
        user_id: user.id,
        business_name: data.business_name.trim(),
        business_type: data.business_type || null,
        website_url: data.website_url || null,
        audience: data.audience || null,
        tone_preset: data.tone_preset || null,
        timezone: data.timezone || null,
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Error upserting business profile:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
