"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AI_BUTTON_ACTIVE_CLASS, AI_BUTTON_DISABLED_CLASS } from "@/lib/aiButtonStyles";
import LoadingOverlay from "@/components/LoadingOverlay";
import { useUsage } from "@/hooks/useUsage";
import { generateAILaunchPlan } from "./generate-ai-plan/action";

type GenerateAIPlanButtonProps = {
  launchId: string;
  hasTasks: boolean;
  initialAIGenerated?: boolean;
};

function GenerateAIPlanButton({ launchId, hasTasks, initialAIGenerated }: GenerateAIPlanButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { usage, canMakeAiCall, aiCallsRemaining } = useUsage();
  const [error, setError] = useState<string | null>(null);
  const [launchInitialAIGenerated, setLaunchInitialAIGenerated] = useState<boolean | null>(initialAIGenerated ?? null);

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
      } catch (err) {
        console.error("Error fetching launch initial AI status:", err);
      }
    };

    fetchLaunchStatus();
  }, [launchId, initialAIGenerated]);

  const isFreePlan = usage?.plan === "free";

  const handleGenerate = async () => {
    if (!canMakeAiCall) {
      window.location.href = '/pricing';
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateAILaunchPlan(launchId);
      if (result.success) {
        setLaunchInitialAIGenerated(true);
        window.location.reload();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to generate plan";
      setError(errorMessage);
      if (errorMessage.includes("limit") || errorMessage.includes("upgrade") || errorMessage.includes("already generated")) {
        window.location.href = '/pricing';
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const renderButton = (isCompact: boolean) => (
    <button
      onClick={handleGenerate}
      disabled={isGenerating || !canMakeAiCall}
      className={cn(
        "inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-all border-0 cursor-pointer",
        isCompact ? "px-4 py-2" : "px-6 py-3",
        !canMakeAiCall
          ? AI_BUTTON_DISABLED_CLASS
          : "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[var(--shadow-subtle)] hover:from-sky-400 hover:to-indigo-400 hover:shadow-[var(--shadow-subtle)]",
        (isGenerating || !canMakeAiCall) && "opacity-60 cursor-not-allowed"
      )}
      style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
      title={
        !canMakeAiCall
          ? isFreePlan
            ? "You've used all your AI credits this month. Upgrade to Pro for more."
            : "You've hit your monthly AI limit. Upgrade for more calls."
          : undefined
      }
    >
      {isGenerating ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          {isCompact ? "Generating..." : "Generating AI Plan..."}
        </>
      ) : !canMakeAiCall ? (
        <>
          <Sparkles className="h-4 w-4" />
          {isFreePlan
            ? `${isCompact ? "Generate" : "Generate AI Plan"} (${aiCallsRemaining} ${
                aiCallsRemaining === 1 ? "credit" : "credits"
              } remaining)`
            : `${isCompact ? "Generate" : "Generate AI Plan"} (${aiCallsRemaining} remaining)`}
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" />
          {isCompact ? "Regenerate AI Plan" : "Generate AI Launch Plan"}
        </>
      )}
    </button>
  );

  if (hasTasks) {
    return (
      <>
        <LoadingOverlay show={isGenerating} description="Give us a few seconds while we craft your campaign beats." />
        {renderButton(true)}
      </>
    );
  }

  return (
    <div className="text-center">
      <LoadingOverlay show={isGenerating} description="Give us a few seconds while we craft your campaign beats." />
      {renderButton(false)}
      {error && (
        <p className="mt-2 text-sm text-red-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default GenerateAIPlanButton;
