"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser, createClient } from "@/lib/supabase/server";
import { getLaunchTemplateById } from "@/lib/launchTemplates";
import { generateAILaunchPlan } from "@/app/(app)/launch/[id]/generate-ai-plan/action";
import type { Platform } from "@/lib/platforms";

export type WizardPlatformSelection = {
  platform: Platform;
  handle?: string;
};

export interface OnboardingWizardPayload {
  launchName: string;
  summary: string;
  goalType: string;
  goalValue: number | null;
  launchDate: string;
  templateId: string;
  platforms: WizardPlatformSelection[];
}

export async function completeOnboardingWizard(payload: OnboardingWizardPayload) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }
  const userId = user!.id;

  const requiredFields: Array<[keyof OnboardingWizardPayload, string]> = [
    ["launchName", "Launch name"],
    ["summary", "Summary"],
    ["goalType", "Goal type"],
    ["launchDate", "Launch date"],
    ["templateId", "Template"],
  ];

  requiredFields.forEach(([field, label]) => {
    const value = payload[field];
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      throw new Error(`${label} is required`);
    }
  });

  const template = getLaunchTemplateById(payload.templateId);
  if (!template) {
    throw new Error("Invalid launch template selected");
  }

  const supabase = await createClient();

  const { data: launch, error: launchError } = await supabase
    .from("launches")
    .insert({
      userId,
      launchName: payload.launchName,
      summary: payload.summary,
      description: payload.summary,
      goal_type: payload.goalType,
      goal_value: payload.goalValue,
      launch_start_date: payload.launchDate,
      launch_end_date: payload.launchDate,
      launch_date: payload.launchDate,
      target_date: payload.launchDate,
      template_id: payload.templateId,
      status: "active",
      phase: "Research & Setup",
      progress: 0,
      launchType: template.name,
    })
    .select()
    .single();

  if (launchError || !launch) {
    console.error("Failed to create launch", launchError);
    throw new Error(launchError?.message || "Failed to create launch");
  }

  if (payload.platforms.length) {
    const rows = payload.platforms.map((entry) => ({
      launch_id: launch.id,
      platform: entry.platform,
      handle: entry.handle || null,
    }));

    const { error: platformError } = await supabase.from("launch_platforms").upsert(rows, {
      onConflict: "launch_id,platform",
      ignoreDuplicates: false,
    });

    if (platformError) {
      console.error("Failed to save launch platforms", platformError);
      throw new Error(platformError.message);
    }
  }

  const { error: onboardError } = await supabase
    .from("users")
    .update({ onboarded: true })
    .eq("userId", userId);

  if (onboardError) {
    console.warn("Failed to flag user as onboarded", onboardError);
  }

  // Automatically generate the AI launch plan right after onboarding
  try {
    await generateAILaunchPlan(launch.id);
  } catch (aiError) {
    console.error("Failed to auto-generate launch plan during onboarding:", aiError);
  }

  revalidatePath("/dashboard");
  revalidatePath("/launches");

  return { launchId: launch.id };
}


