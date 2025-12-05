import Link from "next/link";
import { Rocket } from "lucide-react";

interface CTABannerProps {
  title: string;
  description: string;
  buttonText?: string;
  href?: string;
  emoji?: string;
}

export default function CTABanner({
  title,
  description,
  buttonText = "Get Started",
  href,
  emoji = "rocket",
}: CTABannerProps) {
  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/60 sm:flex-row sm:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold text-slate-50 sm:text-3xl" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
            {title}
          </h2>
          <Rocket className="h-8 w-8 text-emerald-400" />
        </div>
        <p className="text-base text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{description}</p>
      </div>
      {href ? (
        <Link
          href={href}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 transition-colors shadow-sm shadow-emerald-900/40"
          style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        >
          {buttonText}
        </Link>
      ) : null}
    </div>
  );
}
