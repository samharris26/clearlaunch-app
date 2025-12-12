"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLaunch } from "../create/action";
import { useUsage } from "@/hooks/useUsage";
import { SUPPORTED_PLATFORMS } from "@/lib/platforms";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { checkBusinessProfile } from "./check-business";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const toneOfVoiceOptions = [
  { value: "casual", label: "Casual" },
  { value: "confident", label: "Confident" },
  { value: "playful", label: "Playful" },
  { value: "professional", label: "Professional" },
  { value: "minimal", label: "Minimal" },
  { value: "bold", label: "Bold" },
];

const goalTypeOptions = [
  { value: "sales", label: "Sales" },
  { value: "revenue", label: "Revenue" },
  { value: "signups", label: "Sign-ups" },
  { value: "waitlist", label: "Waitlist" },
  { value: "awareness", label: "Awareness" },
  { value: "traffic", label: "Traffic" },
  { value: "validate", label: "Validate" },
  { value: "other", label: "Other" },
];

const launchTypeOptions = [
  { value: "Product", label: "Product" },
  { value: "Service", label: "Service" },
  { value: "Course", label: "Course" },
  { value: "App", label: "App" },
  { value: "SaaS", label: "SaaS" },
  { value: "Other", label: "Other" },
];

export default function CreateLaunchPage() {
  const router = useRouter();
  const { usage, canCreateLaunch, loading: usageLoading } = useUsage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState<boolean | null>(null);
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  const [formData, setFormData] = useState({
    launchName: "",
    description: "",
    targetDate: "",
    launchType: "Product",
    toneOfVoice: "professional",
    platforms: [] as string[],
    goalType: "",
    goalValue: "",
    goalUnit: "",
  });

  // Check for business profile on mount
  useEffect(() => {
    async function checkProfile() {
      const result = await checkBusinessProfile();
      setHasBusinessProfile(result.exists);
      setCheckingBusiness(false);
    }
    checkProfile();
  }, []);

  const handlePlatformToggle = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((id) => id !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!canCreateLaunch) {
      router.push("/pricing");
      return;
    }

    if (!formData.launchName.trim()) {
      setError("Launch name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("launchName", formData.launchName);
      formDataToSubmit.append("description", formData.description);
      formDataToSubmit.append("targetDate", formData.targetDate);
      formDataToSubmit.append("launchType", formData.launchType);
      formDataToSubmit.append("toneOfVoice", formData.toneOfVoice);
      formDataToSubmit.append("platforms", JSON.stringify(formData.platforms));
      formDataToSubmit.append("goalType", formData.goalType);
      formDataToSubmit.append("goalValue", formData.goalValue);
      formDataToSubmit.append("goalUnit", formData.goalUnit);

      await createLaunch(formDataToSubmit);
      // Redirect happens in the action
    } catch (err) {
      console.error("Error creating launch:", err);
      setError(err instanceof Error ? err.message : "Failed to create launch");
      setIsSubmitting(false);
    }
  };

  if (usageLoading || checkingBusiness) {
    return (
      <div className="flex w-full max-w-6xl flex-col items-center gap-14 px-2 sm:px-4 pt-14 pb-24">
        <div className="w-full max-w-2xl animate-pulse">
          <div className="h-8 bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] rounded w-48 mb-4"></div>
          <div className="h-64 bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Show blocking message if no business profile
  if (hasBusinessProfile === false) {
    return (
      <div className="flex w-full max-w-6xl flex-col items-center gap-14 px-2 sm:px-4 pt-14 pb-24">
        <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)]">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-[color:var(--heading)] mb-2">Complete Your Business Setup</h1>
            <p className="text-[color:var(--muted)]">
              Before creating your first launch, we need some information about your business to personalize your launch plans and AI-generated content.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] transition-all"
            >
              Complete Business Setup
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-6 py-2.5 text-sm font-semibold text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] hover:border-[color:var(--border-strong)] transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!canCreateLaunch) {
    return (
      <div className="flex w-full max-w-6xl flex-col items-center gap-14 px-2 sm:px-4 pt-14 pb-24">
        <div className="w-full max-w-2xl rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)]">
          <h1 className="text-2xl font-semibold text-[color:var(--heading)] mb-4">Launch Limit Reached</h1>
          <p className="text-[color:var(--muted)] mb-6">
            You've reached your plan limit of {usage?.maxLaunches} launch{usage?.maxLaunches === 1 ? "" : "es"}. Upgrade to create more launches.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] transition-all"
          >
            Upgrade Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-14 px-2 sm:px-4 pt-14 pb-24">
      {/* Breadcrumbs */}
      <nav className="flex w-full max-w-6xl items-center gap-1 text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
        <Link href="/dashboard" className="hover:text-[color:var(--text)] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 text-[color:var(--border-strong)]" />
        <Link href="/launches" className="hover:text-[color:var(--text)] transition-colors">
          Launches
        </Link>
        <ChevronRight className="h-4 w-4 text-[color:var(--border-strong)]" />
        <span className="text-[color:var(--text)] font-medium">Create New Launch</span>
      </nav>

      {/* Header */}
      <div className="flex w-full max-w-2xl flex-col gap-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-7 shadow-[var(--shadow-subtle)]">
        <div className="flex items-center gap-3">
          <Link
            href="/launches"
            className="flex items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] p-2 text-[color:var(--muted)] transition-colors hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)] shadow-[var(--shadow-subtle)]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1
              className="text-2xl font-semibold text-[color:var(--heading)] sm:text-3xl"
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}
            >
              Create New Launch
            </h1>
            <p
              className="text-base text-[color:var(--muted)] mt-1"
              style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}
            >
              Set up your launch details to get started
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Launch Name */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <label htmlFor="launchName" className="block text-sm font-medium text-[color:var(--heading)] mb-2">
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

        {/* Description */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <label htmlFor="description" className="block text-sm font-medium text-[color:var(--heading)] mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none"
            placeholder="Describe your launch..."
          />
        </div>

        {/* Target Date & Launch Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
            <label htmlFor="targetDate" className="block text-sm font-medium text-[color:var(--heading)] mb-2">
              Target Launch Date
            </label>
            <input
              id="targetDate"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
            />
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
            <label htmlFor="launchType" className="block text-sm font-medium text-[color:var(--heading)] mb-2">
              Launch Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.launchType}
              onValueChange={(value) => setFormData({ ...formData, launchType: value })}
              required
            >
              <SelectTrigger id="launchType" className="w-full">
                <SelectValue placeholder="Select launch type" />
              </SelectTrigger>
              <SelectContent>
                {launchTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tone of Voice */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <label htmlFor="toneOfVoice" className="block text-sm font-medium text-[color:var(--heading)] mb-2">
            Tone of Voice
          </label>
          <Select
            value={formData.toneOfVoice}
            onValueChange={(value) => setFormData({ ...formData, toneOfVoice: value })}
          >
            <SelectTrigger id="toneOfVoice" className="w-full">
              <SelectValue placeholder="Select tone of voice" />
            </SelectTrigger>
            <SelectContent>
              {toneOfVoiceOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Platforms */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <label className="block text-sm font-medium text-[color:var(--heading)] mb-4">
            Platforms (optional)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUPPORTED_PLATFORMS.map((platform) => (
              <label
                key={platform.id}
                className="flex items-center gap-2 p-3 rounded-lg border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] cursor-pointer hover:border-[color:var(--border-strong)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.platforms.includes(platform.id)}
                  onChange={() => handlePlatformToggle(platform.id)}
                  className="rounded border-[color:var(--border)] text-sky-500 focus:ring-sky-500/50"
                />
                <span className="text-sm text-[color:var(--text)]">{platform.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Goal Fields */}
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <label className="block text-sm font-medium text-[color:var(--heading)] mb-4">
            Launch Goal (optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="goalType" className="block text-xs font-medium text-[color:var(--muted)] mb-2">
                Goal Type
              </label>
              <Select
                value={formData.goalType}
                onValueChange={(value) => setFormData({ ...formData, goalType: value })}
              >
                <SelectTrigger id="goalType" className="w-full">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  {goalTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="goalValue" className="block text-xs font-medium text-[color:var(--muted)] mb-2">
                Goal Value
              </label>
              <input
                id="goalValue"
                type="number"
                min={0}
                value={formData.goalValue}
                onChange={(e) => setFormData({ ...formData, goalValue: e.target.value })}
                className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                placeholder="e.g. 150"
              />
            </div>
            <div>
              <label htmlFor="goalUnit" className="block text-xs font-medium text-[color:var(--muted)] mb-2">
                Unit
              </label>
              <input
                id="goalUnit"
                type="text"
                value={formData.goalUnit}
                onChange={(e) => setFormData({ ...formData, goalUnit: e.target.value })}
                className="w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                placeholder="e.g. £, orders, signups"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/launches"
            className="rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-6 py-2.5 text-sm font-semibold text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] hover:border-[color:var(--border-strong)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Launch"}
          </button>
        </div>
      </form>
    </div>
  );
}

