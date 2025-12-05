"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { checkLaunchLimit } from "@/lib/usage-checks-simple";

export async function createLaunch(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  // Check launch limit before creating
  const limitCheck = await checkLaunchLimit();
  if (!limitCheck.allowed) {
    throw new Error(limitCheck.message || "Launch limit exceeded");
  }

  const launchName = formData.get("launchName") as string;
  const description = formData.get("description") as string;
  const targetDate = formData.get("targetDate") as string;
  const launchType = formData.get("launchType") as string;

  if (!launchName) {
    throw new Error("Launch name is required");
  }

  try {
    const supabase = await createClient();
    const { data: launch, error } = await supabase
      .from("launches")
      .insert({
        userId: userId,
        launchName: launchName,
        description: description || "",
        target_date: targetDate || null,
        status: "planning",
        progress: 0,
        launchType: launchType || "Product",
        toneOfVoice: "professional",
        platforms: [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating launch:", error);
      throw new Error("Failed to create launch");
    }

    // Redirect to the new launch page
    redirect(`/launch/${launch.id}`);
  } catch (error) {
    console.error("Error creating launch:", error);
    throw error;
  }
}
