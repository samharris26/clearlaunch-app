"use client";

import { BusinessOnboardingWizard } from "@/components/onboarding/BusinessOnboardingWizard";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] px-4 py-12 text-slate-900">
      <BusinessOnboardingWizard />
    </div>
  );
}
