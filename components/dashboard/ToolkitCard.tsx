import Link from "next/link";
import { Clock } from "lucide-react";
import { ReactNode } from "react";

interface ToolkitCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  buttonText?: string;
  href?: string;
  comingSoon?: boolean;
  hideChip?: boolean;
}

export default function ToolkitCard({
  title,
  description,
  icon,
  buttonText = "Learn More",
  href,
  comingSoon = false,
  hideChip = false,
}: ToolkitCardProps) {
  return (
    <div className="relative flex h-full flex-1 flex-col gap-7 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/60">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          {icon || (
            <div className="h-6 w-6 rounded border-2 border-slate-700"></div>
          )}
          <h3
            className="text-xl font-semibold text-slate-50 sm:text-2xl"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              lineHeight: "calc(var(--spacing) * 8)",
            }}
          >
            {title}
          </h3>
          {comingSoon && !hideChip && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 border border-slate-700 px-2 py-0.5 text-[11px] font-medium text-slate-400">
              <Clock className="h-3 w-3" />
              Coming soon
            </span>
          )}
        </div>
        <p className="text-base text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{description}</p>
      </div>
      {comingSoon ? (
        <span className="w-full cursor-not-allowed rounded-full border border-slate-700 bg-slate-900/80 py-2 text-sm font-semibold text-slate-500 text-center" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          Coming soon
        </span>
      ) : href ? (
        <Link
          href={href}
          className="w-full rounded-full border border-slate-700 bg-slate-900/80 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900 hover:border-slate-600 transition-colors text-center"
          style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        >
          {buttonText}
        </Link>
      ) : null}
    </div>
  );
}
