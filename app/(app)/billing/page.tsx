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

  // Derive view model
  const isPro = currentPlan === "pro" && subscriptionStatus === "active";
  const isFree = currentPlan === "free";
  const renewsOn =
    isPro && subscriptionRenewsAt ? new Date(subscriptionRenewsAt) : null;

  // Format renewal date if available
  let renewalDateFormatted: string | null = null;
  if (renewsOn) {
    try {
      renewalDateFormatted = renewsOn.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      console.error("Error formatting renewal date:", e);
    }
  }

  // Check for past_due status (show warning banner)
  const isPastDue = subscriptionStatus === "past_due";

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

      {/* Past Due Warning Banner */}
      {isPastDue && (
        <div className="relative z-10 max-w-2xl w-full">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <p className="text-sm text-amber-600 dark:text-amber-400" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
              <strong>Payment issue:</strong> We couldn't take your last payment. Please update your card in billing.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Summary */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-8 shadow-[var(--shadow-subtle)]">
          <h2 className="text-sm font-semibold text-[color:var(--muted)] mb-4 uppercase tracking-wide" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            Current plan
          </h2>
          
          {isFree ? (
            <>
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-[color:var(--heading)] mb-3" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
                  Free
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed mb-6" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  You can generate one launch with AI and edit all tasks manually.
                  <br />
                  Upgrade to Pro to unlock unlimited launches and AI content for every task.
                </p>
              </div>
              <BillingClient
                currentPlan={currentPlan}
                hasStripeCustomer={hasStripeCustomer}
                showUpgradeButton={true}
              />
            </>
          ) : isPro ? (
            <>
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-[color:var(--heading)] mb-3" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
                  Pro
                </h3>
                {renewalDateFormatted && (
                  <p className="text-[color:var(--muted)] mb-2" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    Renews on {renewalDateFormatted}.
                  </p>
                )}
                <p className="text-[color:var(--muted)] leading-relaxed mb-6" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  You have unlimited launches and full AI content access for every task.
                </p>
              </div>
              <BillingClient
                currentPlan={currentPlan}
                hasStripeCustomer={hasStripeCustomer}
                showManageButton={true}
              />
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-3xl font-bold text-[color:var(--heading)] mb-3" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
                  Power
                </h3>
                <p className="text-[color:var(--muted)] leading-relaxed" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                  Coming soon.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      {!isPro && (
        <BillingClient
          currentPlan={currentPlan}
          hasStripeCustomer={hasStripeCustomer}
          showPricingCards={true}
        />
      )}
    </div>
  );
}
