import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { stripe, getPriceIdFromPlan } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY is not set in environment variables");
      return NextResponse.json(
        { 
          error: "Stripe is not configured",
          details: "STRIPE_SECRET_KEY is missing from environment variables"
        },
        { status: 500 }
      );
    }

    // Get current user from Supabase
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = user.id;

    const body = await request.json();
    const { plan } = body;

    if (!plan || !["pro", "power"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan. Must be 'pro' or 'power'" },
        { status: 400 }
      );
    }

    const priceId = getPriceIdFromPlan(plan);
    if (!priceId || priceId === "") {
      console.error(`Price ID not configured for plan: ${plan}. Check STRIPE_PRICE_ID_${plan.toUpperCase()} in environment variables.`);
      return NextResponse.json(
        { 
          error: `Price ID not configured for plan: ${plan}`,
          details: `Please set STRIPE_PRICE_ID_${plan.toUpperCase()} in your environment variables`
        },
        { status: 500 }
      );
    }

    // Get user's email from Supabase
    const supabase = await createClient();
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("userId", userId)
      .maybeSingle();
    
    // Use auth user email as fallback
    const email = userData?.email || user.email;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.clearlaunch.co.uk"}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://www.clearlaunch.co.uk"}/pricing?canceled=true`,
      metadata: {
        userId: userId,
        plan: plan,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          plan: plan,
        },
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

