"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CheckoutButtonProps {
  plan: "pro" | "power";
  currentPlan?: "free" | "pro" | "power";
  className?: string;
  children: React.ReactNode;
}

export default function CheckoutButton({
  plan,
  currentPlan,
  className = "",
  children,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    // Don't allow checkout if already on this plan or higher
    if (currentPlan === plan || (currentPlan === "power" && plan === "pro")) {
      return;
    }

    // Block Power plan checkout (coming soon)
    if (plan === "power") {
      return;
    }

    // Only allow Pro plan checkout
    if (plan !== "pro") {
      console.warn("Only Pro plan checkout is available");
      return;
    }

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
        throw new Error(errorMsg);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to start checkout";
      alert(`Failed to start checkout: ${errorMessage}. Please check your console for details.`);
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || currentPlan === plan || (currentPlan === "power" && plan === "pro") || plan === "power";

  return (
    <button
      onClick={handleCheckout}
      disabled={isDisabled}
      className={className}
    >
      {isLoading ? "Loading..." : children}
    </button>
  );
}

