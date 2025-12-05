import { createClient, getUser } from "@/lib/supabase/server";
import { generateICS, CalendarEvent } from "@/lib/ics";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ launchId: string }> }
) {
    const user = await getUser();
    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { launchId: rawLaunchId } = await params;
    const launchId = rawLaunchId.endsWith(".ics") ? rawLaunchId.slice(0, -4) : rawLaunchId;

    const supabase = await createClient();

    // Verify launch access
    const { data: launch, error: launchError } = await supabase
        .from("launches")
        .select("id, launchName, userId")
        .eq("id", launchId)
        .eq("userId", user.id) // Explicit check for ownership
        .single();

    if (launchError || !launch) {
        return new NextResponse("Launch not found", { status: 404 });
    }

    // Fetch scheduled tasks
    const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("launchId", launchId)
        .not("post_time", "is", null);

    if (tasksError) {
        return new NextResponse("Error fetching tasks", { status: 500 });
    }

    if (!tasks || tasks.length === 0) {
        return new NextResponse("No scheduled tasks to export", { status: 400 });
    }

    const events: CalendarEvent[] = tasks.map((task) => {
        const startDate = new Date(task.post_time!); // Verified not null by query
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000); // 30 minutes duration

        const description = [
            `Launch: ${launch.launchName || "Untitled Launch"}`,
            task.platform ? `Platform: ${task.platform}` : null,
            task.owner_name ? `Owner: ${task.owner_name}` : null,
            task.review_status ? `Status: ${task.review_status}` : null,
            task.beat_code ? `Beat: ${task.beat_code}` : null,
            "",
            task.outline ? "Outline:" : null,
            task.outline,
            "",
            `View in ClearLaunch: ${process.env.NEXT_PUBLIC_APP_URL || "https://www.clearlaunch.co.uk"}/launch/${task.launchId}?taskId=${task.id}`,
        ]
            .filter((line) => line !== null)
            .join("\n");

        const titlePrefix = task.platform ? `[${task.platform}] ` : "";

        return {
            uid: `${task.id}@clearlaunch.app`,
            title: `${titlePrefix}${task.title || "Untitled Task"}`,
            description,
            start: startDate,
            end: endDate,
            url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.clearlaunch.co.uk"}/launch/${task.launchId}?taskId=${task.id}`,
        };
    });

    const icsContent = generateICS(events);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(icsContent);

    return new NextResponse(icsContent, {
        headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Content-Disposition": `attachment; filename="clearlaunch-launch-${launchId}.ics"`,
            "Content-Length": bytes.length.toString(),
        },
    });
}
