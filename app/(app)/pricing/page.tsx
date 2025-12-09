import { getUser, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Check, Zap, Crown, Sparkles, HelpCircle, Clock } from "lucide-react";
import CheckoutButton from "@/components/CheckoutButton";

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '1 active launch',
      '3 plan regenerations per month',
      'Manual task changes only'
    ],
    current: false,
    recommended: false,
    href: '/pricing?plan=free',
    buttonText: 'Current Plan'
  },
  {
    name: 'Pro',
    price: '£10',
    period: '/month',
    description: 'For growing businesses',
    features: [
      '3 active launches',
      '100 AI calls/month',
      'Full AI access',
      'Task rewrites',
      'Post generation',
      'Idea generation',
      'Content assist',
      'Rewrite/refine steps',
      'Basic analytics'
    ],
    current: false,
    recommended: true,
    href: '/pricing?plan=pro',
    buttonText: 'Upgrade to Pro'
  },
  {
    name: 'Power',
    price: '£30',
    period: '/month',
    description: 'For power users and agencies',
    features: [
      '10 active launches',
      '300 AI calls/month',
      'All templates',
      'Priority AI access',
      'Advanced analytics',
      'Dedicated support'
    ],
    current: false,
    recommended: false,
    href: '/pricing?plan=power',
    buttonText: 'Upgrade to Power'
  }
];

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string; session_id?: string }>;
}) {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  const supabase = await createClient();
  // Get user's current plan
  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("userId", userId)
    .maybeSingle();

  const currentPlan = (userData?.plan as "free" | "pro" | "power") || "free";
  const params = await searchParams;
  const showSuccess = params.success === "true";
  const showCanceled = params.canceled === "true";

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
          Choose your plan
        </h1>
        <p className="text-lg sm:text-xl text-[color:var(--muted)] max-w-2xl mx-auto" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
          Start free and upgrade as you grow. All plans include our core features.
        </p>
      </div>

      {/* Success/Cancel Messages */}
      {showSuccess && (
        <div className="relative z-10 max-w-2xl w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="p-1 bg-emerald-500/20 rounded-full">
            <Check className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-emerald-600 dark:text-emerald-400 text-sm leading-6" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            <strong>Payment successful!</strong> Your plan has been upgraded. You can now access all the features of your new plan.
          </p>
        </div>
      )}
      {showCanceled && (
        <div className="relative z-10 max-w-2xl w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="p-1 bg-amber-500/20 rounded-full">
            <HelpCircle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-amber-600 dark:text-amber-400 text-sm leading-6" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
            Payment was canceled. No charges were made. You can try again anytime.
          </p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name.toLowerCase();
          const isPro = plan.name === 'Pro';
          const isPower = plan.name === 'Power';

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border border-[color:var(--border)] p-8 transition-all duration-300 ${isPro
                  ? 'bg-[var(--card)] border-indigo-500/30 shadow-[var(--shadow-soft)] ring-1 ring-indigo-500/30'
                  : 'bg-[var(--card)] border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-subtle)]'
                }`}
            >
              {isPro && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full text-xs font-bold text-white shadow-lg shadow-indigo-500/20 tracking-wide uppercase">
                  Most Popular
                </div>
              )}
              {isPower && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] rounded-full text-xs font-medium text-[color:var(--muted)] shadow-[var(--shadow-subtle)] flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Coming Soon
                </div>
              )}

              {/* Plan Icon & Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPro ? 'bg-indigo-500/20 text-indigo-500' :
                      isPower ? 'bg-sky-500/20 text-sky-500' :
                        'bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] text-[color:var(--muted)]'
                    }`}>
                    {plan.name === 'Free' && <Crown className="h-6 w-6" />}
                    {plan.name === 'Pro' && <Zap className="h-6 w-6" />}
                    {plan.name === 'Power' && <Sparkles className="h-6 w-6" />}
                  </div>
                  {isCurrentPlan && (
                    <span className="px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-xs font-medium text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                      Current
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold text-[color:var(--heading)] mb-2" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>{plan.name}</h3>
                <p className="text-[color:var(--muted)] text-sm h-10" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>{plan.price}</span>
                <span className="text-[color:var(--muted)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-sm text-[color:var(--text)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    <Check className={`h-5 w-5 flex-shrink-0 ${isPro ? 'text-indigo-500' :
                        isPower ? 'text-sky-500' :
                          'text-[color:var(--muted)]'
                      }`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="mt-auto">
                {isCurrentPlan ? (
                  <button disabled className="w-full py-3 px-6 rounded-xl bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-[color:var(--muted)] font-medium cursor-not-allowed" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    Current Plan
                  </button>
                ) : plan.name === "Free" ? (
                  <button disabled className="w-full py-3 px-6 rounded-xl bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-[color:var(--muted)] font-medium cursor-not-allowed" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    Downgrade to Free
                  </button>
                ) : isPower ? (
                  <button disabled className="w-full py-3 px-6 rounded-xl bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] border border-[color:var(--border)] text-[color:var(--muted)] font-medium cursor-not-allowed opacity-60" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                    Coming Soon
                  </button>
                ) : (
                  <CheckoutButton
                    plan={plan.name.toLowerCase() as "pro" | "power"}
                    currentPlan={currentPlan}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${isPro
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-400 hover:to-cyan-400 shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)]"
                        : "bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] border border-[color:var(--border)]"
                      }`}
                  >
                    {plan.buttonText}
                  </CheckoutButton>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="relative z-10 max-w-4xl w-full pt-12 pb-20">
        <h2 className="text-2xl font-bold text-[color:var(--heading)] text-center mb-10" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {[
            { q: "Can I change plans anytime?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
            { q: "What happens to my data if I downgrade?", a: "Your data is always safe. If you exceed limits after downgrading, you'll need to upgrade to access additional features." },
            { q: "Do you offer refunds?", a: "We offer a 30-day money-back guarantee for all paid plans. No questions asked." },
            { q: "Is there a free trial?", a: "Our Free plan is essentially a free trial with no time limit. You can use it indefinitely." }
          ].map((item, i) => (
            <div key={i} className="space-y-3">
              <h3 className="text-lg font-semibold text-[color:var(--heading)]" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif" }}>
                {item.q}
              </h3>
              <p className="text-[color:var(--muted)] leading-relaxed" style={{ fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif" }}>
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
