"use client";

import { TaskRecord } from "@/types/tasks";
import { ArrowRight, CheckCircle2, Clock, MoreHorizontal } from "lucide-react";
import Link from "next/link";

type Launch = {
    id: string;
    launchName: string;
    launch_start_date: string | null;
    userId: string;
    createdAt: string;
};

type LaunchAnalyticsTableProps = {
    launches: Launch[];
    allTasks: TaskRecord[];
};

export default function LaunchAnalyticsTable({ launches, allTasks }: LaunchAnalyticsTableProps) {
    return (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/50">
                            <th className="px-6 py-4 font-medium text-slate-400">Launch Name</th>
                            <th className="px-6 py-4 font-medium text-slate-400">Progress</th>
                            <th className="px-6 py-4 font-medium text-slate-400">Tasks</th>
                            <th className="px-6 py-4 font-medium text-slate-400">Status</th>
                            <th className="px-6 py-4 font-medium text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {launches.map((launch) => {
                            const launchTasks = allTasks.filter((t) => t.launchId === launch.id);
                            const total = launchTasks.length;
                            const completed = launchTasks.filter((t) => t.status === "completed").length;
                            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                            // Determine status
                            let status = "Planning";
                            let statusColor = "text-slate-400 bg-slate-500/10 border-slate-500/20";

                            if (progress === 100 && total > 0) {
                                status = "Completed";
                                statusColor = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
                            } else if (progress > 0) {
                                status = "In Progress";
                                statusColor = "text-sky-400 bg-sky-500/10 border-sky-500/20";
                            }

                            return (
                                <tr key={launch.id} className="group hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-slate-200">{launch.launchName}</span>
                                            <span className="text-xs text-slate-500">
                                                {launch.launch_start_date
                                                    ? new Date(launch.launch_start_date).toLocaleDateString(undefined, {
                                                        year: "numeric",
                                                        month: "short",
                                                        day: "numeric",
                                                    })
                                                    : "No date set"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 max-w-[140px]">
                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${progress === 100 ? "bg-emerald-500" : "bg-sky-500"
                                                        }`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-medium text-slate-400 w-8 text-right">
                                                {progress}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-slate-400">
                                            <div className="flex items-center gap-1.5" title="Completed">
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/70" />
                                                <span>{completed}</span>
                                            </div>
                                            <div className="w-px h-3 bg-slate-800" />
                                            <div className="flex items-center gap-1.5" title="Total">
                                                <Clock className="h-3.5 w-3.5 text-slate-600" />
                                                <span>{total}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}
                                        >
                                            {status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/launch/${launch.id}`}
                                            className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-500/10 transition-colors"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
