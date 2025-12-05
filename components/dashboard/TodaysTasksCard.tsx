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

type Task = {
  id: string;
  title: string;
  launchName: string;
  due: "Overdue" | "Today" | "Soon";
};

type TodaysTasksCardProps = {
  colors: Palette;
  tasks: Task[];
};

export default function TodaysTasksCard({ colors, tasks }: TodaysTasksCardProps) {
  const today = tasks.filter((task) => task.due === "Today");
  const upcoming = tasks.filter((task) => task.due === "Soon");

  return (
    <Link href="/tasks" className="block">
      <article className="relative overflow-hidden rounded-lg border border-[#2b273c]/10 bg-white px-6 py-4 shadow-[0_4px_12px_-2px_rgba(9,18,55,0.1)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_8px_24px_-4px_rgba(9,18,55,0.15)] cursor-pointer">
      <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#f3e5da]/30 blur-2xl" />
      <header>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ color: colors.dark }}>
            Today&apos;s Task
          </h2>
          <button
            type="button"
            className="text-xs font-medium text-[#f84867] hover:text-[#d13a54] transition-colors"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Handle view all action
            }}
          >
            View All
          </button>
        </div>
        <p className="mt-1 text-sm text-[#091237]/65">
          View upcoming tasks
        </p>
      </header>

      <div className="mt-6 space-y-4">
        {/* Main Task Display */}
        {today.length > 0 ? (
          <div className="rounded-lg border border-[#f3e5da]/50 bg-[#f3e5da]/20 p-4">
            <h3 className="text-sm font-semibold text-[#091237] mb-2">
              {today[0].title}
            </h3>
            <p className="text-xs text-[#091237]/70 mb-3">
              {today[0].launchName}
            </p>
            
            {/* User Avatars */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-6 w-6 rounded-full border-2 border-white bg-[#f3e5da] flex items-center justify-center text-xs font-medium text-[#091237]"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-2">
              <div className="h-1.5 w-full rounded-full bg-white/60">
                <div 
                  className="h-full rounded-full bg-[#f84867]"
                  style={{ width: `${Math.min(100, Math.max(10, (today.length / Math.max(today.length + upcoming.length, 1)) * 100))}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#091237]/70">
                {Math.round((today.length / Math.max(today.length + upcoming.length, 1)) * 100)}% Complete
              </span>
              <span className="text-[#091237]/70">
                Due Date: {new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#f3e5da]/50 bg-[#f3e5da]/10 p-6 text-center">
            <p className="text-sm text-[#091237]/60">No tasks for today</p>
            <p className="text-xs text-[#091237]/50 mt-1">You&apos;re all caught up!</p>
          </div>
        )}
      </div>

      </article>
    </Link>
  );
}
