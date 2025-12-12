"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { completeBusinessOnboarding } from "@/app/(app)/onboarding/complete-business";
import { cn } from "@/lib/utils";
import LoadingOverlay from "@/components/LoadingOverlay";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface BusinessFormState {
  business_name: string;
  business_type: string;
  website_url: string;
  audience: string;
  tone_preset: string;
  timezone: string;
}

export function BusinessOnboardingWizard() {
  const router = useRouter();
  const [form, setForm] = useState<BusinessFormState>({
    business_name: "",
    business_type: "",
    website_url: "",
    audience: "",
    tone_preset: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Auto-detect timezone on mount
  useEffect(() => {
    if (!form.timezone) {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setForm((prev) => ({ ...prev, timezone: detectedTimezone }));
    }
  }, []);

  const gradientBtn =
    "bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-900/20 hover:from-sky-400 hover:to-indigo-400 hover:shadow-sky-900/40";

  const updateForm = <K extends keyof BusinessFormState>(key: K, value: BusinessFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSubmit = form.business_name.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      setError("Business name is required");
      return;
    }

    startTransition(async () => {
      try {
        setError(null);
        await completeBusinessOnboarding({
          business_name: form.business_name.trim(),
          business_type: form.business_type || null,
          website_url: form.website_url.trim() || null,
          audience: form.audience.trim() || null,
          tone_preset: form.tone_preset || null,
          timezone: form.timezone || null,
        });
        router.push("/dashboard");
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 rounded-xl border border-[color:var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-soft)] relative overflow-hidden">
      <LoadingOverlay
        show={isPending}
        title="Saving your business details..."
      />
      <header className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          Business setup
        </p>
        <h1 className="text-3xl font-semibold text-[color:var(--heading)]">
          Tell us about your business
        </h1>
        <p className="text-base text-[color:var(--muted)]">
          We'll use this information to personalize your launch plans and content suggestions.
        </p>
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-md border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-[color:var(--muted)]">
              Business name <span className="text-red-500">*</span>
            </label>
            <input
              className="mt-2 w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              value={form.business_name}
              onChange={(event) => updateForm("business_name", event.target.value)}
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
              type="url"
              className="mt-2 w-full rounded-md border border-[color:var(--border)] bg-[color-mix(in_srgb,var(--surface)_94%,transparent)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--muted)] focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              value={form.website_url}
              onChange={(event) => updateForm("website_url", event.target.value)}
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
              onChange={(event) => updateForm("audience", event.target.value)}
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
              onChange={(event) => updateForm("timezone", event.target.value)}
              placeholder="UTC"
            />
            <p className="mt-1 text-xs text-[color:var(--muted)]">
              Auto-detected: {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
        </div>
      </section>

      <footer className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !canSubmit}
          className={cn("rounded-md px-6 py-3 text-sm font-semibold text-white transition disabled:opacity-40", gradientBtn)}
        >
          {isPending ? "Saving..." : "Continue to dashboard"}
        </button>
      </footer>
    </div>
  );
}
