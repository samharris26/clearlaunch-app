import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const sessionId = params.session_id;

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
            className="text-[color:var(--muted)] mb-6 leading-relaxed"
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}
          >
            Your subscription has been activated. You now have access to all Pro features.
          </p>

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
