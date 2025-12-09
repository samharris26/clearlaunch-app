"use client";

import { useState } from "react";
import { useUsage } from "@/hooks/useUsage";
import { getPlanLimits, getNextPlan } from "@/lib/plans";
import Link from "next/link";
import { Zap, Crown, Users, Rocket, Sparkles, FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const planIcons = {
  free: <Crown className="h-5 w-5 text-[color:var(--muted)]" />,
  pro: <Zap className="h-5 w-5 text-sky-500" />,
  team: <Users className="h-5 w-5 text-purple-500" />
};

const planColors = {
  free: "bg-[color-mix(in_srgb,var(--surface)_96%,transparent)] text-[color:var(--heading)] border-[color:var(--border)]",
  pro: "bg-sky-50 text-sky-700 border-sky-200",
  team: "bg-purple-50 text-purple-700 border-purple-200"
};

export default function SettingsPageClient() {
  const { usage, loading, error } = useUsage();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-12 p-3">
        <div className="w-full max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] rounded w-48 mb-4"></div>
            <div className="h-4 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] rounded w-96 mb-8"></div>
            <div className="space-y-6">
              <div className="h-32 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] rounded"></div>
              <div className="h-32 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] rounded"></div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="flex flex-col items-center gap-12 p-3">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-2xl font-bold text-[color:var(--heading)] mb-4">Settings</h1>
          <p className="text-[color:var(--muted)]">Unable to load your plan information. Please try again later.</p>
        </div>
      </div>
    );
  }

  const limits = getPlanLimits(usage.plan);
  const nextPlan = getNextPlan(usage.plan);
  const launchesPercentage = (usage.currentLaunches / usage.maxLaunches) * 100;
  const aiCallsPercentage = (usage.currentAiCalls / usage.maxAiCalls) * 100;

  return (
    <div className="flex flex-col items-center gap-12 p-6 pb-20 text-[color:var(--text)]">
      <div className="w-full max-w-4xl space-y-8">
        <div>
          <h1
            className="text-3xl font-bold text-[color:var(--heading)] mb-2"
            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
          >
            Settings
          </h1>
          <p
            className="text-[color:var(--muted)]"
            style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
          >
            Manage your plan, usage, and account preferences
          </p>
        </div>

        {/* Current Plan Card */}
        <div className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-8 shadow-[var(--shadow-subtle)]">
          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-5">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] shadow-[var(--shadow-subtle)] ${usage.plan === 'pro' ? 'text-sky-500' :
                usage.plan === 'power' ? 'text-purple-500' : 'text-[color:var(--muted)]'
                }`}>
                {usage.plan === 'pro' ? <Zap className="h-8 w-8" /> :
                  usage.plan === 'power' ? <Rocket className="h-8 w-8" /> : // Changed from team ? Users to power ? Rocket
                    <Crown className="h-8 w-8" />}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2
                    className="text-2xl font-bold text-[color:var(--heading)] capitalize"
                    style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                  >
                    {usage.plan} Plan
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${usage.plan === 'pro' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20' :
                    usage.plan === 'power' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                      'bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] text-[color:var(--muted)] border-[color:var(--border)]'
                    }`}>
                    Active
                  </span>
                </div>
                <p className="text-[color:var(--muted)] mt-1">{limits.description}</p>
              </div>
            </div>
            {nextPlan && (
              <Link
                href="/pricing"
                className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--card)]"
              >
                Upgrade Plan
              </Link>
            )}
          </div>

          <div className="h-px w-full bg-[color:var(--border)] mb-8"></div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Launches Usage */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[color:var(--muted)]">Active Launches</h3>
                <span className="text-sm font-medium text-[color:var(--heading)]">
                  {usage.currentLaunches} <span className="text-[color:var(--muted)]">/ {usage.maxLaunches}</span>
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] border border-[color:var(--border)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${launchesPercentage >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    launchesPercentage >= 70 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                      'bg-gradient-to-r from-emerald-400 to-cyan-500'
                    }`}
                  style={{ width: `${Math.min(launchesPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                {usage.maxLaunches - usage.currentLaunches} launch slots remaining
              </p>
            </div>

            {/* AI Usage */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-[color:var(--muted)]">
                  {usage.plan === 'free' ? 'Plan Regenerations' : 'AI Credits'}
                </h3>
                <span className="text-sm font-medium text-[color:var(--heading)]">
                  {usage.plan === 'free' ? Math.min(usage.currentAiCalls, 3) : usage.currentAiCalls}
                  <span className="text-[color:var(--muted)]"> / {usage.plan === 'free' ? 3 : usage.maxAiCalls}</span>
                </span>
              </div>
              <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] border border-[color:var(--border)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${(usage.plan === 'free' ? (Math.min(usage.currentAiCalls, 3) / 3) * 100 : aiCallsPercentage) >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                    (usage.plan === 'free' ? (Math.min(usage.currentAiCalls, 3) / 3) * 100 : aiCallsPercentage) >= 70 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                      'bg-gradient-to-r from-indigo-400 to-purple-500'
                    }`}
                  style={{ width: `${Math.min((usage.plan === 'free' ? (Math.min(usage.currentAiCalls, 3) / 3) * 100 : aiCallsPercentage), 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-[color:var(--muted)]">
                {usage.plan === 'free'
                  ? `${Math.max(0, 3 - Math.min(usage.currentAiCalls, 3))} regenerations remaining this month`
                  : `${usage.maxAiCalls - usage.currentAiCalls} credits remaining this month`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Plan Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 hover:bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] transition-colors shadow-[var(--shadow-subtle)]">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
              <Rocket className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold text-[color:var(--heading)]">Launches</h3>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed">
              {usage.maxLaunches} active launch{usage.maxLaunches === 1 ? '' : 'es'} included in your plan.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 hover:bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] transition-colors shadow-[var(--shadow-subtle)]">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold text-[color:var(--heading)]">AI Intelligence</h3>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed">
              {usage.maxAiCalls} AI credits per month for content generation.
            </p>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 hover:bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] transition-colors shadow-[var(--shadow-subtle)]">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
              <FileText className="h-5 w-5" />
            </div>
            <h3 className="mb-2 font-semibold text-[color:var(--heading)]">Templates</h3>
            <p className="text-sm text-[color:var(--muted)] leading-relaxed">
              Access to {usage.plan === 'pro' || usage.plan === 'power' ? 'all advanced' : 'basic'} launch templates.
            </p>
          </div>
        </div>

        {/* Theme */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[color:var(--heading)]">Theme</h3>
              <p className="text-sm text-[color:var(--muted)]">Choose light or dark. We remember your last choice.</p>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-8 text-center shadow-[var(--shadow-subtle)]">
          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-[color:var(--heading)] mb-2">More Settings Coming Soon</h3>
            <p className="text-[color:var(--muted)] text-sm max-w-lg mx-auto">
              We're building advanced customization options, notification preferences, and team management features. Stay tuned!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

