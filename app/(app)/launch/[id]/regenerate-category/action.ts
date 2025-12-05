"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { regenerateCategoryTasks, LaunchContext, RegenerateTaskRequest } from "@/lib/ai";
import { canFreeUserUseAI } from "@/lib/ai/guard";
import { incrementAIUsage } from "@/lib/ai/guard";
import { revalidatePath } from "next/cache";

export async function regenerateCategoryAction(launchId: string, category: string) {
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

  // Fetch all tasks in the category
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("launchId", launchId)
    .eq("category", category);

  if (tasksError) {
    return { success: false, error: "Failed to fetch tasks." };
  }

  if (!tasks || tasks.length === 0) {
    return { success: false, error: `No tasks found in category "${category}".` };
  }

  // Fetch user profile for context
  const { data: profile } = await supabase
    .from("users")
    .select("company_name, business_type, brand_description, audience_focus, tone_of_voice, target_audience, region, platforms")
    .eq("userId", userId)
    .maybeSingle();

  const launchPlatformsRaw =
    (Array.isArray(launch.channels) && launch.channels) ||
    (Array.isArray(launch.platforms) && launch.platforms) ||
    (profile?.platforms && Array.isArray(profile.platforms) ? profile.platforms : null);

  const launchPlatforms =
    launchPlatformsRaw ||
    (launch.channels && typeof launch.channels === "string"
      ? launch.channels.split(",").map((item: string) => item.trim()).filter(Boolean)
      : profile?.platforms && typeof profile.platforms === "string"
      ? profile.platforms.split(",").map((item: string) => item.trim()).filter(Boolean)
      : []);

  const context: LaunchContext = {
    company_name: profile?.company_name || "Your Company",
    business_type: profile?.business_type || "Product",
    brand_description: profile?.brand_description || "A brilliant product ready to launch.",
    audience_focus: profile?.target_audience || profile?.audience_focus || "General audience",
    tone_of_voice: profile?.tone_of_voice || "Professional",
    region: profile?.region || "United Kingdom",
    launch_name: launch.launchName || "Untitled Launch",
    launch_description: launch.context_notes || launch.description || "A new product launch",
    launch_date: launch.target_date || new Date().toISOString().split("T")[0],
    launch_category: launch.launch_type || launch.launchType || "Product",
    launch_goal: launch.goal || "Sales",
    platforms: launchPlatforms,
  };

  const existingTasks: RegenerateTaskRequest[] = tasks.map(task => ({
    title: task.title,
    description: task.description,
    category: task.category,
    phase: task.phase,
    platform: task.platform,
    due_date: task.due_date,
    order: task.order,
  }));

  try {
    const regeneratedTasks = await regenerateCategoryTasks(context, category, existingTasks);
    
    // Update all tasks in the category
    for (let i = 0; i < regeneratedTasks.length; i++) {
      const regeneratedTask = regeneratedTasks[i];
      const originalTask = tasks[i];
      
      if (!originalTask) continue;

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
        .eq("id", originalTask.id)
        .eq("launchId", launchId);

      if (updateError) {
        console.error(`Error updating task ${originalTask.id}:`, updateError);
        // Continue with other tasks
      }
    }

    // Increment AI usage (count as one AI call for the category regeneration)
    await incrementAIUsage();

    revalidatePath(`/launch/${launchId}`);
    
    return { success: true, tasksUpdated: regeneratedTasks.length };
  } catch (error) {
    console.error("Error regenerating category tasks:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to regenerate category tasks." 
    };
  }
}

