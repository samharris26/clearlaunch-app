import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LaunchAnalyticsTable from "@/components/analytics/LaunchAnalyticsTable";
import GlobalAnalyticsStats from "@/components/analytics/GlobalAnalyticsStats";
import { TaskRecord } from "@/types/tasks";
import { Plan } from "@/lib/plans";
import Link from "next/link";

export default async function AnalyticsPage() {
    const user = await getUser();
    if (!user) {
        redirect("/login");
    }
    const userId = user.id;

    const supabase = await createClient();

    // Check user plan - analytics is only available for paid plans
    const { data: userData, error: userError } = await supabase
        .from("users")
        .select("plan")
        .eq("userId", userId)
        .single();

    if (userError || !userData) {
        redirect("/login");
    }

    const plan = (userData.plan as Plan) || 'free';

    // Block free plan users from accessing analytics
    if (plan === 'free') {
        return (
            <div className="flex flex-col gap-8 p-8 w-full max-w-7xl mx-auto text-[color:var(--text)]">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold text-[color:var(--heading)]">Analytics Overview</h1>
                    <p className="text-[color:var(--muted)]">
                        Track progress across all your launches
                    </p>
                </div>

                <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)]">
                    <div className="text-center max-w-md space-y-4">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <svg
                                className="h-8 w-8 text-indigo-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-[color:var(--heading)]">
                            Analytics available on paid plans
                        </h3>
                        <p className="text-[color:var(--muted)]">
                            Upgrade to Pro or Power to access analytics and track your launch performance with detailed insights.
                        </p>
                        <div className="pt-4">
                            <Link
                                href="/pricing"
                                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                            >
                                View Pricing Plans
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                    <a href="/launches" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]">
                        Create your first launch
                    </a>
                </div>
            )}
        </div>
    );
}
