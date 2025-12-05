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
      <DialogContent className="max-w-2xl border border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-50">Launch Settings</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update your launch details and settings
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="launchName" className="block text-sm font-medium text-slate-300">
              Launch Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="launchName"
              type="text"
              value={formData.launchName}
              onChange={(e) => setFormData({ ...formData, launchName: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
              placeholder="My Product Launch"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className="block text-sm font-medium text-slate-300">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all resize-none"
              placeholder="Describe your launch..."
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="target_date" className="block text-sm font-medium text-slate-300">
                Target Launch Date
              </label>
              <input
                id="target_date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all [color-scheme:dark]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="launchType" className="block text-sm font-medium text-slate-300">
                Launch Type
              </label>
              <select
                id="launchType"
                value={formData.launchType}
                onChange={(e) => setFormData({ ...formData, launchType: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200 focus:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all appearance-none"
              >
                <option value="" className="bg-slate-950 text-slate-400">Select a type</option>
                <option value="product" className="bg-slate-950">Product</option>
                <option value="service" className="bg-slate-950">Service</option>
                <option value="course" className="bg-slate-950">Course</option>
                <option value="app" className="bg-slate-950">App</option>
                <option value="saas" className="bg-slate-950">SaaS</option>
                <option value="other" className="bg-slate-950">Other</option>
              </select>
            </div>
          </div>

          <DialogFooter className="mt-6 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40 transition-all"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

