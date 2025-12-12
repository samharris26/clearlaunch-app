"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateBusinessProfile } from "./action";
import { type BusinessProfile } from "@/lib/business-profile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const BUSINESS_TYPES = [
  { id: "saas", label: "SaaS" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "creator", label: "Creator" },
  { id: "local", label: "Local Business" },
  { id: "other", label: "Other" },
];

const TONE_PRESETS = [
  { id: "confident", label: "Confident" },
  { id: "casual", label: "Casual" },
  { id: "professional", label: "Professional" },
  { id: "playful", label: "Playful" },
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
];

interface BusinessSettingsClientProps {
  initialData: BusinessProfile | null;
}

export default function BusinessSettingsClient({ initialData }: BusinessSettingsClientProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    business_name: initialData?.business_name || "",
    business_type: initialData?.business_type || "",
    website_url: initialData?.website_url || "",
    audience: initialData?.audience || "",
    tone_preset: initialData?.tone_preset || "",
    timezone: initialData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateForm = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.business_name.trim()) {
      setError("Business name is required");
      return;
    }

    startTransition(async () => {
      try {
        const result = await updateBusinessProfile({
          business_name: form.business_name.trim(),
          business_type: form.business_type || null,
          website_url: form.website_url.trim() || null,
          audience: form.audience.trim() || null,
          tone_preset: form.tone_preset || null,
          timezone: form.timezone || null,
        });

        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            router.refresh();
          }, 1000);
        } else {
          setError(result.error || "Failed to save business profile");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to save business profile");
      }
    });
  };

  return (
    <div className="flex w-full max-w-6xl flex-col items-center gap-14 px-2 sm:px-4 pt-14 pb-24">
      {/* Header */}
      <div className="flex w-full max-w-2xl flex-col gap-4">
        <Link
          href="/settings"
          className="flex items-center gap-2 text-sm text-[color:var(--muted)] hover:text-[color:var(--text)] transition-colors mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <h1 className="text-3xl font-semibold text-[color:var(--heading)]">
          Business Settings
        </h1>
        <p className="text-[color:var(--muted)]">
          Update your business information to personalize your launch plans and content suggestions.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Business profile saved successfully!
          </div>
        )}

        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[color:var(--muted)]">
                Business name <span className="text-red-500">*</span>
              </label>
              <input
                className="mt-2 w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                value={form.business_name}
                onChange={(e) => updateForm("business_name", e.target.value)}
                placeholder="e.g. Acme Inc."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">
                Business type
              </label>
              <Select
                value={form.business_type}
                onValueChange={(value) => updateForm("business_type", value)}
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">
                Website URL
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                value={form.website_url}
                onChange={(e) => updateForm("website_url", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-[color:var(--muted)]">
                Target audience
              </label>
              <textarea
                className="mt-2 h-24 w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 resize-none"
                value={form.audience}
                onChange={(e) => updateForm("audience", e.target.value)}
                placeholder="Describe your target audience..."
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">
                Tone of voice
              </label>
              <Select
                value={form.tone_preset}
                onValueChange={(value) => updateForm("tone_preset", value)}
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {TONE_PRESETS.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      {tone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-[color:var(--muted)]">
                Timezone
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                value={form.timezone}
                onChange={(e) => updateForm("timezone", e.target.value)}
                placeholder="UTC"
              />
              <p className="mt-1 text-xs text-[color:var(--muted)]">
                Auto-detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="rounded-full border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-6 py-2.5 text-sm font-semibold text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_85%,transparent)] hover:border-[color:var(--border-strong)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-subtle)] transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
