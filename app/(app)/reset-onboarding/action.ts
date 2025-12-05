"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function resetOnboarding() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  // Reset onboarding status
  const supabase = await createClient();
  await supabase
    .from("users")
    .update({ onboarded: false })
    .eq("userId", userId);

  redirect("/onboarding");
}

