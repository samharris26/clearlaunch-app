"use client";

import { Rocket, CheckCircle2, ListTodo, Clock } from "lucide-react";

type GlobalAnalyticsStatsProps = {
    totalLaunches: number;
    totalTasks: number;
    completedTasks: number;
    tasksInProgress: number;
};

export default function GlobalAnalyticsStats({
    totalLaunches,
    totalTasks,
    completedTasks,
    tasksInProgress,
}: GlobalAnalyticsStatsProps) {
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {/* Total Launches */}
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[var(--shadow-subtle)]">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-[color:var(--muted)]">Active Launches</span>
                    <div className="p-2 rounded-lg bg-indigo-500/12 text-indigo-500">
                        <Rocket className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-[color:var(--heading)]">{totalLaunches}</div>
                    <div className="text-xs text-[color:var(--muted)] mt-1">Total projects</div>
                </div>
            </div>

            {/* Global Completion */}
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[var(--shadow-subtle)]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-[color:var(--muted)]">Avg. Completion</span>
                    <div className="p-2 rounded-lg bg-emerald-500/12 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-[color:var(--heading)]">{completionRate}%</div>
                    <div className="w-full h-1.5 bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Total Tasks */}
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[var(--shadow-subtle)]">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-[color:var(--muted)]">Total Tasks</span>
                    <div className="p-2 rounded-lg bg-sky-500/12 text-sky-600">
                        <ListTodo className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-[color:var(--heading)]">{totalTasks}</div>
                    <div className="text-xs text-[color:var(--muted)] mt-1">Across all launches</div>
                </div>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 flex flex-col justify-between gap-4 relative overflow-hidden group shadow-[var(--shadow-subtle)]">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-[color:var(--muted)]">In Progress</span>
                    <div className="p-2 rounded-lg bg-amber-500/12 text-amber-600">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-[color:var(--heading)]">{tasksInProgress}</div>
                    <div className="text-xs text-[color:var(--muted)] mt-1">Active tasks</div>
                </div>
            </div>
        </div>
    );
}
