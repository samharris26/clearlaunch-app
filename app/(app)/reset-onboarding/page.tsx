import { resetOnboarding } from "./action";

export default function ResetOnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <form action={resetOnboarding}>
        <button 
          type="submit"
          className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Reset Onboarding (Testing Only)
        </button>
      </form>
    </div>
  );
}

