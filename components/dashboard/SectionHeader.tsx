import Link from "next/link";

interface SectionHeaderProps {
  title: string;
  description: string;
  buttonText?: string;
  href?: string;
}

export default function SectionHeader({
  title,
  description,
  buttonText = "View All",
  href,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-slate-50" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>{title}</h2>
        <p className="text-base text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{description}</p>
      </div>
      {href ? (
        <Link
          href={href}
          className="rounded-full border border-slate-700 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-900 hover:border-slate-600 transition-colors"
          style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        >
          {buttonText}
        </Link>
      ) : null}
    </div>
  );
}
