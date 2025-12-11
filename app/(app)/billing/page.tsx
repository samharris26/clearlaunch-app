import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import BillingClient from "./BillingClient";

export default async function BillingPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const supabase = await createClient();

  // Get user's plan and subscription data
  const { data: userData } = await supabase
    .from("users")
    .select("plan, subscription_status, subscription_renews_at, stripe_customer_id")
    .eq("userId", userId)
    .maybeSingle();

  const currentPlan = (userData?.plan as "free" | "pro" | "power") || "free";
  const subscriptionStatus = userData?.subscription_status || null;
  const subscriptionRenewsAt = userData?.subscription_renews_at || null;
  const hasStripeCustomer = !!userData?.stripe_customer_id;

  // Format renewal date if available
  let renewalDateFormatted: string | null = null;
  if (subscriptionRenewsAt) {
    try {
      const date = new Date(subscriptionRenewsAt);
      renewalDateFormatted = date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      console.error("Error formatting renewal date:", e);
    }
  }

  return (
    <div className="flex flex-col items-center gap-16 py-12 px-4 sm:px-6 lg:px-8 min-h-screen bg-[var(--background)]">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center max-w-3xl space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-[color:var(--heading)] tracking-tight" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
          Billing & Subscription
        </h1>
        <p className="text-lg sm:text-xl text-[color:var(--muted)] max-w-2xl mx-auto" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Current Plan Status */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
          <h2 className="text-lg font-semibold text-[color:var(--heading)] mb-4" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
            Current Plan
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                Plan
              </span>
              <span className="text-sm font-semibold text-[color:var(--heading)] capitalize" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                {currentPlan === "free" ? "Free" : currentPlan === "pro" ? "Pro – £10/month" : "Power – £30/month"}
              </span>
            </div>
            {subscriptionStatus && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  Status
                </span>
                <span className={`text-sm font-semibold capitalize ${
                  subscriptionStatus === "active" || subscriptionStatus === "trialing"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : subscriptionStatus === "past_due"
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-[color:var(--muted)]"
                }`} style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  {subscriptionStatus === "active" ? "Active" : 
                   subscriptionStatus === "trialing" ? "Trialing" :
                   subscriptionStatus === "past_due" ? "Past Due" :
                   subscriptionStatus === "canceled" ? "Canceled" :
                   subscriptionStatus}
                </span>
              </div>
            )}
            {renewalDateFormatted && (subscriptionStatus === "active" || subscriptionStatus === "trialing") && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  Renews on
                </span>
                <span className="text-sm font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  {renewalDateFormatted}
                </span>
              </div>
            )}
            {currentPlan === "free" && (
              <div className="pt-2 text-xs text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                You're on the Free plan. Upgrade to unlock more features.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <BillingClient
        currentPlan={currentPlan}
        hasStripeCustomer={hasStripeCustomer}
        showManageButton={currentPlan === "pro" && hasStripeCustomer}
      />
    </div>
  );
}
