"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function archiveLaunch(launchId: string): Promise<{ success: boolean; error?: string }> {
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
      .select("userId, status")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    if (checkError || !existingLaunch) {
      return { success: false, error: "Launch not found or access denied" };
    }

    // Update launch to archived status
    const { error: updateError } = await supabase
      .from("launches")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("id", launchId)
      .eq("userId", userId);

    if (updateError) {
      console.error("Error archiving launch:", updateError);
      return { success: false, error: updateError.message || "Failed to archive launch" };
    }

    // Revalidate relevant paths
    revalidatePath(`/launch/${launchId}`);
    revalidatePath("/dashboard");
    revalidatePath("/launches");

    return { success: true };
  } catch (error) {
    console.error("Error in archiveLaunch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to archive launch",
    };
  }
}

export async function unarchiveLaunch(launchId: string): Promise<{ success: boolean; error?: string }> {
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
      .select("userId, status")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    if (checkError || !existingLaunch) {
      return { success: false, error: "Launch not found or access denied" };
    }

    // Update launch to active status
    const { error: updateError } = await supabase
      .from("launches")
      .update({
        status: "active",
        archived_at: null,
      })
      .eq("id", launchId)
      .eq("userId", userId);

    if (updateError) {
      console.error("Error unarchiving launch:", updateError);
      return { success: false, error: updateError.message || "Failed to unarchive launch" };
    }

    // Revalidate relevant paths
    revalidatePath(`/launch/${launchId}`);
    revalidatePath("/dashboard");
    revalidatePath("/launches");

    return { success: true };
  } catch (error) {
    console.error("Error in unarchiveLaunch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unarchive launch",
    };
  }
}

