interface Launch {
  id: string;
  name: string;
  type: string;
  progress: number;
  completed: number;
  total: number;
  phase: string;
  launchDate?: string;
  nextTask?: string;
}

import Link from "next/link";

interface LaunchCardNewProps {
  launch: Launch;
  href?: string;
}

export default function LaunchCardNew({ launch, href }: LaunchCardNewProps) {
  const CardContent = () => (
    <div className="group relative flex h-full min-w-[280px] max-w-[360px] flex-1 flex-col justify-between gap-7 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-6 shadow-xl shadow-slate-950/60 transition-all hover:-translate-y-1 hover:border-sky-500/30">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content Section */}
      <div className="relative flex flex-col gap-7">
        {/* Card Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h3
              className="text-xl font-semibold text-slate-50 sm:text-2xl"
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                lineHeight: "calc(var(--spacing) * 8)",
              }}
            >
              {launch.name}
            </h3>
            {launch.launchDate && (
              <span className="shrink-0 text-xs text-slate-500 font-medium pt-2" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(launch.launchDate))}
              </span>
            )}
          </div>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-base text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              {launch.completed} tasks completed
            </span>
            <span className="inline-flex h-7 items-center rounded-full bg-sky-500/10 border border-sky-500/30 px-3 text-xs font-medium text-sky-300 whitespace-nowrap" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              {launch.phase}
            </span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex flex-col gap-1">
          <div className="h-4 w-full rounded-full bg-slate-800/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${launch.progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              {launch.progress.toFixed(0)}% complete
            </p>
            <p className="text-sm font-medium text-sky-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              {launch.nextTask ? "Next up" : "All done"}
            </p>
          </div>
          <p className="text-sm text-slate-300 truncate" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            {launch.nextTask || "No pending tasks"}
          </p>
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}
