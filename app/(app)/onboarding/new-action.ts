"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { generateLaunchPlan, LaunchContext } from "@/lib/ai";
import { checkAiCallLimit, incrementAiUsage } from "@/lib/usage-checks-simple";

interface NewOnboardingData {
  // Brand data (Step 1)
  company_name: string;
  brand_description: string;
  tone_of_voice: string;
  target_audience: string;
  region: string;
  
  // Launch data (Steps 2 & 3)
  launch_description: string;
  launch_type: string;
  goal: string;
  channels: string[];
  launch_date: string;
  context_notes: string;
}

export async function submitNewOnboarding(data: NewOnboardingData) {
  const user = await getUser();
  if (!user) {
    redirect("/auth?mode=login");
  }
  const userId = user.id;

  // Validate required fields
  if (!data.company_name || !data.brand_description || !data.tone_of_voice || 
      !data.target_audience || !data.region || !data.launch_description || 
      !data.launch_type || !data.launch_date || !data.channels.length || !data.goal) {
    throw new Error("All required fields must be filled");
  }

  try {
    const supabase = await createClient();
    
    // First, ensure user exists in users table with basic info
    console.log("Ensuring user exists in users table...");
    
    // Get user email for account merging
    const userEmail = user.email;
    
    // Check if user already exists (by userId or email)
    let existingUser = null;
    const { data: existingUserById } = await supabase
      .from("users")
      .select("userId, plan, ai_calls_used, ai_calls_reset_date, onboarded, email")
      .eq("userId", userId)
      .maybeSingle();
    
    if (existingUserById) {
      existingUser = existingUserById;
    } else if (userEmail) {
      const { data: existingUserByEmail } = await supabase
        .from("users")
        .select("userId, plan, ai_calls_used, ai_calls_reset_date, onboarded, email")
        .eq("email", userEmail)
        .maybeSingle();
      existingUser = existingUserByEmail;
    }
    
    const userData: any = {
      userId: userId,
      email: userEmail, // Store email for account merging
    };
    
    if (existingUser) {
      // Preserve existing plan and data
      userData.plan = existingUser.plan || 'free';
      userData.ai_calls_used = existingUser.ai_calls_used ?? 0;
      userData.ai_calls_reset_date = existingUser.ai_calls_reset_date || new Date().toISOString().split('T')[0];
      userData.onboarded = existingUser.onboarded ?? false;
    } else {
      // New user - set defaults
      userData.plan = 'free';
      userData.ai_calls_used = 0;
      userData.ai_calls_reset_date = new Date().toISOString().split('T')[0];
      userData.onboarded = false;
    }
    
    const { error: userUpsertError } = await supabase
      .from("users")
      .upsert(userData, {
        onConflict: 'userId'
      });

    if (userUpsertError) {
      console.error("Error creating/updating user record:", userUpsertError);
      throw new Error("Failed to create user record");
    }
    console.log("✅ User record ensured in users table");

    // Check AI call limit before proceeding
    console.log("Checking AI call limit...");
    const aiLimitCheck = await checkAiCallLimit();
    if (!aiLimitCheck.allowed) {
      console.error("AI call limit exceeded:", aiLimitCheck.message);
      throw new Error(aiLimitCheck.message || "AI call limit exceeded");
    }

    // First, try to save or update the organisation/brand profile
    console.log("Saving organisation profile...");
    console.log("User ID:", userId);
    console.log("Organisation data:", {
      company_name: data.company_name,
      brand_description: data.brand_description,
      tone_of_voice: data.tone_of_voice,
      target_audience: data.target_audience,
      region: data.region
    });
    
    // Store brand data in users table
    console.log("Saving brand profile to users table...");
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        company_name: data.company_name,
        brand_description: data.brand_description,
        tone_of_voice: data.tone_of_voice,
        target_audience: data.target_audience,
        region: data.region,
      })
      .eq("userId", userId);

    if (userUpdateError) {
      console.error("Error updating user with brand data:", userUpdateError);
      // Continue anyway, this is not critical
    } else {
      console.log("✅ Brand data stored in users table");
    }

    // Create the launch record with new fields
    const { data: newLaunch, error: launchError } = await supabase
      .from("launches")
      .insert({
        userId: userId,
        launchName: data.launch_description, // Use launch_description as the name
        launchType: data.launch_type,
        target_date: data.launch_date,
        description: data.context_notes || null,
        status: "active",
        progress: 0,
        
        // New fields
        launch_type: data.launch_type,
        channels: data.channels,
        goal: data.goal,
        context_notes: data.context_notes || null,
      })
      .select()
      .single();

    if (launchError) {
      console.error("Error creating launch:", launchError);
      throw new Error("Failed to create launch");
    }

    console.log("✅ New launch created:", newLaunch);

    // Get brand profile from users table for AI context
    console.log("Fetching brand profile from users table for AI context...");
    const { data: brandProfile, error: userError } = await supabase
      .from("users")
      .select("company_name, brand_description, tone_of_voice, target_audience, region")
      .eq("userId", userId)
      .single();
    
    if (userError) {
      console.error("Error fetching user profile:", userError);
      console.log("Using form data as fallback");
    }

    // Prepare context for AI generation
    const aiContext: LaunchContext = {
      company_name: brandProfile?.company_name || data.company_name || "Your Company",
      business_type: data.launch_type,
      brand_description: brandProfile?.brand_description || data.brand_description || "A great product",
      audience_focus: brandProfile?.target_audience || data.target_audience || "General audience",
      tone_of_voice: brandProfile?.tone_of_voice || data.tone_of_voice || "Professional",
      region: brandProfile?.region || data.region || "Global",
      launch_name: data.launch_description,
      launch_description: data.launch_description,
      launch_date: data.launch_date,
      launch_category: data.launch_type,
      launch_goal: data.goal,
      summary: data.context_notes || data.launch_description || "A new product launch",
      platforms: data.channels, // Already an array
    };

    console.log("AI context prepared:", aiContext);
    console.log("Data source: users table");
    console.log("Brand profile:", brandProfile);
    console.log("Form data:", data);

    // Generate AI tasks
    console.log("Generating AI launch plan...");
    const aiTasks = await generateLaunchPlan(aiContext);
    console.log("AI tasks generated:", aiTasks);

    // Increment AI usage counter
    console.log("Incrementing AI usage...");
    const usageIncremented = await incrementAiUsage();
    if (!usageIncremented) {
      console.error("Failed to increment AI usage");
      // Continue anyway, but log the error
    } else {
      console.log("✅ AI usage incremented successfully");
    }

    // Save AI-generated tasks to database
    console.log("Saving AI tasks to database...");
    const tasksToInsert = aiTasks.map((task) => ({
      launchId: newLaunch.id,
      title: task.title,
      description: task.description,
      category: task.category,
      phase: task.phase,
      order: task.order,
      platform: task.platform,
      due_date: task.due_date,
      ai_generated: true,
      status: "active",
    }));

    const { error: tasksError } = await supabase
      .from("tasks")
      .insert(tasksToInsert);

    if (tasksError) {
      console.error("Error saving AI tasks:", tasksError);
      // Don't throw here, launch was created successfully
    } else {
      console.log("✅ AI tasks saved successfully");
    }

    // Mark user as onboarded
    const { error: onboardError } = await supabase
      .from("users")
      .update({ onboarded: true })
      .eq("userId", userId);

    if (onboardError) {
      console.error("Error updating user onboarded status:", onboardError);
      // Don't throw here, launch was created successfully
    }

    // Redirect to the new launch page
    redirect(`/launch/${newLaunch.id}`);

  } catch (error) {
    console.error("Error in submitNewOnboarding:", error);
    throw error;
  }
}
