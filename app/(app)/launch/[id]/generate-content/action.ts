"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import {
  generateInstagramCopy,
  generateCarousel,
  generateReelsScript,
  generateEmailCampaign,
  LaunchContext,
} from "@/lib/ai";
import { canFreeUserUseAI, incrementAIUsage } from "@/lib/ai/guard";

type ContentType = "instagram" | "carousel" | "reels" | "email";

async function getLaunchContext(
  launchId: string,
  userId: string
): Promise<LaunchContext> {
  const supabase = await createClient();

  const { data: launch, error: launchError } = await supabase
    .from("launches")
    .select("*")
    .eq("id", launchId)
    .eq("userId", userId)
    .single();

  if (launchError || !launch) {
    throw new Error("Launch not found");
  }

  // Get business profile for context
  const { data: businessProfile } = await supabase
    .from("business_profiles")
    .select("business_name, business_type, website_url, audience, tone_preset, timezone")
    .eq("user_id", userId)
    .maybeSingle();

  // Check if business profile exists
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
      ? launch.channels
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : []);

  return {
    company_name: businessProfile.business_name || "Your Company",
    business_type: businessProfile.business_type || "Product",
    brand_description:
      businessProfile.website_url ? `Visit us at ${businessProfile.website_url}` : "A brilliant product ready to launch.",
    audience_focus:
      businessProfile.audience || "General audience",
    tone_of_voice: businessProfile.tone_preset || "Professional",
    region: businessProfile.timezone || "United Kingdom",
    launch_name: launch.launchName || "Untitled Launch",
    launch_description:
      launch.context_notes ||
      launch.description ||
      "A new product launch",
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
}

export async function generateContentAction(
  launchId: string,
  taskId: string,
  contentType: ContentType
) {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Check AI usage
  const aiGuardCheck = await canFreeUserUseAI(launchId, 'content_generation');
  if (!aiGuardCheck.allowed) {
    throw new Error(aiGuardCheck.reason || "AI usage not allowed");
  }

  // Get launch context
  const context = await getLaunchContext(launchId, user.id);

  // Get task details
  const supabase = await createClient();
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("launchId", launchId)
    .single();

  if (taskError || !task) {
    throw new Error("Task not found");
  }

  // Generate content based on type
  const taskRequest = {
    title: task.title || "",
    description: task.description || null,
    category: task.category || null,
    phase: task.phase || null,
    platform: task.platform || null,
  };

  let result;
  switch (contentType) {
    case "instagram":
      result = await generateInstagramCopy(context, taskRequest);
      break;
    case "carousel":
      result = await generateCarousel(context, taskRequest);
      break;
    case "reels":
      result = await generateReelsScript(context, taskRequest);
      break;
    case "email":
      result = await generateEmailCampaign(context, taskRequest);
      break;
    default:
      throw new Error(`Unsupported content type: ${contentType}`);
  }

  // Increment AI usage
  await incrementAIUsage();

  return result;
}