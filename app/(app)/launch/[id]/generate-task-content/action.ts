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

  const { data: profile } = await supabase
    .from("users")
    .select(
      "company_name, business_type, brand_description, audience_focus, tone_of_voice, target_audience, region, platforms"
    )
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
    category: task.category ?? "General",
    phase: task.phase ?? "Pre-launch",
    order: task.order ?? 0,
    platform: task.platform ?? undefined,
    due_date: task.due_date ?? undefined,
  };

  const result = await generateTaskContent(launchTask, context);

  await incrementAIUsage();

  return result;
}

