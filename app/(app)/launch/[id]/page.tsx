import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import LaunchTasksHeader from "@/components/tasks/LaunchTasksHeader";
import TaskGrid from "@/components/TaskGrid";
import { ChevronRight } from "lucide-react";
import LaunchHeader from "./LaunchHeader";
import GenerateAIPlanButton from "./GenerateAIPlanButton";
import { calculateLaunchHealth } from "@/lib/launchHealth";
import { getLaunchTemplateById } from "@/lib/launchTemplates";
import type { TaskRecord } from "@/types/tasks";

type Params = { params: Promise<{ id: string }> };

export default async function LaunchDetailPage({ params }: Params) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  const { id: launchId } = await params;

  const supabase = await createClient();
  // Fetch launch data
  const { data: launch, error: launchError } = await supabase
    .from("launches")
    .select("*")
    .eq("id", launchId)
    .eq("userId", userId)
    .single();

  if (launchError || !launch) {
    redirect("/launches");
  }

  // Fetch tasks
  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .eq("launchId", launchId)
    .order("order", { ascending: true });

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError);
    console.error("Tasks error details:", {
      message: tasksError.message,
      details: tasksError.details,
      hint: tasksError.hint,
      code: tasksError.code
    });
  }

  // Calculate progress from actual tasks
  const typedTasks = (tasks || []) as TaskRecord[];
  const totalTasks = typedTasks.length;
  const completedTasks = typedTasks.filter((task) => task.status === "completed").length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const template = launch.template_id ? getLaunchTemplateById(launch.template_id) : undefined;
  const health = calculateLaunchHealth(
    {
      id: launchId,
      launch_start_date: launch.launch_start_date,
      launch_end_date: launch.launch_end_date,
      template_id: launch.template_id,
    },
    typedTasks,
    template
  );

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-10 px-2 sm:px-4 pt-12 pb-18">
      {/* Breadcrumbs */}
      <nav className="flex w-full max-w-6xl items-center gap-1 text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
        <Link href="/dashboard" className="hover:text-[color:var(--text)] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 text-[color:var(--border-strong)]" />
        <Link href="/launches" className="hover:text-[color:var(--text)] transition-colors">
          Launches
        </Link>
        <ChevronRight className="h-4 w-4 text-[color:var(--border-strong)]" />
        <span className="text-[color:var(--text)] font-medium">
          {launch.launchName || "Untitled Launch"}
        </span>
      </nav>

      {/* Header banner */}
      <LaunchHeader
        launch={launch}
        progress={progress}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        launchId={launchId}
        hasTasks={(tasks?.length ?? 0) > 0}
        health={health}
      />

      {/* Tasks section */}
      <div className="flex w-full max-w-6xl flex-col gap-4">
        <LaunchTasksHeader launchId={launchId} />

        {tasks && tasks.length > 0 ? (
          <TaskGrid tasks={tasks} />
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-9 text-center shadow-[var(--shadow-subtle)]">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] border border-[color:var(--border)]">
              <svg className="h-6 w-6 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>No tasks yet</h3>
            <p className="mb-4 text-sm text-[color:var(--muted)] leading-6" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Generate an AI-powered launch plan or create tasks manually to get started.
            </p>
            <GenerateAIPlanButton
              launchId={launchId}
              hasTasks={false}
              initialAIGenerated={Boolean(launch.initialAIGenerated)}
            />
          </div>
        )}
      </div>
    </div>
  );
}


