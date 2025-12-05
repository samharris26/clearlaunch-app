"use client";

import { useMemo } from "react";
import { TaskRecord } from "@/types/tasks";
import { PieChart, BarChart, Calendar, CheckCircle2, Circle, Clock, TrendingUp } from "lucide-react";

type LaunchAnalyticsProps = {
    tasks: TaskRecord[];
    launchDate?: string | null;
};

export default function LaunchAnalytics({ tasks, launchDate }: LaunchAnalyticsProps) {
    const stats = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        const inProgress = tasks.filter((t) => t.status === "in_progress").length;
        const todo = tasks.filter((t) => t.status === "todo" || !t.status).length;

        const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Calculate days remaining
        let daysRemaining: number | null = null;
        if (launchDate) {
            const now = new Date();
            const launch = new Date(launchDate);
            const diffTime = launch.getTime() - now.getTime();
            daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        // Category breakdown
        const categories: Record<string, number> = {};
        tasks.forEach((t) => {
            const cat = t.category || "Uncategorized";
            categories[cat] = (categories[cat] || 0) + 1;
        });

        const topCategories = Object.entries(categories)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            total,
            completed,
            inProgress,
            todo,
            percentComplete,
            daysRemaining,
            topCategories,
        };
    }, [tasks, launchDate]);

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-500">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Progress Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-medium text-slate-400">Completion</span>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-slate-100">{stats.percentComplete}%</div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${stats.percentComplete}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Countdown Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-medium text-slate-400">Time Remaining</span>
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-slate-100">
                            {stats.daysRemaining !== null ? (
                                stats.daysRemaining > 0 ? `${stats.daysRemaining} Days` :
                                    stats.daysRemaining === 0 ? "Today!" : "Launched"
                            ) : (
                                "--"
                            )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">Until launch day</div>
                    </div>
                </div>

                {/* Total Tasks Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-medium text-slate-400">Total Tasks</span>
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                            <PieChart className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-slate-100">{stats.total}</div>
                        <div className="text-xs text-slate-500 mt-1">Action items</div>
                    </div>
                </div>

                {/* Active Tasks Card */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6 flex flex-col justify-between gap-4 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-sm font-medium text-slate-400">In Progress</span>
                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                            <Clock className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-3xl font-bold text-slate-100">{stats.inProgress}</div>
                        <div className="text-xs text-slate-500 mt-1">Currently active</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Breakdown */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-slate-400" />
                        Task Status
                    </h3>

                    <div className="space-y-6">
                        {/* Todo */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-300">
                                    <Circle className="h-3 w-3 text-slate-500" />
                                    To Do
                                </div>
                                <span className="text-slate-500 font-medium">{stats.todo} tasks</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-slate-600 rounded-full transition-all duration-500 group-hover:bg-slate-500"
                                    style={{ width: `${stats.total > 0 ? (stats.todo / stats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* In Progress */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <div className="flex items-center gap-2 text-sky-300">
                                    <Clock className="h-3 w-3 text-sky-500" />
                                    In Progress
                                </div>
                                <span className="text-slate-500 font-medium">{stats.inProgress} tasks</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-sky-500 rounded-full transition-all duration-500 group-hover:bg-sky-400"
                                    style={{ width: `${stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Completed */}
                        <div className="group">
                            <div className="flex items-center justify-between mb-2 text-sm">
                                <div className="flex items-center gap-2 text-emerald-300">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    Completed
                                </div>
                                <span className="text-slate-500 font-medium">{stats.completed} tasks</span>
                            </div>
                            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-500 group-hover:bg-emerald-400"
                                    style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-6">
                    <h3 className="text-lg font-semibold text-slate-100 mb-6 flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-slate-400" />
                        Top Categories
                    </h3>

                    <div className="space-y-4">
                        {stats.topCategories.map(([category, count], index) => (
                            <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-400">
                                        {index + 1}
                                    </div>
                                    <span className="text-sm text-slate-200 font-medium">{category}</span>
                                </div>
                                <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-800 text-slate-400">
                                    {count}
                                </span>
                            </div>
                        ))}

                        {stats.topCategories.length === 0 && (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No categories found
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
