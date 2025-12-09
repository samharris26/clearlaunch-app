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
    <div className="relative flex h-full flex-1 flex-col gap-7 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-7 shadow-[var(--shadow-subtle)] transition-all hover:shadow-[var(--shadow-soft)]">
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          {icon || (
            <div className="h-6 w-6 rounded border-2 border-[color:var(--border)]"></div>
          )}
          <h3
            className="text-xl font-semibold text-[color:var(--heading)] sm:text-2xl"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              lineHeight: "calc(var(--spacing) * 8)",
            }}
          >
            {title}
          </h3>
          {comingSoon && !hideChip && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] border border-[color:var(--border)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--muted)]">
              <Clock className="h-3 w-3" />
              Coming soon
            </span>
          )}
        </div>
        <p className="text-base text-[color:var(--muted)] leading-7" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{description}</p>
      </div>
      {comingSoon ? (
        <span className="w-full cursor-not-allowed rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] py-2 text-sm font-semibold text-[color:var(--muted)] opacity-60 text-center" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          Coming soon
        </span>
      ) : href ? (
        <Link
          href={href}
          className="w-full rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] py-2 text-sm font-medium text-[color:var(--text)] hover:border-[color:var(--border-strong)] transition-colors text-center shadow-[var(--shadow-subtle)]"
          style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        >
          {buttonText}
        </Link>
      ) : null}
    </div>
  );
}
