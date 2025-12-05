"use client";

import { useMemo, useState } from "react";
import { Settings, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import LaunchSettingsModal from "@/components/LaunchSettingsModal";
import GenerateAIPlanButton from "./GenerateAIPlanButton";
import type { LaunchHealthMetrics } from "@/lib/launchHealth";

interface LaunchHeaderProps {
  launch: {
    id: string;
    launchName?: string | null;
    description?: string | null;
    target_date?: string | null;
    launchType?: string | null;
    initialAIGenerated?: boolean | null;
  };
  progress: number;
  completedTasks: number;
  totalTasks: number;
  launchId: string;
  hasTasks: boolean;
  health?: LaunchHealthMetrics;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    })
      .format(date)
      .replace(/,/g, "");
  } catch {
    return null;
  }
};



const getCompletenessCopy = (value: number) => {
  if (value >= 90) return "All critical beats covered";
  if (value >= 70) return "Most key moments covered";
  if (value > 0) return "Keep building towards launch";
  return "Start planning your campaign beats";
};

export default function LaunchHeader({
  launch,
  progress,
  completedTasks,
  totalTasks,
  launchId,
  hasTasks,
  health,
}: LaunchHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const formattedLaunchDate = useMemo(() => formatDate(launch.target_date), [launch.target_date]);
  const metrics = {
    planCompleteness: health?.planCompleteness ?? 0,
    platformCoverageCount: health?.platformCoverageCount ?? 0,
    teamWorkloadLabel: health?.teamWorkloadLabel ?? "Not set",
    averageTasksPerDay: health?.averageTasksPerDay ?? 0,
  };

  return (
    <>
      <div className="flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-2xl shadow-slate-950/70">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1 space-y-4">
            <div>
              <h1
                className="text-2xl font-semibold text-slate-50 sm:text-3xl"
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
              >
                {launch.launchName || "Untitled Launch"}
              </h1>
              <p
                className="mt-1 text-sm text-slate-400 sm:text-base"
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                {launch.description || "Launch details and progress tracking"}
              </p>
            </div>
            {formattedLaunchDate && (
              <div className="flex flex-col gap-1">
                <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Launch date
                </span>
                <span className="text-base font-semibold text-slate-100">{formattedLaunchDate}</span>
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:flex-col lg:items-end">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center justify-center rounded-xl border border-slate-800/80 p-2 text-slate-400 transition-colors hover:bg-slate-900/70 hover:text-slate-50"
                aria-label="Launch settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
            <div className="w-full sm:w-auto">
              <GenerateAIPlanButton
                launchId={launchId}
                hasTasks={hasTasks}
                initialAIGenerated={launch.initialAIGenerated || false}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-900/20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500 group-hover:text-emerald-400/80 transition-colors">
              Plan completeness
            </p>
            <p className="mt-2 text-3xl font-semibold text-emerald-300">
              {metrics.planCompleteness}%
            </p>
            <p className="mt-1 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{getCompletenessCopy(metrics.planCompleteness)}</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 transition-all hover:-translate-y-1 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-900/20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500 group-hover:text-sky-400/80 transition-colors">
              Platform coverage
            </p>
            <p className="mt-2 text-3xl font-semibold text-sky-300">
              {metrics.platformCoverageCount}
            </p>
            <p className="mt-1 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Active channels in this plan</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-5 transition-all hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-900/20">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500 group-hover:text-amber-400/80 transition-colors">
              Workload
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-300">
              {metrics.teamWorkloadLabel}
            </p>
            <p className="mt-1 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
              {metrics.averageTasksPerDay.toFixed(1)} tasks per day
            </p>
          </div>
        </div>
      </div>

      <LaunchSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        launch={launch}
      />
    </>
  );
}

