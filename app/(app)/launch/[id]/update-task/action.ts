"use server";

import { getUser, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type TaskUpdates = {
  title?: string;
  description?: string | null;
  status?: string;
  notes?: string | null;
  due_date?: string | null;
};

export async function updateTask(taskId: string, updates: TaskUpdates, launchId?: string) {
  const user = await getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  const userId = user.id;

  const payload = Object.fromEntries(
    Object.entries(updates).filter(([, value]) => value !== undefined)
  );

  if (Object.keys(payload).length === 0) {
    return { success: true, task: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", taskId)
    .select()
    .maybeSingle();

  if (error) {
    // If error is about notes column, try again without it
    if (error.message?.includes("notes") && payload.notes !== undefined) {
      console.warn("Notes column not found in tasks table. Please run the migration: add-task-notes.sql");
      const { notes, ...payloadWithoutNotes } = payload;
      const { data: retryData, error: retryError } = await supabase
        .from("tasks")
        .update(payloadWithoutNotes)
        .eq("id", taskId)
        .select()
        .maybeSingle();
      
      if (retryError) {
        console.error("Error updating task:", retryError);
        throw new Error(retryError.message || "Failed to update task");
      }
      return { success: true, task: retryData };
    }
    
    console.error("Error updating task:", error);
    throw new Error(error.message || "Failed to update task");
  }

  // If status was updated, recalculate launch task counts
  if (updates.status !== undefined && launchId) {
    try {
      // Get all tasks for this launch
      const { data: allTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("status")
        .eq("launchId", launchId);

      if (!tasksError && allTasks) {
        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(
          (task) => task.status === "completed" || task.status === "done"
        ).length;

        // Update launch with new counts
        await supabase
          .from("launches")
          .update({
            total_tasks: totalTasks,
            completed_tasks: completedTasks,
            progress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          })
          .eq("id", launchId);
      }
    } catch (err) {
      console.error("Error updating launch task counts:", err);
      // Don't throw - task update succeeded, launch counts are secondary
    }
  }

  if (launchId) {
    revalidatePath(`/launch/${launchId}`);
    revalidatePath(`/launches`);
    revalidatePath(`/dashboard`);
  }

  return { success: true, task: data };
}



