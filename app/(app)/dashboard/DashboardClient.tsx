"use client";

import { useState } from "react";
import LaunchCardNew from "@/components/dashboard/LaunchCardNew";
import PromotionalCard from "@/components/dashboard/PromotionalCard";
import UpgradeModal from "@/components/UpgradeModal";
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
}

export default function DashboardClient({ launches }: DashboardClientProps) {
  const { usage, canCreateLaunch, loading } = useUsage();
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
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--card)] border border-[color:var(--border)]">
              <svg className="h-6 w-6 text-[color:var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-[color:var(--heading)]">No launches yet</h3>
            <p className="mb-4 text-sm text-[color:var(--muted)] leading-6">
              Create your first launch to start planning and tracking your product launch.
            </p>
            <button
              onClick={handleCreateLaunch}
              className="inline-flex items-center rounded-md bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50 shadow-[var(--shadow-subtle)]"
              disabled={!canCreateLaunch}
            >
              Create Launch
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
