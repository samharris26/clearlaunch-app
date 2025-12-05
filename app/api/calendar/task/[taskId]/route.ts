import { createClient, getUser } from "@/lib/supabase/server";
import { generateICS, CalendarEvent } from "@/lib/ics";
import { NextRequest, NextResponse } from "next/server";

// 🔹 Add this at the very top (just below imports)
function makeSafeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\- ]+/g, "") // remove weird chars
        .replace(/\s+/g, "-")          // spaces → hyphens
        .replace(/-+/g, "-")           // collapse multiple hyphens
        .trim() || "task";
}

export async function GET(
    _request: NextRequest,
    { params }: { params: { taskId: string } }
) {
    try {
        const rawTaskId = params.taskId;
        const taskId = rawTaskId.endsWith(".ics")
            ? rawTaskId.slice(0, -4)
            : rawTaskId;

        console.log(`[Calendar Export] Request for task: ${taskId}`);

        // Auth
        const user = await getUser();
        console.log("[Calendar Export] getUser result:", user?.id || "NO USER");

        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Supabase client
        const supabase = await createClient();

        // Fetch task
        const { data: task, error } = await supabase
            .from("tasks")
            .select("*")
            .eq("id", taskId)
            .single();

        console.log("[Calendar Export] Supabase response:", { task, error });

        if (error || !task) {
            console.error("[Calendar Export] Task fetch error:", error);
            return new NextResponse("Task not found", { status: 404 });
        }

        if (!task.post_time) {
            return new NextResponse(
                "Task must have a post_time to export to calendar",
                { status: 400 }
            );
        }

        // Convert "09:00:00" to a real Date
        const [hoursStr, minutesStr, secondsStr] = (task.post_time as string).split(":");
        const hours = Number(hoursStr);
        const minutes = Number(minutesStr);
        const seconds = Number(secondsStr ?? 0);

        if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes) ||
            Number.isNaN(seconds)
        ) {
            throw new Error(`Unsupported post_time format: ${task.post_time}`);
        }

        const start = new Date();
        start.setSeconds(0, 0);
        start.setHours(hours, minutes, seconds);

        const end = new Date(start.getTime() + 30 * 60 * 1000); // +30 min

        const appUrl =
            process.env.NEXT_PUBLIC_APP_URL || "https://www.clearlaunch.co.uk";
        const launchId = task.launch_id ?? task.launchId;
        const taskUrl = `${appUrl}/launch/${launchId}?taskId=${task.id}`;

        const description = [
            task.platform && `Platform: ${task.platform}`,
            task.owner_name && `Owner: ${task.owner_name}`,
            task.review_status && `Status: ${task.review_status}`,
            "",
            task.outline && "Outline:",
            task.outline || "",
            "",
            `View in ClearLaunch: ${taskUrl}`,
        ]
            .filter(Boolean)
            .join("\n");

        const event: CalendarEvent = {
            uid: `${task.id}@clearlaunch.app`,
            title: task.title || task.name || "Untitled Task",
            description,
            start,
            end,
            url: taskUrl,
        };

        const ics = generateICS([event]);

        // 🔹 Use the helper here to turn task title into a filename
        const safeName = makeSafeFilename(task.title || task.name || `task-${taskId}`);

        return new NextResponse(ics, {
            status: 200,
            headers: {
                "Content-Type": "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="${safeName}.ics"`,
            },
        });
    } catch (err: any) {
        console.error("[Calendar Export] UNHANDLED ERROR:", err);
        return new NextResponse(
            `Internal error: ${err?.message || "Unknown error"}`,
            { status: 500 }
        );
    }
}
