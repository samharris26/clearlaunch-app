"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateLaunch } from "@/app/(app)/launch/[id]/update-launch/action";
import { useRouter } from "next/navigation";

interface LaunchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  launch: {
    id: string;
    launchName?: string | null;
    description?: string | null;
    target_date?: string | null;
    launchType?: string | null;
  };
}

export default function LaunchSettingsModal({ isOpen, onClose, launch }: LaunchSettingsModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    launchName: launch.launchName || "",
    description: launch.description || "",
    target_date: launch.target_date ? launch.target_date.split('T')[0] : "",
    launchType: launch.launchType || "",
  });

  // Update form when launch changes
  useEffect(() => {
    setFormData({
      launchName: launch.launchName || "",
      description: launch.description || "",
      target_date: launch.target_date ? launch.target_date.split('T')[0] : "",
      launchType: launch.launchType || "",
    });
  }, [launch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const result = await updateLaunch(launch.id, {
        launchName: formData.launchName,
        description: formData.description,
        target_date: formData.target_date || null,
        launchType: formData.launchType || null,
      });

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to update launch");
      }
    } catch (err) {
      console.error("Error updating launch:", err);
      setError(err instanceof Error ? err.message : "Failed to update launch");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[var(--card)] border-[color:var(--border)] text-[color:var(--text)] shadow-[var(--shadow-soft)]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[color:var(--heading)]">Launch Settings</DialogTitle>
          <DialogDescription className="text-[color:var(--muted)]">
            Update your launch details and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="launchName" className="text-sm font-medium text-[color:var(--muted)]">
              Launch Name <span className="text-red-500">*</span>
            </label>
            <input
              id="launchName"
              type="text"
              value={formData.launchName}
              onChange={(e) => setFormData({ ...formData, launchName: e.target.value })}
              required
              className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              placeholder="My Product Launch"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-[color:var(--muted)]">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none"
              placeholder="Describe your launch..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="target_date" className="text-sm font-medium text-[color:var(--muted)]">
                Target Launch Date
              </label>
              <input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="launchType" className="text-sm font-medium text-[color:var(--muted)]">
                Launch Type
              </label>
              <select
                id="launchType"
                value={formData.launchType}
                onChange={(e) => setFormData({ ...formData, launchType: e.target.value })}
                className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 cursor-pointer"
              >
                <option value="">Select a type</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="course">Course</option>
                <option value="app">App</option>
                <option value="saas">SaaS</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="text-[color:var(--muted)] hover:!bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] hover:!text-[color:var(--text)] cursor-pointer transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] transition-all cursor-pointer"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

