"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_PLATFORMS, type Platform } from "@/lib/platforms";
import { LAUNCH_TEMPLATES } from "@/lib/launchTemplates";
import {
  completeOnboardingWizard,
  type OnboardingWizardPayload,
  type WizardPlatformSelection,
} from "@/app/(app)/onboarding/complete-wizard";
import { cn } from "@/lib/utils";
import LoadingOverlay from "@/components/LoadingOverlay";

const GOAL_TYPES = [
  { id: "sales", label: "Sales" },
  { id: "revenue", label: "Revenue" },
  { id: "signups", label: "Sign-ups" },
  { id: "waitlist", label: "Waitlist" },
];

type Step = 0 | 1 | 2;

interface WizardFormState {
  launchName: string;
  summary: string;
  goalType: string;
  goalValue: string;
  launchDate: string;
  templateId: string;
}

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [form, setForm] = useState<WizardFormState>({
    launchName: "",
    summary: "",
    goalType: GOAL_TYPES[0].id,
    goalValue: "",
    launchDate: "",
    templateId: "",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState<Partial<Record<Platform, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showGenerating, setShowGenerating] = useState(false);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      const next = { ...prev };
      if (next[platform]) {
        delete next[platform];
      } else {
        next[platform] = true;
      }
      return next;
    });
  };

  const hasPlatformSelected = (platform: Platform) => !!selectedPlatforms[platform];

  const platformSelections: WizardPlatformSelection[] = useMemo(() => {
    return Object.entries(selectedPlatforms)
      .filter(([, active]) => active)
      .map(([platform]) => ({
        platform: platform as Platform,
      }));
  }, [selectedPlatforms]);

  const goalPlaceholder = useMemo(() => {
    switch (form.goalType) {
      case "sales":
        return "e.g. 150 orders";
      case "revenue":
        return "e.g. £25,000";
      case "signups":
        return "e.g. 500 sign-ups";
      case "waitlist":
        return "e.g. 200 early access requests";
      default:
        return "Enter a numeric goal";
    }
  }, [form.goalType]);

  const gradientBtn =
    "bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 text-slate-950 hover:from-sky-300 hover:via-indigo-400 hover:to-emerald-300 shadow-lg shadow-sky-900/30";

  const updateForm = <K extends keyof WizardFormState>(key: K, value: WizardFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canProceedFromStep = (currentStep: Step) => {
    if (currentStep === 0) {
      return (
        form.launchName.trim().length > 0 &&
        form.summary.trim().length > 0 &&
        form.goalType.trim().length > 0 &&
        form.launchDate.trim().length > 0
      );
    }

    if (currentStep === 1) {
      return platformSelections.length > 0;
    }

    if (currentStep === 2) {
      return form.templateId.trim().length > 0;
    }

    return true;
  };

  const goNext = () => {
    if (!canProceedFromStep(step)) {
      setError("Please complete the required fields before continuing.");
      return;
    }
    setError(null);
    setStep((prev) => Math.min(2, (prev + 1) as Step));
  };

  const goBack = () => {
    setError(null);
    setStep((prev) => Math.max(0, (prev - 1) as Step));
  };

  const handleSubmit = () => {
    if (!canProceedFromStep(2)) {
      setError("Please select a template to finish.");
      return;
    }

    const payload: OnboardingWizardPayload = {
      launchName: form.launchName.trim(),
      summary: form.summary.trim(),
      goalType: form.goalType,
      goalValue: form.goalValue ? Number(form.goalValue) : null,
      launchDate: form.launchDate,
      templateId: form.templateId,
      platforms: platformSelections,
    };

    startTransition(async () => {
      try {
        setShowGenerating(true);
        const result = await completeOnboardingWizard(payload);
        setError(null);
        if (result?.launchId) {
          router.push(`/launch/${result.launchId}`);
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to complete onboarding");
      } finally {
        setShowGenerating(false);
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur relative overflow-hidden">
      <LoadingOverlay
        show={isPending || showGenerating}
        description="Give us a few seconds while we build your plan."
      />
      <header className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
          Launch setup · Step {step + 1} of 3
        </p>
        <h1 className="text-3xl font-semibold text-white">
          {step === 0 && "Tell us about your launch"}
          {step === 1 && "Choose your platforms"}
          {step === 2 && "Get your launch timeline"}
        </h1>
        <p className="text-base text-slate-400">
          {step === 0 &&
            "We'll use these details to size your runway, plan goals, and map the right timeline."}
          {step === 1 &&
            "Select the channels where you'll show up. ClearLaunch balances your workload across them."}
          {step === 2 &&
            "Each template comes with beats, timing, and channel guidance. Pick the one closest to your launch."}
        </p>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
        {step === 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-200">
                Launch name
              </label>
              <input
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/15"
                value={form.launchName}
                onChange={(event) => updateForm("launchName", event.target.value)}
                placeholder="e.g. Batch 001 Coffee Drop"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-200">
                Launch summary
              </label>
              <textarea
                className="mt-2 h-28 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/15"
                value={form.summary}
                onChange={(event) => updateForm("summary", event.target.value)}
                placeholder="Describe the drop, promise, or campaign angle in a few sentences."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">
                Goal type
              </label>
              <select
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/15"
                value={form.goalType}
                onChange={(event) => updateForm("goalType", event.target.value)}
              >
                {GOAL_TYPES.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">
                Goal value
              </label>
              <input
                type="number"
                min={0}
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/15"
                value={form.goalValue}
                onChange={(event) => updateForm("goalValue", event.target.value)}
                placeholder={goalPlaceholder}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-200">
                Launch date
              </label>
              <input
                type="date"
                className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-slate-100 focus:border-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/15"
                value={form.launchDate}
                onChange={(event) => updateForm("launchDate", event.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid gap-4 md:grid-cols-2">
            {SUPPORTED_PLATFORMS.map((platform) => {
              const active = hasPlatformSelected(platform.id);
              return (
                <button
                  type="button"
                  key={platform.id}
                  className={cn(
                    "rounded-2xl border px-4 py-4 text-left transition focus:outline-none",
                    active
                      ? "border-sky-500/70 bg-sky-500/10 shadow-lg shadow-sky-500/20"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/60"
                  )}
                  onClick={() => togglePlatform(platform.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-base font-semibold text-slate-100">{platform.label}</p>
                      <p className="text-sm text-slate-400">
                        {platform.description || "We’ll suggest best windows and content types."}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex h-6 items-center rounded-full px-3 text-[0.65rem] font-semibold uppercase tracking-wide",
                        active ? "bg-sky-500/20 text-sky-200 border border-sky-500/40" : "bg-slate-900/70 text-slate-400 border border-slate-700"
                      )}
                    >
                      {active ? "Selected" : "Tap to add"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2 text-slate-300" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <p className="text-base text-slate-200">Pick the template closest to your launch format.</p>
              <p className="text-sm text-slate-400">
                Each template includes the essential beats, recommended platforms, and timing guidance. You can always tweak tasks later.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
            {LAUNCH_TEMPLATES.map((template) => {
              const active = form.templateId === template.id;
              return (
                <button
                  type="button"
                  key={template.id}
                  onClick={() => updateForm("templateId", template.id)}
                  className={cn(
                    "h-full rounded-2xl border p-4 text-left transition hover:border-sky-500/60 hover:bg-slate-900/50",
                    active
                      ? "border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/30"
                      : "border-slate-800 bg-slate-950/40"
                  )}
                >
                  <p className="text-sm uppercase tracking-wide text-slate-400">{template.name}</p>
                  <p className="mt-2 text-lg font-semibold text-white leading-[calc(var(--spacing)*8)]">{template.description}</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-400">
                    <p>{template.beats.length} beats · {template.beats[0]?.label} → {template.beats[template.beats.length - 1]?.label}</p>
                    <p className="text-xs text-slate-500">
                      Best for: {template.beats.slice(0, 2).map((beat) => beat.label).join(", ")}…
                    </p>
                  </div>
                </button>
              );
            })}
            </div>
          </div>
        )}
      </section>

      <footer className="flex items-center justify-between">
        <button
          type="button"
          onClick={goBack}
          disabled={step === 0 || isPending}
          className="rounded-xl border border-slate-800 px-5 py-3 text-sm font-medium text-slate-300 transition disabled:opacity-40"
        >
          Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={isPending}
            className={cn("rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-40", gradientBtn)}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className={cn("inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-40", gradientBtn)}
          >
            {isPending ? "Creating launch…" : "Finish & create launch"}
          </button>
        )}
      </footer>
    </div>
  );
}


