"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface OnboardingData {
  company_name: string;
  business_type: string;
  brand_description: string;
  audience_focus: string;
  launch_name: string;
  launch_description: string;
  launch_date: string;
  launch_category: string;
  launch_goal: string;
  platforms: string[];
  use_ai_generation: boolean;
}

export async function submitOnboardingStep(data: OnboardingData) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }
  const userId = user.id;

  const supabase = await createClient();
    // Update user profile with onboarding data
    const { error: profileError } = await supabase
      .from("users")
      .upsert({
        userId,
        company_name: data.company_name,
        business_type: data.business_type,
        brand_description: data.brand_description,
        audience_focus: data.audience_focus,
        launchName: data.launch_name, // Using existing column name
        launch_date: data.launch_date,
        launch_goals: data.launch_description, // Map description to goals
        platforms: data.platforms,
        onboarded: true,
      });

  if (profileError) {
    console.error("Error saving onboarding data:", profileError);
    throw new Error("Failed to save onboarding data");
  }

    // Create a new launch record using your existing schema
    const { data: launch, error: launchError } = await supabase
      .from("launches")
      .insert({
        userId: userId, // Using existing column name
        launchName: data.launch_name, // Using existing column name
        description: data.launch_description,
        target_date: data.launch_date,
        status: "active",
        progress: 0, // Starting progress
        launchType: data.launch_category, // Map category to launch type
        toneOfVoice: "professional", // Default tone
        platforms: data.platforms,
      })
      .select()
      .single();

  if (launchError) {
    console.error("Error creating launch:", launchError);
    // Don't throw error here, just log it
  }

  // Redirect to the new launch page or dashboard
  if (launch?.id) {
    // If user opted for AI generation, trigger it
    if (data.use_ai_generation) {
      console.log("Onboarding: AI generation requested, triggering...");
      // Import and call the AI generation function
      try {
        const { generateAILaunchPlan } = await import("../launch/[id]/generate-ai-plan/action");
        console.log("Onboarding: Calling generateAILaunchPlan for launch:", launch.id);
        const result = await generateAILaunchPlan(launch.id);
        console.log("Onboarding: AI generation result:", result);
      } catch (error) {
        console.error("Onboarding: Error generating AI plan:", error);
        console.error("Onboarding: Error details:", {
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined
        });
        // Continue to launch page even if AI generation fails
      }
    } else {
      console.log("Onboarding: AI generation not requested");
    }
    redirect(`/launch/${launch.id}`);
  } else {
    redirect("/dashboard");
  }
}

// Keep the old function for backward compatibility
export async function submitOnboarding(formData: FormData) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }
  const userId = user.id;

  const onboardingData = {
    launchName: formData.get("launchName") as string,
    productDescription: formData.get("productDescription") as string,
    targetAudience: formData.get("targetAudience") as string,
    email: formData.get("email") as string,
    goals: formData.get("goals") as string,
    onboarded: true,
  };

  const supabase = await createClient();
  // Update or insert user data
  const { error } = await supabase
    .from("users")
    .upsert({
      userId,
      ...onboardingData,
    });

  if (error) {
    console.error("Error saving onboarding data:", error);
    throw new Error("Failed to save onboarding data");
  }

  redirect("/dashboard");
}
