"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { generateTaskContent, LaunchContext, LaunchPlanTask } from "@/lib/ai";
import { canFreeUserUseAI } from "@/lib/ai/guard";
import { incrementAIUsage } from "@/lib/ai/guard";

export async function generateTaskContentAction(launchId: string, taskId: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("You need to be signed in to generate AI content.");
  }
  const userId = user.id;

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured. Please contact support.");
  }

  // Check if free user can use AI for content generation
  const aiGuardCheck = await canFreeUserUseAI(launchId, 'content_generation');
  if (!aiGuardCheck.allowed) {
    throw new Error(aiGuardCheck.reason || "AI usage not allowed.");
  }

  const supabase = await createClient();
  const { data: launch, error: launchError } = await supabase
    .from("launches")
    .select("*")
    .eq("id", launchId)
    .eq("userId", userId)
    .single();

  if (launchError || !launch) {
    throw new Error("We couldn't find that launch.");
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("launchId", launchId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found.");
  }

  // Get business profile for context
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

  const launchTask: LaunchPlanTask = {
    title: task.title ?? "Untitled task",
    description: task.description ?? "",
    beat_code: task.beat_code ?? "",
    platform: task.platform ?? "",
    day_offset: task.day_offset ?? 0,
    outline: task.outline ?? "",
    category: task.category ?? "General",
    phase: task.phase ?? "Pre-launch",
    order: task.order ?? 0,
    due_date: task.due_date ?? undefined,
  };

  const result = await generateTaskContent(launchTask, context);

  await incrementAIUsage();

  return result;
}

