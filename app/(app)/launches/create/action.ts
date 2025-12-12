"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { checkLaunchLimit } from "@/lib/usage-checks-simple";
import { generateAILaunchPlan } from "@/app/(app)/launch/[id]/generate-ai-plan/action";

export async function createLaunch(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
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
  const toneOfVoice = formData.get("toneOfVoice") as string;
  const platformsJson = formData.get("platforms") as string;
  const goalType = formData.get("goalType") as string;
  const goalValue = formData.get("goalValue") as string;
  const goalUnit = formData.get("goalUnit") as string;

  if (!launchName) {
    throw new Error("Launch name is required");
  }

  // Parse platforms array from JSON string, or use empty array
  let platforms: string[] = [];
  if (platformsJson) {
    try {
      platforms = JSON.parse(platformsJson);
    } catch (e) {
      console.error("Error parsing platforms:", e);
      platforms = [];
    }
  }

  try {
    const supabase = await createClient();
    const { data: launch, error } = await supabase
      .from("launches")
      .insert({
        userId: userId,
        launchName: launchName,
        description: description || "",
        context_notes: description || "", // Also save as context_notes for AI generation
        target_date: targetDate || null,
        launch_date: targetDate || null, // Also set launch_date
        status: "active",
        progress: 0,
        launchType: launchType || "Product",
        launch_type: launchType || "Product", // Also set launch_type
        toneOfVoice: toneOfVoice || "professional",
        platforms: platforms || [],
        goal_type: goalType || null,
        goal_value: goalValue ? parseFloat(goalValue) : null,
        goal_unit: goalUnit || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating launch:", error);
      throw new Error("Failed to create launch");
    }

    // Save platforms to launch_platforms table if provided
    if (platforms && platforms.length > 0) {
      const platformInserts = platforms.map((platform) => ({
        launch_id: launch.id,
        platform: platform,
      }));
      const { error: platformError } = await supabase
        .from("launch_platforms")
        .insert(platformInserts);
      
      if (platformError) {
        console.error("Error saving platforms:", platformError);
        // Continue anyway - platforms are optional
      }
    }

    // Automatically generate AI tasks for the new launch
    try {
      console.log("Auto-generating AI tasks for new launch:", launch.id);
      await generateAILaunchPlan(launch.id);
      console.log("✅ AI tasks generated successfully");
    } catch (aiError) {
      console.error("Error generating AI tasks:", aiError);
      // Don't fail the launch creation if AI generation fails
      // User can manually regenerate later
    }

    // Redirect to the new launch page
    redirect(`/launch/${launch.id}`);
  } catch (error) {
    console.error("Error creating launch:", error);
    throw error;
  }
}
