"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { regenerateSingleTask, LaunchContext, RegenerateTaskRequest } from "@/lib/ai";
import { canFreeUserUseAI } from "@/lib/ai/guard";
import { incrementAIUsage } from "@/lib/ai/guard";
import { revalidatePath } from "next/cache";

export async function regenerateTaskAction(launchId: string, taskId: string) {
  const user = await getUser();
  if (!user) {
    return { success: false, error: "You need to be signed in to regenerate tasks." };
  }
  const userId = user.id;

  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: "OpenAI API key not configured. Please contact support." };
  }

  // Check if free user can use AI for content generation
  const aiGuardCheck = await canFreeUserUseAI(launchId, 'content_generation');
  if (!aiGuardCheck.allowed) {
    return { success: false, error: aiGuardCheck.reason || "AI usage not allowed." };
  }

  const supabase = await createClient();

  // Fetch launch
  const { data: launch, error: launchError } = await supabase
    .from("launches")
    .select("*")
    .eq("id", launchId)
    .eq("userId", userId)
    .single();

  if (launchError || !launch) {
    return { success: false, error: "Launch not found." };
  }

  // Fetch task
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("launchId", launchId)
    .single();

  if (taskError || !task) {
    return { success: false, error: "Task not found." };
  }

  // Fetch business profile for context
  const { data: businessProfile } = await supabase
    .from("business_profiles")
    .select("business_name, business_type, website_url, audience, tone_preset, timezone")
    .eq("user_id", userId)
    .maybeSingle();

  if (!businessProfile) {
    throw new Error("Business profile not found. Please complete your business setup in Settings.");
  }

  const launchPlatformsRaw =
    (Array.isArray(launch.channels) && launch.channels) ||
    (Array.isArray(launch.platforms) && launch.platforms) ||
    null;

  const launchPlatforms =
    launchPlatformsRaw ||
    (launch.channels && typeof launch.channels === "string"
      ? launch.channels.split(",").map((item: string) => item.trim()).filter(Boolean)
      : []);

  const context: LaunchContext = {
    company_name: businessProfile.business_name || "Your Company",
    business_type: businessProfile.business_type || "Product",
    brand_description: businessProfile.website_url ? `Visit us at ${businessProfile.website_url}` : "A brilliant product ready to launch.",
    audience_focus: businessProfile.audience || "General audience",
    tone_of_voice: businessProfile.tone_preset || "Professional",
    region: businessProfile.timezone || "United Kingdom",
    launch_name: launch.launchName || "Untitled Launch",
    launch_description: launch.context_notes || launch.description || "A new product launch",
    launch_date: launch.target_date || new Date().toISOString().split("T")[0],
    launch_category: launch.launch_type || launch.launchType || "Product",
    launch_goal: launch.goal || "Sales",
    summary:
      launch.summary ||
      launch.context_notes ||
      launch.description ||
      "A new product launch",
    platforms: launchPlatforms,
  };

  const existingTask: RegenerateTaskRequest = {
    title: task.title,
    description: task.description,
    category: task.category,
    phase: task.phase,
    platform: task.platform,
    due_date: task.due_date,
    order: task.order,
  };

  try {
    const regeneratedTask = await regenerateSingleTask(context, existingTask);
    
    // Update task in database
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        title: regeneratedTask.title,
        description: regeneratedTask.description,
        category: regeneratedTask.category,
        phase: regeneratedTask.phase,
        platform: regeneratedTask.platform,
        due_date: regeneratedTask.due_date,
        order: regeneratedTask.order,
      })
      .eq("id", taskId)
      .eq("launchId", launchId);

    if (updateError) {
      console.error("Error updating task:", updateError);
      return { success: false, error: "Failed to update task." };
    }

    // Increment AI usage
    await incrementAIUsage();

    revalidatePath(`/launch/${launchId}`);
    
    return { success: true, task: regeneratedTask };
  } catch (error) {
    console.error("Error regenerating task:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to regenerate task." 
    };
  }
}

