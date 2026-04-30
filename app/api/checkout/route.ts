import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createRazorpayCheckout } from "@/lib/razorpay";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { CartPlan } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { plan } = (await request.json()) as { plan: CartPlan };
    const checkout = await createRazorpayCheckout(plan);

    const supabase = createServerSupabaseClient();
    if (supabase) {
      const { error } = await supabase.from("orders").insert({
        plan_type: plan,
        amount: checkout.amount / 100,
        status: "Processing",
        razorpay_order_id: checkout.orderId,
        razorpay_subscription_id: checkout.subscriptionId
      });
      if (error) {
        console.error("Order insert failed", error);
      }

      if (plan === "subscription") {
        const { error: subscriptionError } = await supabase.from("subscriptions").insert({
          plan_type: "monthly",
          status: "Active",
          amount: checkout.amount / 100,
          razorpay_subscription_id: checkout.subscriptionId
        });
        if (subscriptionError) {
          console.error("Subscription insert failed", subscriptionError);
        }
      }
    }

    return NextResponse.json({
      checkout,
      publicKey: env.razorpayPublicKey || env.razorpayKeyId
    });
  } catch (error) {
    console.error("Checkout route failed", error);
    return NextResponse.json({ error: "Could not create checkout" }, { status: 500 });
  }
}
