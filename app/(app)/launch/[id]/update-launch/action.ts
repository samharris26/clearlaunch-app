"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface UpdateLaunchData {
  launchName?: string | null;
  description?: string | null;
  target_date?: string | null;
  launchType?: string | null;
}

export async function updateLaunch(
  launchId: string,
  data: UpdateLaunchData
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
      .select("userId")
      .eq("id", launchId)
      .eq("userId", userId)
      .single();

    if (checkError || !existingLaunch) {
      return { success: false, error: "Launch not found or access denied" };
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (data.launchName !== undefined) updateData.launchName = data.launchName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.target_date !== undefined) updateData.target_date = data.target_date;
    if (data.launchType !== undefined) updateData.launchType = data.launchType;

    // Update the launch
    const { error: updateError } = await supabase
      .from("launches")
      .update(updateData)
      .eq("id", launchId)
      .eq("userId", userId);

    if (updateError) {
      console.error("Error updating launch:", updateError);
      return { success: false, error: updateError.message || "Failed to update launch" };
    }

    // Revalidate the launch page
    revalidatePath(`/launch/${launchId}`);
    revalidatePath("/dashboard");
    revalidatePath("/launches");

    return { success: true };
  } catch (error) {
    console.error("Error in updateLaunch:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update launch",
    };
  }
}

