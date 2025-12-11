"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

interface BillingSuccessClientProps {
  sessionId?: string;
}

export default function BillingSuccessClient({ sessionId }: BillingSuccessClientProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Auto-sync subscription when page loads
  useEffect(() => {
    const syncSubscription = async () => {
      setIsSyncing(true);
      setSyncError(null);
      try {
        const response = await fetch("/api/billing/sync-subscription", {
          method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.details || data.error || "Failed to sync subscription");
        }

        // If sync successful, refresh the page after a short delay
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } catch (error) {
        console.error("Sync error:", error);
        setSyncError(error instanceof Error ? error.message : "Failed to sync");
      } finally {
        setIsSyncing(false);
      }
    };

    // Sync after a short delay to allow webhook to process first
    const timer = setTimeout(syncSubscription, 2000);
    return () => clearTimeout(timer);
  }, [router]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const response = await fetch("/api/billing/sync-subscription", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to sync subscription");
      }

      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error("Sync error:", error);
      setSyncError(error instanceof Error ? error.message : "Failed to sync");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Success Card */}
      <div className="relative z-10 max-w-md w-full">
        <div className="rounded-2xl border border-emerald-500/20 bg-[var(--card)] p-8 shadow-[var(--shadow-soft)] text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
            <Check className="h-8 w-8 text-emerald-500" />
          </div>

          <h1
            className="text-2xl font-bold text-[color:var(--heading)] mb-3"
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            }}
          >
            Payment Successful!
          </h1>

          <p
            className="text-[color:var(--muted)] mb-4 leading-relaxed"
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            Your subscription has been activated. We're syncing your account...
          </p>

          {isSyncing && (
            <div className="mb-4 flex items-center justify-center gap-2 text-sm text-[color:var(--muted)]">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Syncing subscription...</span>
            </div>
          )}

          {syncError && (
            <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                {syncError}
              </p>
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="text-xs text-amber-600 dark:text-amber-400 underline hover:no-underline"
              >
                Try syncing again
              </button>
            </div>
          )}

          {sessionId && (
            <p
              className="text-xs text-[color:var(--muted)] mb-6 font-mono"
              style={{
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              Session ID: {sessionId.substring(0, 20)}...
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/billing"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold hover:from-indigo-400 hover:to-cyan-400 transition-all shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)]"
              style={{
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              View Billing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-[color:var(--text)] font-medium hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] transition-colors"
              style={{
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
