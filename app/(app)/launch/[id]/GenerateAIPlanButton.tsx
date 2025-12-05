"use client";

import { useState, useEffect } from "react";
import { generateAILaunchPlan } from "./generate-ai-plan/action";
import UpgradeModal from "@/components/UpgradeModal";
import { useUsage } from "@/hooks/useUsage";
import { Sparkles } from "lucide-react";
import LoadingOverlay from "@/components/LoadingOverlay";
import { cn } from "@/lib/utils";
import { AI_BUTTON_ACTIVE_CLASS, AI_BUTTON_DISABLED_CLASS } from "@/lib/aiButtonStyles";

interface GenerateAIPlanButtonProps {
  launchId: string;
  hasTasks: boolean;
  initialAIGenerated?: boolean;
}

export default function GenerateAIPlanButton({ launchId, hasTasks, initialAIGenerated }: GenerateAIPlanButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const { usage, canMakeAiCall, aiCallsRemaining } = useUsage();
  const [error, setError] = useState<string | null>(null);
  const [launchInitialAIGenerated, setLaunchInitialAIGenerated] = useState<boolean | null>(initialAIGenerated ?? null);

  // Fetch launch initialAIGenerated status if not provided
  useEffect(() => {
    if (initialAIGenerated !== undefined) {
      setLaunchInitialAIGenerated(initialAIGenerated);
      return;
    }

    const fetchLaunchStatus = async () => {
      try {
        const response = await fetch(`/api/launch/${launchId}/initial-ai-check`);
        if (response.ok) {
          const data = await response.json();
          setLaunchInitialAIGenerated(data.initialAIGenerated || false);
        }
      } catch (error) {
        console.error("Error fetching launch initial AI status:", error);
      }
    };

    fetchLaunchStatus();
  }, [launchId, initialAIGenerated]);

  const isFreePlan = usage?.plan === 'free';
  // Free plan: Allow regenerations (subject to AI call limit)
  // Pro/Power: Always allow (subject to AI call limit)
  const canGenerate = true; // Always allow, but check AI limit

  const handleGenerate = async () => {
    // Check AI call limit first
    if (!canMakeAiCall) {
      setUpgradeModalOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAILaunchPlan(launchId);

      if (result.success) {
        // Update local state
        setLaunchInitialAIGenerated(true);
        // Refresh the page to show new tasks
        window.location.reload();
      }
    } catch (err) {
      console.error("Error generating AI plan:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to generate plan";
      setError(errorMessage);

      // If it's a limit error or free plan restriction, show upgrade modal
      if (errorMessage.includes("limit") || errorMessage.includes("upgrade") || errorMessage.includes("already generated")) {
        setUpgradeModalOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (hasTasks) {
    return (
      <>
        <LoadingOverlay
          show={isGenerating}
          description="Give us a few seconds while we craft your campaign beats."
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !canMakeAiCall}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all border-0",
            !canMakeAiCall
              ? AI_BUTTON_DISABLED_CLASS
              : "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40",
            (isGenerating || !canMakeAiCall) && "opacity-60"
          )}
          style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
          title={!canMakeAiCall ? (isFreePlan ? "You've used all your plan regenerations this month. Upgrade to Pro for more." : "You've hit your monthly AI limit. Upgrade for more calls.") : undefined}
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : !canMakeAiCall ? (
            <>
              <Sparkles className="h-4 w-4" />
              {isFreePlan
                ? `Regenerate Plan (${aiCallsRemaining} ${aiCallsRemaining === 1 ? 'regeneration' : 'regenerations'} remaining)`
                : `Generate AI Plan (${aiCallsRemaining} remaining)`
              }
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Regenerate AI Plan
            </>
          )}
        </button>
        <UpgradeModal
          isOpen={upgradeModalOpen}
          onClose={() => setUpgradeModalOpen(false)}
          type="ai"
          currentPlan={usage?.plan || 'free'}
        />
      </>
    );
  }

  return (
    <div className="text-center">
      <LoadingOverlay
        show={isGenerating}
        description="Give us a few seconds while we craft your campaign beats."
      />
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !canMakeAiCall}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all border-0",
          !canMakeAiCall
            ? AI_BUTTON_DISABLED_CLASS
            : "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40",
          (isGenerating || !canMakeAiCall) && "opacity-60"
        )}
        style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
        title={!canMakeAiCall ? (isFreePlan ? "You've used all your plan regenerations this month. Upgrade to Pro for more." : "You've hit your monthly AI limit. Upgrade for more calls.") : undefined}
      >
        {isGenerating ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating AI Plan...
          </>
        ) : !canMakeAiCall ? (
          <>
            <Sparkles className="h-4 w-4" />
            {isFreePlan
              ? `Generate Plan (${aiCallsRemaining} ${aiCallsRemaining === 1 ? 'regeneration' : 'regenerations'} remaining)`
              : `Generate AI Plan (${aiCallsRemaining} remaining)`
            }
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate AI Launch Plan
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{error}</p>
      )}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        type="ai"
        currentPlan={usage?.plan || 'free'}
      />
    </div>
  );
}
