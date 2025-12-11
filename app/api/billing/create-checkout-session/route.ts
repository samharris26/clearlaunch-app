import { NextRequest, NextResponse } from "next/server";
import { getUser, createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const supabase = await createClient();

    // Get user's email from users table or auth
    const { data: userData } = await supabase
      .from("users")
      .select("email, stripe_customer_id")
      .eq("userId", userId)
      .maybeSingle();

    const email = userData?.email || user.email;

    if (!email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Get or create Stripe Customer
    let customerId = userData?.stripe_customer_id;

    if (customerId) {
      // Verify the customer exists in Stripe
      try {
        await stripe.customers.retrieve(customerId);
      } catch (error: any) {
        // If customer doesn't exist (404) or other error, create a new one
        if (error?.statusCode === 404 || error?.code === "resource_missing") {
          console.warn(`Customer ${customerId} not found in Stripe, creating new customer`);
          customerId = null; // Reset to create new customer
        } else {
          throw error; // Re-throw other errors
        }
      }
    }

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId,
        },
      });

      customerId = customer.id;

      // Save customer ID to database
      const { error: updateError } = await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("userId", userId);

      if (updateError) {
        console.error("Error saving Stripe customer ID:", updateError);
        // Continue anyway - customer was created in Stripe
      }
    }

    // Get Pro plan price ID from environment (support both old and new env var names)
    const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_ID_PRO;

    if (!priceId || priceId.trim() === "") {
      console.error("Pro plan price ID is missing or empty");
      console.error("Available env vars:", {
        hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
        hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
        hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        hasPriceProMonthly: !!process.env.STRIPE_PRICE_PRO_MONTHLY,
        hasPriceIdPro: !!process.env.STRIPE_PRICE_ID_PRO,
        priceProMonthlyValue: process.env.STRIPE_PRICE_PRO_MONTHLY || "NOT SET",
        priceIdProValue: process.env.STRIPE_PRICE_ID_PRO || "NOT SET",
      });
      return NextResponse.json(
        {
          error: "Pro plan price not configured",
          details: `Neither STRIPE_PRICE_PRO_MONTHLY nor STRIPE_PRICE_ID_PRO is set. Please set one of these environment variables.`,
        },
        { status: 500 }
      );
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
      metadata: {
        userId: userId,
        plan: "pro",
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: "pro",
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to create checkout session",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
