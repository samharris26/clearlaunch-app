import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LaunchAnalyticsTable from "@/components/analytics/LaunchAnalyticsTable";
import GlobalAnalyticsStats from "@/components/analytics/GlobalAnalyticsStats";
import { TaskRecord } from "@/types/tasks";

export default async function AnalyticsPage() {
    const user = await getUser();
    if (!user) {
        redirect("/login");
    }
    const userId = user.id;

    const supabase = await createClient();

    // Fetch all launches for the user
    const { data: launches, error: launchesError } = await supabase
        .from("launches")
        .select("*")
        .eq("userId", userId)
        .order("createdAt", { ascending: false });

    if (launchesError) {
        console.error("Error fetching launches:", launchesError);
    }

    // Fetch all tasks for the user's launches
    const launchIds = launches?.map(l => l.id) || [];
    let allTasks: TaskRecord[] = [];

    if (launchIds.length > 0) {
        const { data: tasks, error: tasksError } = await supabase
            .from("tasks")
            .select("*")
            .in("launchId", launchIds);

        if (tasksError) {
            console.error("Error fetching tasks:", tasksError);
        } else {
            allTasks = (tasks || []) as TaskRecord[];
        }
    }

    // Calculate global stats
    const totalLaunches = launches?.length || 0;
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter(t => t.status === "completed").length;
    const tasksInProgress = allTasks.filter(t => t.status === "in_progress").length;

    return (
        <div className="flex flex-col gap-8 p-8 w-full max-w-7xl mx-auto text-[color:var(--text)]">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-[color:var(--heading)]">Analytics Overview</h1>
                <p className="text-[color:var(--muted)]">
                    Track progress across all your launches
                </p>
            </div>

            {launches && launches.length > 0 ? (
                <div className="space-y-12">
                    {/* Global Stats (Aggregated) */}
                    <section>
                        <h2 className="text-xl font-semibold text-[color:var(--heading)] mb-6">Global Performance</h2>
                        <GlobalAnalyticsStats
                            totalLaunches={totalLaunches}
                            totalTasks={totalTasks}
                            completedTasks={completedTasks}
                            tasksInProgress={tasksInProgress}
                        />
                    </section>

                    {/* Per-Launch Breakdown */}
                    <section>
                        <h2 className="text-xl font-semibold text-[color:var(--heading)] mb-6">Launch Breakdown</h2>
                        <LaunchAnalyticsTable launches={launches} allTasks={allTasks} />
                    </section>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)]">
                    <p className="text-[color:var(--muted)] mb-4">No launches found</p>
                    <a href="/launches" className="px-4 py-2 rounded-full border border-sky-200 bg-white text-sm font-semibold text-slate-900 hover:bg-sky-50 transition-colors shadow-[var(--shadow-subtle)]">
                        Create your first launch
                    </a>
                </div>
            )}
        </div>
    );
}
