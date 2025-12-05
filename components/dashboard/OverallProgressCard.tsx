"use client";


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

type OverallProgressCardProps = {
  colors: Palette;
  averageProgress: number;
};

export default function OverallProgressCard({
  colors,
  averageProgress,
}: OverallProgressCardProps) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.max(0, Math.min(averageProgress, 100));
  const progressStroke = (clampedProgress / 100) * circumference;


  return (
    <article className="overflow-hidden rounded-lg border border-[#2b273c]/10 bg-white px-6 py-4 shadow-[0_4px_12px_-2px_rgba(9,18,55,0.1)]">
      <header className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: colors.dark }}>
              Company Performance
            </h2>
            <button
              type="button"
              className="text-xs font-medium text-[#f84867] hover:text-[#d13a54] transition-colors"
            >
              View All
            </button>
          </div>
          <p className="mt-1 text-sm text-[#091237]/65">
            Monthly Analysed Report
          </p>
        </div>
      </header>

      <div className="mt-6 flex items-center justify-center">
        <div className="relative">
          <svg
            width="160"
            height="160"
            className="-rotate-90"
            role="img"
            aria-label={`Overall progress ${clampedProgress}%`}
          >
            <circle
              cx="80"
              cy="80"
              r={radius * 0.8}
              fill="none"
              stroke={colors.light}
              strokeWidth="12"
              strokeLinecap="round"
            />
            <circle
              cx="80"
              cy="80"
              r={radius * 0.8}
              fill="none"
              stroke="#f84867"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${progressStroke * 0.8} ${(circumference * 0.8) - (progressStroke * 0.8)}`}
              style={{ transition: "stroke-dasharray 1s ease, stroke 0.4s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold text-[#091237]">{clampedProgress}%</div>
            <div className="text-xs text-[#091237]/60">Project Completed</div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f84867]"></div>
            <span className="text-[#091237]/70">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f3e5da]"></div>
            <span className="text-[#091237]/70">Still Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#2df697]"></div>
            <span className="text-[#091237]/70">Completed</span>
          </div>
        </div>
      </div>
    </article>
  );
}
