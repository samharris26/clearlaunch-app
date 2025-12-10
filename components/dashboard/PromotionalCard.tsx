'use client';

import { Target, Calendar, CheckCircle, Zap } from "lucide-react";
import Link from "next/link";

interface PromotionalCardProps {
  type: 'upgrade' | 'add-launch';
  onUpgrade?: () => void;
  onAddLaunch?: () => void;
  variant?: 'card' | 'full';
}

export default function PromotionalCard({ type, onUpgrade, onAddLaunch, variant = 'card' }: PromotionalCardProps) {
  if (type === "upgrade") {
    if (variant === 'full') {
      return (
        <div className="group relative flex w-full flex-col items-center justify-between gap-6 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--border-strong)] sm:flex-row">
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

          <div className="relative flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                <Zap className="h-6 w-6" />
              </div>
              <h3
                className="text-2xl font-semibold text-[color:var(--heading)]"
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
              >
                Pro Launch Plan
              </h3>
            </div>
            <p className="text-base text-[color:var(--muted)] max-w-xl leading-7" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Unlock the full potential of your launches with AI power, priority support, and advanced analytics.
            </p>
          </div>

          <div className="relative">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)]"
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative flex h-full w-full flex-col justify-between rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-emerald-400">
                Upgrade
              </p>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                £10<span className="text-emerald-300/60">/mo</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h3
                className="text-2xl font-semibold text-[color:var(--heading)]"
                style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
              >
                Pro Launch Plan
              </h3>
              <p className="text-sm text-[color:var(--muted)] leading-6" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                Unlock the full potential of your launches with AI power.
              </p>
            </div>
          </div>

          <ul className="space-y-3 text-sm text-[color:var(--text)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            {[
              "3 launch slots",
              "100 AI calls per month",
              "Priority support",
              "Advanced analytics"
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                  <Zap className="h-3 w-3" />
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mt-6">
          <Link
            href="/pricing"
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)]"
            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    );
  }

  // Add Launch card
  return (
    <div
      className="group relative flex h-[364px] w-full flex-col justify-between gap-7 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-7 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--border-strong)]"
      onClick={onAddLaunch}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onAddLaunch?.();
        }
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Content Section */}
      <div className="relative flex flex-col gap-7">
        {/* Card Header */}
        <div className="flex flex-col gap-2">
          <h3
            className="text-xl font-semibold text-[color:var(--heading)] sm:text-2xl"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              lineHeight: "calc(var(--spacing) * 8)",
            }}
          >
            Create New Launch
          </h3>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="text-base text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Start planning your next launch
            </span>
            <span className="inline-flex h-7 items-center rounded-full bg-sky-500/10 border border-sky-500/30 px-3 text-xs font-semibold text-sky-600" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              New
            </span>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="flex flex-col gap-3">
          <div className="space-y-2">
            <p className="text-sm text-[color:var(--muted)] flex items-center gap-2" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <Target className="h-4 w-4 text-sky-400" />
              AI-powered planning
            </p>
            <p className="text-sm text-[color:var(--muted)] flex items-center gap-2" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <Calendar className="h-4 w-4 text-sky-400" />
              Timeline management
            </p>
            <p className="text-sm text-[color:var(--muted)] flex items-center gap-2" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <CheckCircle className="h-4 w-4 text-sky-400" />
              Task tracking
            </p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="relative">
        <button
          onClick={onAddLaunch}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)]"
          style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        >
          Create Launch
        </button>
      </div>
    </div>
  );
}