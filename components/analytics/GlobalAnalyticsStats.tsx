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
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-slate-400">Active Launches</span>
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Rocket className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-slate-100">{totalLaunches}</div>
                    <div className="text-xs text-slate-500 mt-1">Total projects</div>
                </div>
            </div>

            {/* Global Completion */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-slate-400">Avg. Completion</span>
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-slate-100">{completionRate}%</div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${completionRate}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Total Tasks */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-slate-400">Total Tasks</span>
                    <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                        <ListTodo className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-slate-100">{totalTasks}</div>
                    <div className="text-xs text-slate-500 mt-1">Across all launches</div>
                </div>
            </div>

            {/* In Progress */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center justify-between relative z-10">
                    <span className="text-sm font-medium text-slate-400">In Progress</span>
                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                <div className="relative z-10">
                    <div className="text-3xl font-bold text-slate-100">{tasksInProgress}</div>
                    <div className="text-xs text-slate-500 mt-1">Active tasks</div>
                </div>
            </div>
        </div>
    );
}
