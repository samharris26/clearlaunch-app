"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

export type CreateTaskState = {
    message?: string;
    errors?: {
        title?: string[];
        description?: string[];
        dueDate?: string[];
        category?: string[];
    };
};

export async function createTask(
    launchId: string,
    prevState: CreateTaskState,
    formData: FormData
): Promise<CreateTaskState> {
    const user = await getUser();
    if (!user) {
        return { message: "Unauthorized" };
    }

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const dueDate = formData.get("dueDate") as string;
    const category = formData.get("category") as string;
    const phase = formData.get("phase") as string;
    const platform = formData.get("platform") as string;

    if (!title || title.trim().length === 0) {
        return {
            errors: {
                title: ["Title is required"],
            },
            message: "Missing fields. Failed to create task.",
        };
    }

    const supabase = await createClient();

    // Get max order to append to end
    const { data: maxOrderData } = await supabase
        .from("tasks")
        .select("order")
        .eq("launchId", launchId)
        .order("order", { ascending: false })
        .limit(1)
        .single();

    const newOrder = (maxOrderData?.order ?? 0) + 1;

    const { error } = await supabase.from("tasks").insert({
        launchId,
        title,
        description: description || null,
        due_date: dueDate || null,
        category: category || "General",
        phase: phase || "pre-launch",
        platform: platform || null,
        status: "todo",
        order: newOrder,
        owner_name: "You", // Defaulting to "You" for now as per other tasks
    });

    if (error) {
        console.error("Database Error:", error);
        return {
            message: "Database Error: Failed to create task.",
        };
    }

    revalidatePath(`/launch/${launchId}`);
    return { message: "success" };
}

export async function deleteTask(taskId: string, launchId: string) {
    const user = await getUser();
    if (!user) {
        return { message: "Unauthorized" };
    }

    const supabase = await createClient();
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
        console.error("Error deleting task:", error);
        return { message: "Failed to delete task" };
    }

    revalidatePath(`/launch/${launchId}`);
    return { message: "success" };
}
