"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function resetLaunch(
  launchId: string,
  newName?: string,
  newDate?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getUser();
    if (!user) {
      return { success: false, error: "Not authenticated" };
    }
    const userId = user.id;

    const supabase = await createClient();

    // Verify the launch belongs to the user
    const { data: existingLaunch, error: checkError } = await supabase
      .from("launches")
      .select("userId, launchName, target_date")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    if (checkError || !existingLaunch) {
      return { success: false, error: "Launch not found or access denied" };
    }

    // Delete all tasks for the launch
    const { error: tasksDeleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("launchId", launchId);

    if (tasksDeleteError) {
      console.error("Error deleting tasks:", tasksDeleteError);
      return { success: false, error: "Failed to clear tasks" };
    }

    // Reset launch fields (keeps same ID, reuses slot)
    const updateData: any = {
      status: "active",
      progress: 0,
      archived_at: null,
      deleted_at: null,
      // Clear AI-generated content fields if they exist
      summary: null,
      ai_plan_generated: false,
    };

    // Update name and date if provided, otherwise keep existing
    if (newName !== undefined) {
      updateData.launchName = newName;
    }
    if (newDate !== undefined) {
      updateData.target_date = newDate || null;
    }

    const { error: updateError } = await supabase
      .from("launches")
      .update(updateData)
      .eq("id", launchId)
      .eq("userId", userId);

    if (updateError) {
      console.error("Error resetting launch:", updateError);
      return { success: false, error: updateError.message || "Failed to reset launch" };
    }

    // Revalidate relevant paths
    revalidatePath(`/launch/${launchId}`);
    revalidatePath("/dashboard");
    revalidatePath("/launches");

    return { success: true };
  } catch (error) {
    console.error("Error in resetLaunch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to reset launch",
    };
  }
}

