"use client";

import { calculateLaunchHealth, type LaunchHealthMetrics } from "@/lib/launchHealth";
import { getLaunchTemplateById, type LaunchTemplate } from "@/lib/launchTemplates";
import type { TaskRecord } from "@/types/tasks";
import { Sparkles, Twitter, Send, Clock } from "lucide-react";
import { formatPostTime } from "@/lib/smartTiming";

interface LaunchHealthPanelProps {
  launch: {
    id: string;
    launch_start_date?: string | null;
    launch_end_date?: string | null;
    template_id?: string | null;
  };
  tasks: TaskRecord[];
  metrics?: LaunchHealthMetrics;
  template?: LaunchTemplate;
}

export default function LaunchHealthPanel({ launch, tasks, metrics, template: templateOverride }: LaunchHealthPanelProps) {
  const template = templateOverride || (launch.template_id ? getLaunchTemplateById(launch.template_id) : undefined);
  const health: LaunchHealthMetrics = metrics ?? calculateLaunchHealth(launch, tasks, template);

  const getCompletenessDescriptor = (percentage: number): string => {
    if (percentage >= 90) return "All critical moments covered.";
    if (percentage >= 70) return "Most beats covered.";
    if (percentage >= 50) return "Some beats need tasks.";
    return "Plan needs more tasks.";
  };

  const getWorkloadColor = (label: string): string => {
    switch (label) {
      case "Light":
        return "text-emerald-300";
      case "Balanced":
        return "text-sky-300";
      case "Heavy":
        return "text-amber-300";
      default:
        return "text-slate-300";
    }
  };

  const getPlatformIcon = (platform: string | null | undefined) => {
    if (!platform) return null;
    const platformLower = platform.toLowerCase();
    if (platformLower === "x" || platformLower === "twitter") {
      return Twitter;
    }
    if (platformLower === "email") {
      return Send;
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-100" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            Launch health overview
          </p>
          <p className="text-xs text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            See how your launch is tracking at a glance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3 md:gap-5">
        <div className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="space-y-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Plan completeness</p>
            <p className="text-2xl font-semibold text-emerald-300">{health.planCompleteness}%</p>
          </div>
          <p className="text-xs text-slate-400">{getCompletenessDescriptor(health.planCompleteness)}</p>
        </div>
        <div className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="space-y-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Platform coverage</p>
            <p className="text-2xl font-semibold text-sky-300">{health.platformCoverageCount}</p>
          </div>
          <p className="text-xs text-slate-400">Balanced across channels.</p>
        </div>
        <div className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="space-y-1">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">Workload</p>
            <p className={`text-2xl font-semibold ${getWorkloadColor(health.teamWorkloadLabel)}`}>
              {health.teamWorkloadLabel}
            </p>
          </div>
          <p className="text-xs text-slate-400">
            {health.averageTasksPerDay.toFixed(1)} actions per day
          </p>
        </div>
      </div>

      {health.todaysKeyMoments.length > 0 && (
        <div className="space-y-2 text-[0.625rem]">
          <p className="text-slate-400">Today's key moments</p>
          <div className="space-y-1.5">
            {health.todaysKeyMoments.slice(0, 3).map((task) => {
              const PlatformIcon = getPlatformIcon(task.platform);
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg bg-slate-900/80 border border-slate-800 px-2.5 py-2"
                >
                  <div className="flex items-center gap-2">
                    {PlatformIcon && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-500/10">
                        <PlatformIcon className="w-3 h-3 text-sky-300" />
                      </span>
                    )}
                    <div>
                      <p className="text-xs text-slate-100">{task.title}</p>
                      {task.post_time && (
                        <p className="text-[0.625rem] text-slate-500">
                          Best window · {formatPostTime(task.post_time)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-950 border border-slate-700 px-2 py-0.5 text-[0.625rem] text-slate-300">
                    {task.review_status === "approved" ? "Approved" :
                      task.review_status === "needs_review" ? "Needs review" :
                        "Draft"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

