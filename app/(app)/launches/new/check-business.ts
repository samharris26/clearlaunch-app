"use server";

import { getUser, createClient } from "@/lib/supabase/server";

export async function checkBusinessProfile() {
  const user = await getUser();
  if (!user) {
    return { exists: false, error: "Not authenticated" };
  }

  const supabase = await createClient();
  const { data: businessProfile, error } = await supabase
    .from("business_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("Error checking business profile:", error);
    return { exists: false, error: error.message };
  }

  return { exists: !!businessProfile };
}
