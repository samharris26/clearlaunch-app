"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Crown, Sparkles, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";

interface BillingClientProps {
  currentPlan: "free" | "pro" | "power";
  hasStripeCustomer: boolean;
  showManageButton?: boolean;
}

export default function BillingClient({
  currentPlan,
  hasStripeCustomer,
  showManageButton = false,
}: BillingClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "£0",
      period: "/month",
      description: "Perfect for getting started",
      features: [
        "1 active launch",
        "20 AI credits per month",
        "AI-powered launch planning",
        "Task management & tracking",
        "Basic launch templates",
      ],
      icon: Crown,
    },
    {
      name: "Pro",
      price: "£10",
      period: "/month",
      description: "For growing businesses",
      features: [
        "5 active launches",
        "100 AI calls/month",
        "Full AI access",
        "Task rewrites",
        "Post generation",
        "Idea generation",
        "Content assist",
        "Rewrite/refine steps",
        "Basic analytics",
      ],
      icon: Zap,
      recommended: true,
    },
    {
      name: "Power",
      price: "£30",
      period: "/month",
      description: "For power users and agencies",
      features: [
        "Unlimited launches",
        "300 AI calls/month",
        "All templates",
        "Priority AI access",
        "Advanced analytics",
        "Dedicated support",
      ],
      icon: Sparkles,
      comingSoon: true,
    },
  ];

  const handleUpgradeToPro = async () => {
    if (currentPlan === "pro") return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details || data.error || "Failed to create checkout session";
        console.error("Checkout API error:", errorMsg);
        alert(`Failed to start checkout: ${errorMsg}`);
        return;
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/billing/create-portal-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.details || data.error || "Failed to create portal session";
        console.error("Portal API error:", errorMsg);
        alert(`Failed to open billing portal: ${errorMsg}`);
        return;
      }

      // Redirect to Stripe Billing Portal
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
      alert("Failed to open billing portal. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl w-full">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.name.toLowerCase();
          const isPro = plan.name === "Pro";
          const isPower = plan.name === "Power";
          const Icon = plan.icon;

          return (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border border-[color:var(--border)] p-8 transition-all duration-300 ${
                isPro
                  ? "bg-[var(--card)] border-indigo-500/30 shadow-[var(--shadow-soft)] ring-1 ring-indigo-500/30"
                  : "bg-[var(--card)] border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[var(--shadow-subtle)]"
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
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isPro
                        ? "bg-indigo-500/20 text-indigo-500"
                        : isPower
                        ? "bg-sky-500/20 text-sky-500"
                        : "bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] text-[color:var(--muted)]"
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  {isCurrentPlan && (
                    <span
                      className="px-3 py-1 rounded-full bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-xs font-medium text-[color:var(--muted)]"
                      style={{
                        fontFamily:
                          "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>

                <h3
                  className="text-2xl font-bold text-[color:var(--heading)] mb-2"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  className="text-[color:var(--muted)] text-sm h-10"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  }}
                >
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-baseline gap-1">
                <span
                  className="text-4xl font-bold text-[color:var(--heading)]"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                  }}
                >
                  {plan.price}
                </span>
                <span
                  className="text-[color:var(--muted)]"
                  style={{
                    fontFamily:
                      "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                  }}
                >
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-start gap-3 text-sm text-[color:var(--text)]"
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    }}
                  >
                    <Check
                      className={`h-5 w-5 flex-shrink-0 ${
                        isPro
                          ? "text-indigo-500"
                          : isPower
                          ? "text-sky-500"
                          : "text-[color:var(--muted)]"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="mt-auto">
                {isCurrentPlan ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-xl bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-[color:var(--muted)] font-medium cursor-not-allowed"
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    }}
                  >
                    Current Plan
                  </button>
                ) : plan.name === "Free" ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-xl bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-[color:var(--muted)] font-medium cursor-not-allowed"
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    }}
                  >
                    Downgrade to Free
                  </button>
                ) : isPower ? (
                  <button
                    disabled
                    className="w-full py-3 px-6 rounded-xl bg-[color-mix(in_srgb,var(--surface)_70%,transparent)] border border-[color:var(--border)] text-[color:var(--muted)] font-medium cursor-not-allowed opacity-60"
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    }}
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button
                    onClick={handleUpgradeToPro}
                    disabled={isLoading}
                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 cursor-pointer ${
                      isPro
                        ? "bg-gradient-to-r from-indigo-500 to-cyan-500 text-white hover:from-indigo-400 hover:to-cyan-400 shadow-[var(--shadow-subtle)] hover:shadow-[var(--shadow-soft)] hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[color:var(--background)] disabled:opacity-50 disabled:cursor-not-allowed"
                        : "bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] border border-[color:var(--border)]"
                    }`}
                    style={{
                      fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                    }}
                  >
                    {isLoading ? "Loading..." : "Upgrade to Pro"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Manage Subscription Button */}
      {showManageButton && currentPlan === "pro" && hasStripeCustomer && (
        <div className="relative z-10 max-w-2xl w-full">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-subtle)]">
            <h3
              className="text-lg font-semibold text-[color:var(--heading)] mb-4"
              style={{
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              }}
            >
              Manage Subscription
            </h3>
            <p
              className="text-sm text-[color:var(--muted)] mb-4"
              style={{
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              Update your payment method, view invoices, or cancel your subscription.
            </p>
            <button
              onClick={handleManageSubscription}
              disabled={isLoadingPortal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] border border-[color:var(--border)] text-sm font-medium text-[color:var(--text)] hover:bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
              }}
            >
              {isLoadingPortal ? (
                "Loading..."
              ) : (
                <>
                  Open Billing Portal
                  <ExternalLink className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
