"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isFreePlan } from "@/lib/plans";

export async function deleteLaunch(launchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    const userId = user.id;

    const supabase = await createClient();

    // Get user plan
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("plan")
      .eq("userId", userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: "User not found" };
    }

    const plan = (userData.plan as 'free' | 'pro' | 'power') || 'free';

    // Verify the launch belongs to the user
    const { data: existingLaunch, error: checkError } = await supabase
      .from("launches")
      .select("userId, status")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    if (checkError || !existingLaunch) {
      return { success: false, error: "Launch not found or access denied" };
    }

    if (isFreePlan(plan)) {
      // For free users: archive instead of delete (doesn't free up slot)
      const { error: updateError } = await supabase
        .from("launches")
        .update({
          status: "archived",
          deleted_at: new Date().toISOString(),
        })
        .eq("id", launchId)
        .eq("userId", userId);

      if (updateError) {
        console.error("Error archiving launch (free plan delete):", updateError);
        return { success: false, error: updateError.message || "Failed to archive launch" };
      }

      // Optionally clear sensitive data (tasks) for free users
      const { error: tasksDeleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("launchId", launchId);

      if (tasksDeleteError) {
        console.error("Error clearing tasks:", tasksDeleteError);
        // Don't fail the whole operation for this
      }
    } else {
      // For paid users: actual delete (frees up slot)
      const { error: updateError } = await supabase
        .from("launches")
        .update({
          status: "deleted",
          deleted_at: new Date().toISOString(),
        })
        .eq("id", launchId)
        .eq("userId", userId);

      if (updateError) {
        console.error("Error deleting launch:", updateError);
        return { success: false, error: updateError.message || "Failed to delete launch" };
      }

      // Optionally delete related tasks
      const { error: tasksDeleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("launchId", launchId);

      if (tasksDeleteError) {
        console.error("Error deleting tasks:", tasksDeleteError);
        // Don't fail the whole operation for this
      }
    }

    // Revalidate relevant paths
    revalidatePath(`/launch/${launchId}`);
    revalidatePath("/dashboard");
    revalidatePath("/launches");

    return { success: true };
  } catch (error) {
    console.error("Error in deleteLaunch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete launch",
    };
  }
}

