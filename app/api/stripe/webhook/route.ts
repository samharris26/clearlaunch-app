import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe, getPlanFromPriceId } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set in environment variables");
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    console.error("Missing userId or plan in checkout session metadata");
    return;
  }

  // Update user plan in Supabase
  const { error } = await supabase
    .from("users")
    .update({ plan: plan })
    .eq("userId", userId);

  if (error) {
    console.error("Error updating user plan:", error);
    throw error;
  }

  console.log(`✅ Updated user ${userId} to plan: ${plan}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  const priceId = subscription.items.data[0]?.price.id;

  if (!userId || !priceId) {
    console.error("Missing userId or priceId in subscription");
    return;
  }

  const plan = getPlanFromPriceId(priceId);
  if (!plan) {
    console.error(`Unknown price ID: ${priceId}`);
    return;
  }

  // Update user plan in Supabase
  const { error } = await supabase
    .from("users")
    .update({ plan: plan })
    .eq("userId", userId);

  if (error) {
    console.error("Error updating user plan:", error);
    throw error;
  }

  console.log(`✅ Updated user ${userId} to plan: ${plan} (from subscription)`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error("Missing userId in subscription");
    return;
  }

  // Downgrade user to free plan
  const { error } = await supabase
    .from("users")
    .update({ plan: "free" })
    .eq("userId", userId);

  if (error) {
    console.error("Error downgrading user plan:", error);
    throw error;
  }

  console.log(`✅ Downgraded user ${userId} to free plan`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Optional: Log successful payment or send confirmation email
  console.log(`✅ Payment succeeded for invoice: ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // Optional: Notify user of failed payment or handle retry logic
  console.log(`⚠️ Payment failed for invoice: ${invoice.id}`);
}

