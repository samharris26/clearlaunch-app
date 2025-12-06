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
    (profile?.platforms && Array.isArray(profile.platforms)
      ? profile.platforms
      : null);

  const launchPlatforms =
    launchPlatformsRaw ||
    (launch.channels && typeof launch.channels === "string"
      ? launch.channels
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : profile?.platforms && typeof profile.platforms === "string"
      ? profile.platforms
          .split(",")
          .map((item: string) => item.trim())
          .filter(Boolean)
      : []);

      return {
        company_name: profile?.company_name || "Your Company",
        business_type: profile?.business_type || "Product",
        brand_description:
          profile?.brand_description || "A brilliant product ready to launch.",
        audience_focus:
          profile?.target_audience ||
          profile?.audience_focus ||
          "General audience",
        tone_of_voice: profile?.tone_of_voice || "Professional",
        region: profile?.region || "United Kingdom",
        launch_name: launch.launchName || "Untitled Launch",
        launch_description:
          launch.context_notes ||
          launch.description ||
          "A new product launch",
        launch_date: launch.target_date || new Date().toISOString().split("T")[0],
        launch_category: launch.launch_type || launch.launchType || "Product",
        launch_goal: launch.goal || "Sales",
        platforms: launchPlatforms,
      };