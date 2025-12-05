"use client";

import Link from "next/link";

type Palette = {
  light: string;
  dark: string;
  primary: string;
  secondary: string;
  info: string;
  success: string;
  warning: string;
  danger: string;
};

type LaunchSummary = {
  id: string;
  name: string;
  type: string;
  progress: number;
  completed: number;
  total: number;
  phase: string;
  launchDate?: string;
};

type LaunchCardProps = {
  colors: Palette;
  launch: LaunchSummary;
};

function getDaysUntil(dateISO?: string) {
  if (!dateISO) return null;
  const diff = new Date(dateISO).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function LaunchCard({ colors, launch }: LaunchCardProps) {
  const percent = Math.max(0, Math.min(launch.progress, 100));
  const daysUntil = getDaysUntil(launch.launchDate);
  const remaining = Math.max(launch.total - launch.completed, 0);

  return (
    <Link href={`/launch/${launch.id}`} className="block">
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 px-6 py-4 shadow-xl shadow-slate-950/60 transition-transform duration-200 hover:-translate-y-1 hover:border-slate-700 cursor-pointer">
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent opacity-60 transition duration-300 group-hover:opacity-80" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3
              className="text-lg font-semibold text-slate-50"
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                lineHeight: "calc(var(--spacing) * 8)",
              }}
            >
              {launch.name}
            </h3>
            <button
              type="button"
              className="text-xs font-medium text-sky-300 hover:text-sky-200 transition-colors"
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle view all action
              }}
            >
              View All
            </button>
          </div>
          <p className="mt-1 text-sm text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            {launch.completed} tasks completed
          </p>
        </div>
      </div>

      <div className="relative mt-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>Progress</span>
          <span className="text-sm font-semibold text-sky-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/50">
          <div
            className="h-full rounded-full bg-sky-500"
            style={{
              width: `${percent}%`,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-900 border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            {launch.type}
          </span>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            {launch.phase}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-6 w-6 rounded-full border-2 border-slate-950 bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-200"
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              {remaining > 0 && (
                <div className="h-6 w-6 rounded-full border-2 border-slate-950 bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-200" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  +{remaining}
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            Due: {typeof daysUntil === "number" ? (daysUntil === 0 ? "Today" : `${daysUntil} days`) : "TBD"}
          </div>
        </div>
      </div>
      </article>
    </Link>
  );
}
