"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader2,
  Package,
  Repeat,
  ShieldCheck,
  ShoppingCart,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CartPlan, ShippingAddress } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const plans = [
  {
    amount: 2499,
    badge: "Best for continuity",
    copy: "Monthly refills, adherence tracking, and 90-day progress checkpoints.",
    icon: Repeat,
    label: "Monthly Treatment",
    planType: "subscription" as const
  },
  {
    amount: 7499,
    badge: "90-day starter",
    copy: "Full kit for a structured 90-day routine with guarantee evidence tracking.",
    icon: ShoppingCart,
    label: "One-time Hair Kit",
    planType: "one_time" as const
  }
];

const kit = [
  "Topical minoxidil support routine",
  "Clinician-review prompt for finasteride eligibility",
  "0.5 mm derma roller protocol",
  "Scalp shampoo and adherence checklist",
  "Before, 30, 60, and 90-day photo tracking"
];

const initialAddress: ShippingAddress = {
  city: "",
  line1: "",
  line2: "",
  name: "",
  phone: "",
  postalCode: "",
  state: ""
};

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function ProductPage() {
  const router = useRouter();
  const [planType, setPlanType] = useState<CartPlan>("subscription");
  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.planType === planType) || plans[0],
    [planType]
  );

  function updateAddress(key: keyof ShippingAddress, value: string) {
    setAddress((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function verifyPayment(payload: Record<string, unknown>, checkout: Record<string, unknown>) {
    const response = await fetch("/api/payments/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...payload,
        localOrderId: checkout.localOrderId,
        localSubscriptionId: checkout.localSubscriptionId,
        type: checkout.type
      })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment verification failed.");
    }

    return data;
  }

  async function checkout() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, planType })
      });
      const data = await response.json();

      if (response.status === 401) {
        router.push("/login?next=/pricing");
        return;
      }

      if (!response.ok) {
        setMessage(data.error || "Could not create checkout.");
        return;
      }

      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        setMessage("Razorpay script could not load. Please try again.");
        return;
      }

      const checkoutData = data.checkout as Record<string, unknown>;
      const instance = new window.Razorpay({
        amount: checkoutData.amount,
        currency: checkoutData.currency,
        description: selectedPlan.label,
        handler: async (paymentResponse: Record<string, unknown>) => {
          try {
            await verifyPayment(paymentResponse, checkoutData);
            setMessage("Payment verified. Your order is now active.");
            router.push("/orders");
            router.refresh();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : "Payment verification failed.");
          }
        },
        key: data.publicKey,
        name: "AviEx Hair Recovery",
        order_id: checkoutData.type === "order" ? checkoutData.orderId : undefined,
        prefill: {
          contact: address.phone,
          name: address.name
        },
        subscription_id:
          checkoutData.type === "subscription" ? checkoutData.subscriptionId : undefined,
        theme: { color: "#09111f" }
      });
      instance.open();
    } catch {
      setMessage("Checkout could not be created. Please verify Razorpay configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Pricing</p>
          <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            Choose your AI-guided hair recovery plan
          </h1>
          <p className="mt-5 max-w-2xl text-white/70">
            Payments are handled by Razorpay. Orders, subscriptions, delivery state, and the 90-day
            guarantee window are stored securely against your account.
          </p>

          <div className="mt-8 grid gap-4">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              const active = planType === plan.planType;
              return (
                <motion.button
                  key={plan.planType}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => setPlanType(plan.planType)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    active ? "border-aqua bg-aqua/10" : "border-white/10 bg-white/10 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-aqua">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs font-bold uppercase text-aqua">{plan.badge}</p>
                        <h2 className="mt-1 text-2xl font-black">{plan.label}</h2>
                        <p className="mt-2 text-sm leading-6 text-white/60">{plan.copy}</p>
                      </div>
                    </div>
                    <p className="text-2xl font-black">₹{plan.amount.toLocaleString("en-IN")}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {kit.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                <Check className="mt-0.5 size-4 shrink-0 text-leaf" />
                <p className="text-sm leading-6 text-white/70">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="sticky top-24 rounded-2xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/50">{selectedPlan.label}</p>
              <p className="mt-1 text-4xl font-black">₹{selectedPlan.amount.toLocaleString("en-IN")}</p>
            </div>
            <Package className="size-8 text-aqua" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {([
              ["name", "Full name"],
              ["phone", "Phone"],
              ["line1", "Address line"],
              ["line2", "Apartment"],
              ["city", "City"],
              ["state", "State"],
              ["postalCode", "PIN code"]
            ] as Array<[keyof ShippingAddress, string]>).map(([key, label]) => (
              <label key={key} className={key === "line1" || key === "line2" ? "sm:col-span-2" : ""}>
                <span className="text-sm font-semibold text-white/70">{label}</span>
                <input
                  value={address[key] || ""}
                  onChange={(event) => updateAddress(key, event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-aqua"
                  placeholder={label}
                />
              </label>
            ))}
          </div>

          <Button
            type="button"
            className="mt-6 min-h-14 w-full bg-aqua text-base text-ink hover:bg-white"
            onClick={checkout}
            disabled={loading}
          >
            {loading ? <Loader2 className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
            Pay with Razorpay
          </Button>

          {message ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm leading-6 text-white/70">
              {message}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Truck className="size-5 text-saffron" />
              <div>
                <p className="text-sm font-bold">Delivery tracking</p>
                <p className="text-xs text-white/50">Pending, shipped, delivered</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-leaf" />
              <div>
                <p className="text-sm font-bold">90-day guarantee</p>
                <p className="text-xs text-white/50">Evidence-based review</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
