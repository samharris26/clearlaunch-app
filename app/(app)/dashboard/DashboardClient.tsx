"use client";

import { useState } from "react";
import Link from "next/link";
import LaunchCardNew from "@/components/dashboard/LaunchCardNew";
import PromotionalCard from "@/components/dashboard/PromotionalCard";
import { useUsage } from "@/hooks/useUsage";

type Launch = {
  id: string;
  name: string;
  type: string;
  progress: number;
  completed: number;
  total: number;
  phase: string;
  launchDate?: string;
  nextTask?: string;
};

interface DashboardClientProps {
  launches: Launch[];
  hasBusinessProfile: boolean;
}

export default function DashboardClient({ launches, hasBusinessProfile }: DashboardClientProps) {
  const { usage, canCreateLaunch, loading } = useUsage();

  const handleCreateLaunch = () => {
    if (!canCreateLaunch) {
      window.location.href = '/pricing';
      return;
    }
    // Navigate to create launch page
    window.location.href = '/launches/new';
  };

  return (
    <>
      {/* My Launches Section */}
      <div className="flex w-full max-w-6xl flex-col gap-3">
        {/* Launch Cards Row */}
        {launches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {launches.map((launch) => (
                <LaunchCardNew
                  key={launch.id}
                  launch={launch}
                  href={`/launch/${launch.id}`}
                />
              ))}

              {/* If grid row is NOT full, show card here to fill gap */}
              {!loading && launches.length % 3 !== 0 && (
                !canCreateLaunch ? (
                  <PromotionalCard
                    type="upgrade"
                  />
                ) : (
                  <PromotionalCard
                    type="add-launch"
                    onAddLaunch={handleCreateLaunch}
                  />
                )
              )}
            </div>

            {/* If grid row IS full, show card below */}
            {!loading && launches.length % 3 === 0 && (
              <div className="mt-4">
                {!canCreateLaunch ? (
                  <PromotionalCard
                    type="upgrade"
                    variant="full"
                  />
                ) : (
                  <div className="max-w-[360px]">
                    <PromotionalCard
                      type="add-launch"
                      onAddLaunch={handleCreateLaunch}
                    />
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] p-10 text-center shadow-[var(--shadow-subtle)]">
            {!hasBusinessProfile ? (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
                  <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--heading)]">Complete Your Business Setup</h3>
                <p className="mb-4 text-sm text-[color:var(--muted)] leading-6">
                  Before creating your first launch, we need some information about your business to personalize your launch plans and AI-generated content.
                </p>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                >
                  Complete Business Setup
                </Link>
              </>
            ) : (
              <>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] border border-[color:var(--border)]">
                  <svg className="h-6 w-6 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-[color:var(--heading)]">Create your first launch</h3>
                <p className="mb-4 text-sm text-[color:var(--muted)] leading-6">
                  Tell us what you're launching and we'll build your plan.
                </p>
                <button
                  onClick={handleCreateLaunch}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] disabled:opacity-50"
                  style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
                  disabled={!canCreateLaunch}
                >
                  New launch
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
