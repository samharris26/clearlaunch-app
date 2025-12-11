import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  console.log("🔔 Webhook received");

  if (!signature) {
    console.error("❌ No signature provided");
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
    console.log(`✅ Webhook verified: ${event.type} (ID: ${event.id})`);
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    console.log(`📥 Processing webhook event: ${event.type}`);
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("💳 Checkout session completed:", {
          sessionId: session.id,
          customerId: session.customer,
          userId: session.metadata?.userId,
          plan: session.metadata?.plan,
        });
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("📋 Subscription event:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
          status: subscription.status,
          priceId: subscription.items.data[0]?.price.id,
        });
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log("🗑️ Subscription deleted:", {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        });
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("✅ Payment succeeded:", invoice.id);
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("⚠️ Payment failed:", invoice.id);
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    console.log(`✅ Webhook processed successfully: ${event.type}`);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string | null;

  console.log("🔍 Processing checkout completion:", {
    userId,
    plan,
    customerId,
    subscriptionId,
    sessionId: session.id,
  });

  if (!userId || !plan || !customerId) {
    console.error("❌ Missing required data:", {
      hasUserId: !!userId,
      hasPlan: !!plan,
      hasCustomerId: !!customerId,
    });
    return;
  }

  const supabase = await createClient();

  // Update user with subscription info
  const updateData: any = {
    plan: plan,
    stripe_customer_id: customerId,
    subscription_status: "active",
  };

  if (subscriptionId) {
    updateData.stripe_subscription_id = subscriptionId;
  }

  const { error, data } = await supabase
    .from("users")
    .update(updateData)
    .eq("userId", userId)
    .select();

  if (error) {
    console.error("❌ Error updating user plan:", error);
    throw error;
  }

  console.log(`✅ Updated user ${userId} to plan: ${plan} (checkout completed)`, {
    updatedRows: data?.length || 0,
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;
  // Access current_period_end using bracket notation for TypeScript compatibility
  const currentPeriodEnd = (subscription as any).current_period_end as number;

  if (!customerId || !priceId) {
    console.error("Missing customerId or priceId in subscription");
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }

  const supabase = await createClient();

  // Find user by stripe_customer_id
  const { data: userData, error: findError } = await supabase
    .from("users")
    .select("userId")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (findError || !userData) {
    console.error("Error finding user by stripe_customer_id:", findError);
    return;
  }

  // Convert current_period_end (Unix timestamp) to timestamptz
  const renewsAt = new Date(currentPeriodEnd * 1000).toISOString();

  // Update user subscription info
  const { error: updateError } = await supabase
    .from("users")
    .update({
      plan: plan,
      stripe_subscription_id: subscriptionId,
      subscription_status: status,
      subscription_renews_at: renewsAt,
    })
    .eq("userId", userData.userId);

  if (updateError) {
    console.error("Error updating user subscription:", updateError);
    throw updateError;
  }

  console.log(
    `✅ Updated user ${userData.userId} to plan: ${plan}, status: ${status}`
  );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  if (!customerId) {
    console.error("Missing customerId in subscription");
    return;
  }

  const supabase = await createClient();

  // Find user by stripe_customer_id
  const { data: userData, error: findError } = await supabase
    .from("users")
    .select("userId")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (findError || !userData) {
    console.error("Error finding user by stripe_customer_id:", findError);
    return;
  }

  // Downgrade user to free plan and clear subscription fields
  const { error: updateError } = await supabase
    .from("users")
    .update({
      plan: "free",
      subscription_status: "canceled",
      stripe_subscription_id: null,
      subscription_renews_at: null,
    })
    .eq("userId", userData.userId);

  if (updateError) {
    console.error("Error downgrading user plan:", updateError);
    throw updateError;
  }

  console.log(`✅ Downgraded user ${userData.userId} to free plan`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Optional: Log successful payment or send confirmation email
  console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Optional: Notify user of failed payment or handle retry logic
  console.log(`⚠️ Payment failed for invoice: ${invoice.id}`);
}

