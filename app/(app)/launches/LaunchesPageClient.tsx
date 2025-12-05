"use client";

import { useState } from "react";
import LaunchCardNew from "@/components/dashboard/LaunchCardNew";
import PromotionalCard from "@/components/dashboard/PromotionalCard";
import AddLaunchCard from "@/components/dashboard/AddLaunchCard";
import CTABanner from "@/components/dashboard/CTABanner";
import UpgradeModal from "@/components/UpgradeModal";
import { useUsage } from "@/hooks/useUsage";
import { cn } from "@/lib/utils";
import { AI_BUTTON_ACTIVE_CLASS } from "@/lib/aiButtonStyles";

type Launch = {
  id: string;
  name: string;
  type: string;
  progress: number;
  completed: number;
  total: number;
  phase: string;
  launchDate?: string;
};

interface LaunchesPageClientProps {
  launches: Launch[];
}

export default function LaunchesPageClient({ launches }: LaunchesPageClientProps) {
  const { usage, canCreateLaunch, launchesRemaining, loading } = useUsage();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<'launches' | 'ai'>('launches');

  const handleCreateLaunch = () => {
    if (!canCreateLaunch) {
      setUpgradeType('launches');
      setUpgradeModalOpen(true);
      return;
    }
    // Navigate to create launch page
    window.location.href = '/launches/new';
  };

  const safeLaunchesRemaining =
    typeof launchesRemaining === "number" ? Math.max(launchesRemaining, 0) : 0;

  const usageSummary = loading
    ? "Checking your plan limits..."
    : usage && typeof usage.maxLaunches === "number"
      ? canCreateLaunch
        ? `You're using ${usage.currentLaunches}/${usage.maxLaunches} launch slots — ${safeLaunchesRemaining} remaining.`
        : `You've used all ${usage.maxLaunches} launch slots. Upgrade to add more.`
      : `Track progress across ${launches.length} launch${launches.length === 1 ? "" : "es"}.`;

  const createButtonLabel = canCreateLaunch ? "Create new launch" : "Upgrade to add more";
  const createButtonClassName = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
    canCreateLaunch
      ? "border border-sky-400/60 bg-sky-500 text-slate-950 hover:bg-sky-400 shadow-[0_8px_24px_rgba(14,165,233,0.35)]"
      : "border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 shadow-emerald-900/30 hover:border-emerald-300"
  );

  return (
    <>
      <div className="flex w-full flex-col items-center gap-12 px-4 pt-12 pb-20">
        {/* Header */}
        <div className="flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl shadow-slate-950/60">
          <div className="flex flex-col gap-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Launch library
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                <h1
                  className="text-2xl font-semibold text-slate-50 sm:text-3xl"
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
                >
                  My launches
                </h1>
                <p
                  className="text-base text-slate-300"
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  {usageSummary}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <button
                  type="button"
                  onClick={handleCreateLaunch}
                  className={createButtonClassName}
                  disabled={loading}
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  {createButtonLabel}
                </button>
                {usage && typeof usage.maxLaunches === "number" && canCreateLaunch && (
                  <span className="text-xs text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    {safeLaunchesRemaining} launch{safeLaunchesRemaining === 1 ? "" : "es"} remaining
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Launch cards */}
        {launches.length > 0 ? (
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {launches.map((launch) => (
                <LaunchCardNew
                  key={launch.id}
                  launch={launch}
                  href={`/launch/${launch.id}`}
                />
              ))}

              {/* Add Launch Card - Show inside grid if there's space */}
              {!loading && canCreateLaunch && launches.length % 3 !== 0 && (
                <AddLaunchCard
                  variant="card"
                  onAddLaunch={handleCreateLaunch}
                />
              )}

              {/* Upgrade Card - Show inside grid if there's space */}
              {!loading && !canCreateLaunch && launches.length % 3 !== 0 && (
                <PromotionalCard
                  type="upgrade"
                />
              )}
            </div>

            {/* Add Launch Card - Show full width below grid if row is full */}
            {!loading && canCreateLaunch && launches.length % 3 === 0 && (
              <div className="mt-8">
                <AddLaunchCard
                  variant="full"
                  onAddLaunch={handleCreateLaunch}
                />
              </div>
            )}

            {/* Upgrade Card - Show full width below grid if row is full */}
            {!loading && !canCreateLaunch && launches.length % 3 === 0 && (
              <div className="mt-8">
                <PromotionalCard
                  type="upgrade"
                  variant="full"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-6xl rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 p-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
              <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-slate-50" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
              No launches yet
            </h3>
            <p className="mb-6 text-slate-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              Create your first launch to start planning and tracking your product launch journey.
            </p>
            <button
              onClick={handleCreateLaunch}
              className={cn(
                "inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                canCreateLaunch
                  ? AI_BUTTON_ACTIVE_CLASS
                  : "border border-emerald-400/50 bg-emerald-500/10 text-emerald-200 shadow-[0_8px_24px_rgba(16,185,129,0.25)] hover:border-emerald-300 hover:text-emerald-100"
              )}
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
              disabled={loading}
            >
              Create Your First Launch
            </button>
          </div>
        )}

      </div>

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        type={upgradeType}
        currentPlan={usage?.plan || 'free'}
      />
    </>
  );
}

