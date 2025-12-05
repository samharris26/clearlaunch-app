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

type NewLaunchCardProps = {
  colors: Palette;
};

export default function NewLaunchCard({ colors }: NewLaunchCardProps) {
  return (
    <Link href="/launch/new" className="block">
      <article className="group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border-2 border-dashed border-[#f3e5da]/50 bg-gradient-to-br from-white via-[#f6f5f4] to-white px-6 py-4 text-left transition hover:border-[#f84867]/40 hover:shadow-[0_4px_12px_-2px_rgba(248,72,103,0.15)] cursor-pointer">
        <div className="absolute inset-0">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#f3e5da]/40 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-[#2df697]/20 blur-3xl" />
        </div>
        <div className="relative space-y-4">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 group-hover:bg-sky-500/20 transition-colours"
            style={{ color: colors.primary, backgroundColor: colors.light }}
          >
            +
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#091237]">Create new launch</h3>
            <p className="mt-2 text-sm text-[#091237]/65">
              Spin up a guided roadmap with tasks, timelines, and launch templates tailored to your goals.
            </p>
          </div>
          <ul className="space-y-2 text-xs text-[#091237]/55">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f84867]" />
              Instant roadmap outlines
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2df697]" />
              Cross-channel launch checklist
            </li>
          </ul>
        </div>
      </article>
    </Link>
  );
}
