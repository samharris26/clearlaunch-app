
import { Sparkles, CheckCircle, Calendar } from "lucide-react";

type FocusSummary = {
  launchName: string;
  taskTitle: string;
} | null;

type WelcomeSectionProps = {
  userName: string;
  focus: FocusSummary;
  nextLaunchLabel: string | null;
  nextLaunchDays: number | null;
  activeLaunches: number;
  totalCompleted: number;
};

export default function WelcomeSection({
  userName,
  focus,
  nextLaunchLabel,
  nextLaunchDays,
  activeLaunches,
  totalCompleted,
}: WelcomeSectionProps) {
  const pillText =
    nextLaunchLabel && typeof nextLaunchDays === "number"
      ? `Next launch: ${nextLaunchLabel} in ${nextLaunchDays} day${
          nextLaunchDays === 1 ? "" : "s"
        }`
      : "Next launch: No date set";

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/60 px-8 py-6 shadow-xl shadow-slate-950/60">
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-300">
              ●
            </span>
            <span className="uppercase tracking-wide">Launch momentum</span>
          </div>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-50 sm:text-4xl" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
              Hey {userName}! Ready to launch something legendary?
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              {focus
                ? `Today's spotlight is on ${focus.launchName}. Keep the energy going with "${focus.taskTitle}".`
                : "You're all caught up—take a moment to celebrate your momentum and plan the next big move."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <Calendar className="h-4 w-4" />
              {pillText}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 text-sm font-medium text-emerald-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <CheckCircle className="h-4 w-4" />
              {totalCompleted} tasks wrapped
            </span>
          </div>
        </div>

        <div className="grid w-full max-w-xs grid-cols-1 gap-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-xl">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Active launches
            </div>
            <div className="mt-1 text-3xl font-semibold text-slate-50" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
              {activeLaunches}
            </div>
            <p className="text-xs text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Keep each lane moving forward in sync.
            </p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="text-xs uppercase tracking-wide text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Focus mantra
            </div>
            <p className="mt-2 text-sm font-medium text-sky-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              "Clarity + consistency = launch magic."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
