"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { generateLaunchPlan, LaunchContext } from "@/lib/ai";
import { redirect } from "next/navigation";
import { canFreeUserUseAI, incrementAIUsage } from "@/lib/ai/guard";
import { getLaunchTemplateById } from "@/lib/launchTemplates";
import { getRecommendedPostTime } from "@/lib/smartTiming";

export async function generateAILaunchPlan(launchId: string) {
  console.log("Starting AI launch plan generation for launch:", launchId);
  
  const user = await getUser();
  if (!user) {
    console.error("No user found");
    redirect("/auth?mode=login");
  }
  const userId = user.id;

  console.log("User ID:", userId);

  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.");
  }

  const supabase = await createClient();
  
  // Get launch details first to verify it exists and belongs to user
  console.log("Fetching launch details...");
  const { data: launch, error: launchError } = await supabase
    .from("launches")
    .select("*")
    .eq("id", launchId)
    .eq("userId", userId)
    .single();

  if (launchError || !launch) {
    console.error("Error fetching launch:", launchError);
    throw new Error(launchError?.message || "Launch not found or you don't have permission to access it");
  }

  console.log("Launch found:", { id: launch.id, initialAIGenerated: launch.initialAIGenerated });

  // Check if free user can use AI for initial generation
  console.log("Checking AI access...");
  const aiGuardCheck = await canFreeUserUseAI(launchId, 'initial_generation');
  if (!aiGuardCheck.allowed) {
    console.error("AI access denied:", aiGuardCheck.reason);
    throw new Error(aiGuardCheck.reason || "AI usage not allowed");
  }

  try {
    // Load template and platforms
    const templateId = launch.template_id || launch.templateId;
    const template = templateId ? getLaunchTemplateById(templateId) : undefined;
    
    if (!template) {
      console.warn("No template found for launch, using default behavior");
    }

    // Get launch platforms from join table
    const { data: launchPlatforms } = await supabase
      .from("launch_platforms")
      .select("platform, handle")
      .eq("launch_id", launchId);

    const platforms = launchPlatforms?.map((lp) => lp.platform) || launch.channels || launch.platforms || [];
    const platformHandles: Record<string, string | undefined> = {};
    launchPlatforms?.forEach((lp) => {
      if (lp.handle) {
        platformHandles[lp.platform] = lp.handle;
      }
    });

    // Get user profile for context
    console.log("Fetching user profile...");
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("company_name, business_type, brand_description, audience_focus, platforms, tone_of_voice, target_audience, region")
      .eq("userId", userId)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
    }

    console.log("User profile:", profile);

    // Prepare context for AI
    const context: LaunchContext = {
      company_name: profile?.company_name || "Your Company",
      business_type: profile?.business_type || "Product",
      brand_description: profile?.brand_description || "A great product",
      audience_focus: profile?.target_audience || profile?.audience_focus || "General audience",
      tone_of_voice: profile?.tone_of_voice || "Professional",
      region: profile?.region || "Global",
      launch_name: launch.launchName || "Untitled Launch",
      launch_description: launch.context_notes || launch.description || launch.summary || "A new product launch",
      summary: launch.summary || launch.description || "A new product launch",
      launch_date: launch.launch_end_date || launch.target_date || launch.launch_date || new Date().toISOString().split('T')[0],
      launch_start_date: launch.launch_start_date || undefined,
      launch_end_date: launch.launch_end_date || launch.target_date || launch.launch_date || undefined,
      launch_category: launch.launch_type || launch.launchType || "Product",
      launch_goal: launch.goal || launch.goal_type || "Sales",
      goal_type: launch.goal_type || undefined,
      goal_value: launch.goal_value || undefined,
      platforms: platforms,
      platform_handles: platformHandles,
      template_id: templateId || undefined,
      template_name: template?.name || undefined,
    };

    console.log("AI context prepared:", context);

    // Clear existing tasks for this launch (regeneration)
    console.log("Clearing existing tasks...");
    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("launchId", launchId);

    if (deleteError) {
      console.error("Error clearing existing tasks:", deleteError);
      // Continue anyway, but log the error
    } else {
      console.log("✅ Existing tasks cleared");
    }

    // Generate AI tasks
    console.log("Calling AI service...");
    const aiTasks = await generateLaunchPlan(context);
    console.log("AI tasks generated:", aiTasks);

    // Increment AI usage counter
    console.log("Incrementing AI usage...");
    const usageIncremented = await incrementAIUsage();
    if (!usageIncremented) {
      console.error("Failed to increment AI usage");
      // Continue anyway, but log the error
    } else {
      console.log("✅ AI usage incremented successfully");
    }

    // Save tasks to database
    console.log("Saving tasks to database...");
    const tasksToInsert = aiTasks.map((task) => ({
      launchId: launchId,
      title: task.title,
      description: task.description,
      category: task.category,
      phase: task.phase,
      order: task.order,
      platform: task.platform || null,
      beat_code: task.beat_code || null,
      outline: task.outline || null,
      due_date: task.due_date,
      post_time: task.platform ? getRecommendedPostTime(task.platform) : null,
      owner_name: null,
      review_status: "draft",
      ai_generated: true,
      status: "active",
    }));

    console.log("Tasks to insert:", tasksToInsert);

    const { error: insertError } = await supabase
      .from("tasks")
      .insert(tasksToInsert);

    if (insertError) {
      console.error("Error inserting AI tasks:", insertError);
      throw new Error(`Failed to save generated tasks: ${insertError.message}`);
    }

    console.log("Tasks saved successfully");

    // Update launch progress and mark initial AI generation
    console.log("Updating launch progress...");
    const promptVersion = "1.0"; // Current AI prompt version
    const { error: updateError } = await supabase
      .from("launches")
      .update({ 
        progress: 5, // Small progress to show plan is generated
        total_tasks: aiTasks.length,
        completed_tasks: 0,
        initialAIGenerated: true, // Mark that initial AI generation has been done
        ai_prompt_version: promptVersion,
        ai_generated_at: new Date().toISOString(),
      })
      .eq("id", launchId);

    if (updateError) {
      console.error("Error updating launch progress:", updateError);
    }

    console.log("AI launch plan generation completed successfully");
    return { success: true, taskCount: aiTasks.length };

  } catch (error) {
    console.error("Error generating AI launch plan:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    throw error;
  }
}
