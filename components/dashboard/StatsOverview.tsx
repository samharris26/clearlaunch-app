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

type Stat = {
  label: string;
  value: string;
  description: string;
  accent: "primary" | "success" | "warning";
  delta?: string;
};

const accentStyles: Record<Stat["accent"], { bg: string; dot: string; text: string }> = {
  primary: { bg: "bg-[#f3e5da]/30", dot: "bg-[#f84867]", text: "text-[#f84867]" },
  success: { bg: "bg-[#f3e5da]/30", dot: "bg-[#2df697]", text: "text-[#2df697]" },
  warning: { bg: "bg-[#f3e5da]/50", dot: "bg-[#f84867]", text: "text-[#f84867]" },
};

type StatsOverviewProps = {
  colors: Palette;
  stats: Stat[];
};

export default function StatsOverview({ colors, stats }: StatsOverviewProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const accent = accentStyles[stat.accent];
        return (
          <div
            key={stat.label}
            className="flex flex-col justify-between rounded-lg border border-white/70 bg-white px-5 py-4 shadow-[0_4px_12px_-2px_rgba(16,21,41,0.15)]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-[#091237]/60">
                {stat.label}
              </span>
              <span className={`inline-flex items-center gap-1 rounded-full ${accent.bg} px-3 py-1 text-[10px] font-semibold ${accent.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
                {stat.delta ?? "steady"}
              </span>
            </div>
            <div className="mt-4 text-3xl font-semibold" style={{ color: colors.dark }}>
              {stat.value}
            </div>
            <p className="mt-2 text-sm leading-relaxed text-[#091237]/60">{stat.description}</p>
          </div>
        );
      })}
    </section>
  );
}
