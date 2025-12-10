"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { archiveLaunch, unarchiveLaunch } from "@/app/(app)/launch/[id]/archive/action";
import { deleteLaunch } from "@/app/(app)/launch/[id]/delete/action";
import { resetLaunch } from "@/app/(app)/launch/[id]/reset/action";
import { useRouter } from "next/navigation";
import { useUsage } from "@/hooks/useUsage";
import { isFreePlan } from "@/lib/plans";
import { Archive, Trash2, RotateCcw, X } from "lucide-react";

interface LaunchActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  launchId: string;
  launchName: string;
  launchStatus?: string;
}

export default function LaunchActionsModal({
  isOpen,
  onClose,
  launchId,
  launchName,
  launchStatus = "active",
}: LaunchActionsModalProps) {
  const router = useRouter();
  const { usage } = useUsage();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"archive" | "delete" | "reset" | "unarchive" | null>(null);

  const isArchived = launchStatus === "archived";
  const isFree = usage ? isFreePlan(usage.plan) : true; // Default to free if loading

  const handleArchive = async () => {
    setIsProcessing(true);
    setError(null);
    setActionType("archive");

    try {
      const result = await archiveLaunch(launchId);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to archive launch");
      }
    } catch (err) {
      console.error("Error archiving launch:", err);
      setError(err instanceof Error ? err.message : "Failed to archive launch");
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const handleUnarchive = async () => {
    setIsProcessing(true);
    setError(null);
    setActionType("unarchive");

    try {
      const result = await unarchiveLaunch(launchId);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to unarchive launch");
      }
    } catch (err) {
      console.error("Error unarchiving launch:", err);
      setError(err instanceof Error ? err.message : "Failed to unarchive launch");
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    setError(null);
    setActionType("delete");

    try {
      const result = await deleteLaunch(launchId);
      if (result.success) {
        router.push("/launches");
      } else {
        setError(result.error || "Failed to delete launch");
      }
    } catch (err) {
      console.error("Error deleting launch:", err);
      setError(err instanceof Error ? err.message : "Failed to delete launch");
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    setError(null);
    setActionType("reset");

    try {
      const result = await resetLaunch(launchId);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to reset launch");
      }
    } catch (err) {
      console.error("Error resetting launch:", err);
      setError(err instanceof Error ? err.message : "Failed to reset launch");
    } finally {
      setIsProcessing(false);
      setActionType(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-[var(--card)] border-[color:var(--border)] text-[color:var(--text)] shadow-[var(--shadow-soft)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[color:var(--heading)]">
            Manage Launch
          </DialogTitle>
          <DialogDescription className="text-[color:var(--muted)]">
            {launchName}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3 mt-4">
          {isArchived ? (
            <button
              onClick={handleUnarchive}
              disabled={isProcessing}
              className="w-full flex items-center gap-3 border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-4 text-left text-[color:var(--text)] hover:border-[color:var(--border-strong)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ borderRadius: '6px' }}
            >
              <Archive className="h-5 w-5 text-[color:var(--muted)]" />
              <div className="flex-1">
                <div className="font-medium">Unarchive Launch</div>
                <div className="text-sm text-[color:var(--muted)]">
                  Restore this launch to your active launches
                </div>
              </div>
            </button>
          ) : (
            <>
              <button
                onClick={handleArchive}
                disabled={isProcessing}
                className="w-full flex items-center gap-3 border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-4 text-left text-[color:var(--text)] hover:border-[color:var(--border-strong)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ borderRadius: '6px' }}
              >
                <Archive className="h-5 w-5 text-[color:var(--muted)]" />
                <div className="flex-1">
                  <div className="font-medium">Archive Launch</div>
                  <div className="text-sm text-[color:var(--muted)]">
                    {isFree
                      ? "Hide this launch. On the free plan, this doesn't free up your launch slot."
                      : "Hide this launch from your main view. It will still count toward your launch slot limit."}
                  </div>
                </div>
              </button>

              {isFree ? (
                <>
                  <button
                    onClick={handleReset}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-4 text-left text-[color:var(--text)] hover:border-[color:var(--border-strong)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ borderRadius: '6px' }}
                  >
                    <RotateCcw className="h-5 w-5 text-[color:var(--muted)]" />
                    <div className="flex-1">
                      <div className="font-medium">Reset Launch</div>
                      <div className="text-sm text-[color:var(--muted)]">
                        Clear all tasks and content, keeping the same launch slot
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isProcessing}
                    className="w-full flex items-center gap-3 border border-red-500/20 bg-red-500/10 p-4 text-left text-red-600 hover:border-red-500/40 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    style={{ borderRadius: '6px' }}
                  >
                    <Trash2 className="h-5 w-5 text-red-600" />
                    <div className="flex-1">
                      <div className="font-medium text-red-600">Delete Launch</div>
                      <div className="text-sm text-red-600">
                        Archive and clear content. On the free plan, this doesn't free up your launch slot.
                      </div>
                    </div>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 border border-red-500/20 bg-red-500/10 p-4 text-left text-red-600 hover:border-red-500/40 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ borderRadius: '6px' }}
                >
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <div className="font-medium text-red-600">Delete Launch</div>
                    <div className="text-sm text-red-600">
                      Permanently delete this launch and free up a launch slot
                    </div>
                  </div>
                </button>
              )}
            </>
          )}
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-6 py-2 text-sm font-semibold text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] hover:border-[color:var(--border-strong)] transition-colors cursor-pointer"
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

