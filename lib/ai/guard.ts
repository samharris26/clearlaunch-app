"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { Plan, PLAN_LIMITS } from "@/lib/plans";

export interface AIGuardResult {
  allowed: boolean;
  reason?: string;
  code?: 'PLAN_LIMIT_AI' | 'FREE_PLAN_RESTRICTION';
}

/**
 * Check if user can make an AI call
 * Handles monthly reset and plan limits
 */
export async function canMakeAICall(): Promise<AIGuardResult> {
  const user = await getUser();
  if (!user) {
    return { allowed: false, reason: "Authentication required" };
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
      return { allowed: false, reason: "User not found" };
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

    const planLimits = PLAN_LIMITS[plan];
    if (currentAiCalls >= planLimits.maxAiCalls) {
      return {
        allowed: false,
        reason: `You've reached your monthly AI limit of ${planLimits.maxAiCalls} calls. Upgrade for more.`,
        code: 'PLAN_LIMIT_AI'
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error("Error checking AI call limit:", error);
    return { allowed: false, reason: "Error checking limits" };
  }
}

/**
 * Increment AI usage after a successful call
 */
export async function incrementAIUsage(): Promise<boolean> {
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

/**
 * Check if a free plan user can use AI for a specific action
 * Free users can only use AI for initial launch generation
 */
export async function canFreeUserUseAI(launchId: string, actionType: 'initial_generation' | 'task_rewrite' | 'content_generation' | 'post_idea' | 'caption'): Promise<AIGuardResult> {
  const user = await getUser();
  if (!user) {
    return { allowed: false, reason: "Authentication required" };
  }
  const userId = user.id;

  try {
    const supabase = await createClient();
    
    // Get user plan
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("userId", userId)
      .single();

    if (userError || !userData) {
      return { allowed: false, reason: "User not found" };
    }

    const plan = (userData.plan as Plan) || 'free';

    // If not free plan, allow all AI actions (subject to usage limits)
    if (plan !== 'free') {
      return await canMakeAICall();
    }

    // Free plan: allow initial generation and regenerations (subject to AI call limit)
    // Free users get 20 AI credits/month
    if (actionType === 'initial_generation') {
      // Check monthly AI limit (this covers both initial and regenerations for free plan)
      const aiLimitCheck = await canMakeAICall();
      if (!aiLimitCheck.allowed) {
        return aiLimitCheck;
      }
      
      // Verify launch exists and belongs to user
      let { data: launch, error: launchError } = await supabase
        .from("launches")
        .select("userId")
        .eq("id", launchId)
        .eq("userId", userId)
        .single();

      // If not found with userId filter, check if launch exists but belongs to different user
      if (launchError && (launchError.code === 'PGRST116' || launchError.message?.includes('No rows'))) {
        const { data: launchCheck } = await supabase
          .from("launches")
          .select("userId")
          .eq("id", launchId)
          .single();
        
        if (launchCheck) {
          console.error("Launch exists but belongs to different user:", { 
            launchUserId: launchCheck.userId, 
            currentUserId: userId 
          });
          return { 
            allowed: false, 
            reason: "This launch belongs to a different account. Please contact support if you believe this is an error." 
          };
        }
      }

      if (launchError) {
        console.error("Error fetching launch in canFreeUserUseAI:", launchError);
        if (launchError.code === 'PGRST116' || launchError.message?.includes('No rows')) {
          return { allowed: false, reason: "Launch not found" };
        }
        return { allowed: false, reason: `Error checking launch: ${launchError.message}` };
      }

      if (!launch) {
        return { allowed: false, reason: "Launch not found" };
      }

      // Free plan allows regenerations - just check AI limit (already done above)
      return { allowed: true };
    }

    // For all other AI actions on free plan, check if initial generation happened
    let { data: launch, error: launchError } = await supabase
      .from("launches")
      .select("initialAIGenerated, userId")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    // If not found with userId filter, check if launch exists but belongs to different user
    if (launchError && (launchError.code === 'PGRST116' || launchError.message?.includes('No rows'))) {
      const { data: launchCheck } = await supabase
        .from("launches")
        .select("userId")
        .eq("id", launchId)
        .single();
      
      if (launchCheck) {
        console.error("Launch exists but belongs to different user:", { 
          launchUserId: launchCheck.userId, 
          currentUserId: userId 
        });
        return { 
          allowed: false, 
          reason: "This launch belongs to a different account. Please contact support if you believe this is an error." 
        };
      }
    }

    if (launchError) {
      console.error("Error fetching launch in canFreeUserUseAI (other actions):", launchError);
      if (launchError.code === 'PGRST116' || launchError.message?.includes('No rows')) {
        return { allowed: false, reason: "Launch not found" };
      }
      return { allowed: false, reason: `Error checking launch: ${launchError.message}` };
    }

    if (!launch) {
      return { allowed: false, reason: "Launch not found" };
    }

    // Free users can't use AI for anything except initial generation
    if (!launch.initialAIGenerated) {
      return {
        allowed: false,
        reason: "Generate your launch plan first, then upgrade to Pro to unlock AI-powered editing and content tools.",
        code: 'FREE_PLAN_RESTRICTION'
      };
    }

    return {
      allowed: false,
      reason: "Upgrade to Pro to unlock AI-powered editing and content tools.",
      code: 'FREE_PLAN_RESTRICTION'
    };
  } catch (error) {
    console.error("Error checking free user AI access:", error);
    return { allowed: false, reason: "Error checking access" };
  }
}

