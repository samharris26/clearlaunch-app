import {
  Instagram,
  Mail,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Megaphone,
  PenTool,
  Target,
  Layout,
  Search,
  Video,
  Smartphone,
  Share2,
  Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";

type TaskCardProps = {
  id?: string;
  title: string;
  description: string; // short one-liner under title (Category)
  chip?: { label: string; tone?: "blue" | "green" | "red" | "orange" };
  overview?: string; // subtle paragraph
  platform?: string | null;
  dueLabel?: string | null;
  reviewStatus?: string | null;
  ownerName?: string | null;
  outline?: string | null;
  postTime?: string | null;
  onCopyOutline?: () => void;
};

const chipToneToClasses: Record<"blue" | "green" | "red" | "orange", { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-300" },
  green: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-300" },
  red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-300" },
  orange: { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-300" },
};

const statusColors = {
  todo: "bg-slate-700",
  in_progress: "bg-sky-500",
  completed: "bg-emerald-500",
};

const platformIcons: Record<string, { icon: typeof Instagram; color: string }> = {
  instagram: { icon: Instagram, color: "text-pink-300" },
  twitter: { icon: Twitter, color: "text-sky-300" },
  x: { icon: Twitter, color: "text-slate-300" },
  linkedin: { icon: Linkedin, color: "text-blue-300" },
  email: { icon: Mail, color: "text-emerald-300" },
  youtube: { icon: Youtube, color: "text-red-300" },
  website: { icon: Globe, color: "text-slate-300" },
  tiktok: { icon: Video, color: "text-pink-400" },
  social: { icon: Share2, color: "text-indigo-300" },
  mobile: { icon: Smartphone, color: "text-slate-300" },
};

const categoryIcons: Record<string, { icon: typeof Instagram; color: string }> = {
  marketing: { icon: Megaphone, color: "text-amber-300" },
  content: { icon: PenTool, color: "text-purple-300" },
  design: { icon: PenTool, color: "text-pink-300" },
  strategy: { icon: Target, color: "text-blue-300" },
  seo: { icon: Search, color: "text-green-300" },
  website: { icon: Layout, color: "text-indigo-300" },
  video: { icon: Video, color: "text-red-300" },
  email: { icon: Mail, color: "text-emerald-300" },
};

export default function TaskCard({
  id,
  title,
  description,
  chip,
  overview,
  platform,
  dueLabel,
  reviewStatus,
  ownerName,
  outline,
  postTime,
  onCopyOutline,
}: TaskCardProps) {
  const chipTone = chip
    ? chipToneToClasses[chip.tone || "blue"]
    : null;

  // Helper to determine icon
  const getIcon = () => {
    // 1. Try platform first
    if (platform) {
      const pKey = platform.toLowerCase();
      if (platformIcons[pKey]) return platformIcons[pKey];
    }

    // 2. Try category (description)
    if (description) {
      const dKey = description.toLowerCase();

      // Exact match
      if (categoryIcons[dKey]) return categoryIcons[dKey];

      // Partial match
      if (dKey.includes("email")) return categoryIcons.email;
      if (dKey.includes("marketing")) return categoryIcons.marketing;
      if (dKey.includes("content") || dKey.includes("writing")) return categoryIcons.content;
      if (dKey.includes("design")) return categoryIcons.design;
      if (dKey.includes("strategy") || dKey.includes("plan")) return categoryIcons.strategy;
      if (dKey.includes("seo")) return categoryIcons.seo;
      if (dKey.includes("web") || dKey.includes("landing")) return categoryIcons.website;
      if (dKey.includes("video")) return categoryIcons.video;
    }

    return null;
  };

  const iconData = getIcon();
  const PlatformIcon = iconData?.icon;
  const platformColor = iconData?.color;

  // Determine title font size based on length (aim for 2 lines max)
  // text-2xl = 24px, text-xl = 20px, text-lg = 18px, text-base = 16px
  // Adding 2pt (~2.67px) to each size
  const getTitleSize = (titleText: string): string => {
    const wordCount = titleText.split(/\s+/).length;
    const charCount = titleText.length;

    // If more than 8 words or 60 characters, reduce size
    if (wordCount > 10 || charCount > 70) {
      return "text-[21px] font-semibold leading-5"; // 18px + 2pt = ~21px
    } else if (wordCount > 8 || charCount > 50) {
      return "text-[23px] font-semibold leading-5"; // 20px + 2pt = ~23px
    } else if (wordCount > 6 || charCount > 40) {
      return "text-[23px] font-semibold leading-6"; // 20px + 2pt = ~23px
    }
    return "text-[27px] font-semibold leading-6"; // 24px + 2pt = ~27px
  };

  const titleSizeClass = getTitleSize(title);

  const hasPostTime = !!postTime;

  return (
    <div className="group relative flex h-full w-full flex-col rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-6 shadow-xl shadow-slate-950/60 transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl hover:shadow-slate-900/50">
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-800/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex flex-1 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <h3
              className={`${titleSizeClass} tracking-[-0.02em] text-slate-50 line-clamp-2`}
              style={{
                fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                lineHeight: "calc(var(--spacing) * 8)",
              }}
            >
              {title}
            </h3>
            <div className="flex items-center gap-3">
              <p
                className="text-sm leading-6 text-slate-300 line-clamp-3"
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                {description}
              </p>
              {PlatformIcon && (
                <div className={`${platformColor} flex items-center`}>
                  <PlatformIcon className="h-4 w-4" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {overview ? (
            <p
              className="text-sm leading-6 text-slate-400 line-clamp-3"
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
            >
              {overview}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {chip && chipTone ? (
              <span
                className={["inline-flex items-center gap-1 rounded-full border px-3 py-1 font-medium", chipTone.bg, chipTone.border, chipTone.text].join(" ")}
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              >
                {chip.label}
              </span>
            ) : null}
            {ownerName && <span className="text-slate-500">Owner: {ownerName}</span>}
          </div>

          <div className="flex items-center gap-2">
            {outline && onCopyOutline && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCopyOutline();
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-2.5 py-1 text-xs text-slate-300 transition-colours hover:border-slate-600 hover:bg-slate-900"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy outline
              </button>
            )}


          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4 text-xs font-medium">
        {dueLabel && (
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-slate-200">
            {dueLabel}
          </span>
        )}
        {reviewStatus && (
          <span
            className={[
              "inline-flex items-center rounded-full border px-3 py-1",
              reviewStatus === "approved"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                : reviewStatus === "needs_review"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                  : "border-slate-700 bg-slate-800 text-slate-400",
            ].join(" ")}
          >
            {reviewStatus === "approved"
              ? "Approved"
              : reviewStatus === "needs_review"
                ? "Needs review"
                : "Draft"}
          </span>
        )}
      </div>
    </div>
  );
}
