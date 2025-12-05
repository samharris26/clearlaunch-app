"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { Plan, canCreateLaunch, canMakeAiCall, getUpgradeMessage } from "@/lib/plans";

export interface UsageCheckResult {
  allowed: boolean;
  message?: string;
  upgradeUrl?: string;
}

export async function checkLaunchLimit(): Promise<UsageCheckResult> {
  const user = await getUser();
  if (!user) {
    return { allowed: false, message: "Authentication required" };
  }
  const userId = user.id;

  try {
    const supabase = await createClient();
    // Get user plan and current launch count
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("userId", userId)
      .single();

    if (userError || !userData) {
      return { allowed: false, message: "User not found" };
    }

    const { data: launches, error: launchesError } = await supabase
      .from("launches")
      .select("id")
      .eq("userId", userId)
      .neq("status", "completed");

    if (launchesError) {
      return { allowed: false, message: "Error checking launches" };
    }

    const currentLaunches = launches?.length || 0;
    const plan = (userData.plan as Plan) || 'free';

    if (!canCreateLaunch(plan, currentLaunches)) {
      return {
        allowed: false,
        message: getUpgradeMessage('launches', plan),
        upgradeUrl: "/pricing"
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking launch limit:", error);
    return { allowed: false, message: "Error checking limits" };
  }
}

export async function checkAiCallLimit(): Promise<UsageCheckResult> {
  const user = await getUser();
  if (!user) {
    return { allowed: false, message: "Authentication required" };
  }
  const userId = user.id;

  try {
    const supabase = await createClient();
    // Get user plan and AI usage
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan, ai_calls_used, ai_calls_reset_date")
      .eq("userId", userId)
      .single();

    if (userError || !userData) {
      return { allowed: false, message: "User not found" };
    }

    const plan = (userData.plan as Plan) || 'free';
    let currentAiCalls = userData.ai_calls_used || 0;

    // Check if we need to reset monthly usage
    const resetDate = new Date(userData.ai_calls_reset_date || new Date());
    const now = new Date();
    const isNewMonth = resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      // Reset AI usage for new month
      const { error: resetError } = await supabase
        .from("users")
        .update({
          ai_calls_used: 0,
          ai_calls_reset_date: now.toISOString().split('T')[0]
        })
        .eq("userId", userId);

      if (resetError) {
        console.error("Error resetting AI usage:", resetError);
      } else {
        currentAiCalls = 0;
      }
    }

    if (!canMakeAiCall(plan, currentAiCalls)) {
      return {
        allowed: false,
        message: getUpgradeMessage('ai', plan),
        upgradeUrl: "/pricing"
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking AI call limit:", error);
    return { allowed: false, message: "Error checking limits" };
  }
}

export async function incrementAiUsage(): Promise<boolean> {
  const user = await getUser();
  if (!user) {
    return false;
  }
  const userId = user.id;

  try {
    const supabase = await createClient();
    // Get current usage
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("ai_calls_used, ai_calls_reset_date")
      .eq("userId", userId)
      .single();

    if (userError || !userData) {
      console.error("Error getting user for AI usage increment:", userError);
      return false;
    }

    // Check if we need to reset monthly usage
    const resetDate = new Date(userData.ai_calls_reset_date || new Date());
    const now = new Date();
    const isNewMonth = resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear();

    let newUsage = 1;
    if (isNewMonth) {
      // Reset for new month
      newUsage = 1;
    } else {
      // Increment existing usage
      newUsage = (userData.ai_calls_used || 0) + 1;
    }

    // Update usage
    const { error: updateError } = await supabase
      .from("users")
      .update({
        ai_calls_used: newUsage,
        ai_calls_reset_date: now.toISOString().split('T')[0]
      })
      .eq("userId", userId);

    if (updateError) {
      console.error("Error incrementing AI usage:", updateError);
      return false;
    }

    // Log the usage
    const { error: logError } = await supabase
      .from("usage_logs")
      .insert({
        user_id: userId,
        action_type: 'ai_call',
        metadata: { timestamp: now.toISOString() }
      });

    if (logError) {
      console.error("Error logging AI usage:", logError);
      // Don't fail the whole operation for logging errors
    }

    return true;
  } catch (error) {
    console.error("Error incrementing AI usage:", error);
    return false;
  }
}

export async function getUserUsage(): Promise<{
  plan: Plan;
  currentLaunches: number;
  maxLaunches: number;
  currentAiCalls: number;
  maxAiCalls: number;
} | null> {
  const user = await getUser();
  if (!user) {
    console.log("getUserUsage: No user found");
    return null;
  }
  const userId = user.id;

  console.log("getUserUsage: Getting usage for userId:", userId);

  try {
    const supabase = await createClient();
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan, ai_calls_used, ai_calls_reset_date")
      .eq("userId", userId)
      .single();

    if (userError || !userData) {
      console.error("Error getting user usage:", userError);
      return null;
    }

    console.log("getUserUsage: User data:", userData);

    // Get current launches count
    const { data: launches, error: launchesError } = await supabase
      .from("launches")
      .select("id")
      .eq("userId", userId)
      .neq("status", "completed");

    if (launchesError) {
      console.error("Error getting launches for usage:", launchesError);
      return null;
    }

    const plan = (userData.plan as Plan) || 'free';
    const currentLaunches = launches?.length || 0;
    let currentAiCalls = userData.ai_calls_used || 0;

    // Check if we need to reset monthly usage
    const resetDate = new Date(userData.ai_calls_reset_date || new Date());
    const now = new Date();
    const isNewMonth = resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear();

    if (isNewMonth) {
      currentAiCalls = 0;
    }

    const { getPlanLimits } = await import("@/lib/plans");
    const limits = getPlanLimits(plan);

    return {
      plan,
      currentLaunches,
      maxLaunches: limits.maxLaunches,
      currentAiCalls,
      maxAiCalls: limits.maxAiCalls
    };
  } catch (error) {
    console.error("Error getting user usage:", error);
    return null;
  }
}
