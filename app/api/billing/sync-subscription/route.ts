import { NextRequest, NextResponse } from "next/server";
import { getUser, createClient } from "@/lib/supabase/server";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";

/**
 * Manual sync endpoint to update user's plan from Stripe subscription
 * This is a fallback if webhooks fail or for manual syncing
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const supabase = await createClient();

    // Get user's Stripe customer ID
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("userId", userId)
      .maybeSingle();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        {
          error: "No Stripe customer found",
          details: "You need to complete a checkout first",
        },
        { status: 400 }
      );
    }

    // Get active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: userData.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription, set to free
      const { error: updateError } = await supabase
        .from("users")
        .update({
          plan: "free",
          subscription_status: "canceled",
          stripe_subscription_id: null,
          subscription_renews_at: null,
        })
        .eq("userId", userId);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({
        success: true,
        plan: "free",
        message: "No active subscription found, set to free plan",
      });
    }

    // Get the most recent active subscription
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;
    const plan = getPlanFromPriceId(priceId || "");

    if (!plan || plan === "free") {
      return NextResponse.json(
        {
          error: "Unknown plan",
          details: `Could not determine plan from price ID: ${priceId}`,
        },
        { status: 400 }
      );
    }

    // Update user's plan
    const currentPeriodEnd = (subscription as any).current_period_end as number;
    const renewsAt = new Date(currentPeriodEnd * 1000).toISOString();

    const { error: updateError } = await supabase
      .from("users")
      .update({
        plan: plan,
        stripe_subscription_id: subscription.id,
        subscription_status: subscription.status,
        subscription_renews_at: renewsAt,
      })
      .eq("userId", userId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      plan: plan,
      subscriptionStatus: subscription.status,
      renewsAt: renewsAt,
      message: `Successfully synced to ${plan} plan`,
    });
  } catch (error) {
    console.error("Error syncing subscription:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to sync subscription",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
