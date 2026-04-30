"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Package, Repeat, ShoppingCart, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { CartPlan } from "@/lib/types";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const kit = [
  {
    name: "Minoxidil",
    detail: "Topical support for regrowth routines",
    color: "bg-aqua"
  },
  {
    name: "Finasteride",
    detail: "Clinician-review prompt and eligibility workflow",
    color: "bg-coral"
  },
  {
    name: "Derma roller",
    detail: "Weekly micro-stimulation protocol",
    color: "bg-saffron"
  },
  {
    name: "Scalp shampoo",
    detail: "Low-irritation cleansing and scalp care",
    color: "bg-leaf"
  }
];

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
  const [plan, setPlan] = useState<CartPlan>("subscription");
  const [cartAdded, setCartAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const price = plan === "subscription" ? 2499 : 7499;

  async function checkout() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const data = await response.json();

      if (data.checkout.mode === "demo") {
        setMessage("Demo checkout created. Add Razorpay keys to open the live payment modal.");
        return;
      }

      const ready = await loadRazorpayScript();
      if (!ready || !window.Razorpay) {
        setMessage("Razorpay script could not load. Please try again.");
        return;
      }

      const instance = new window.Razorpay({
        key: data.publicKey,
        amount: data.checkout.amount,
        currency: data.checkout.currency,
        name: "AviEx Hair Recovery",
        description:
          plan === "subscription" ? "Monthly AI hair recovery subscription" : "Personalized hair recovery kit",
        order_id: data.checkout.orderId || undefined,
        subscription_id: data.checkout.subscriptionId || undefined,
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
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
        <div>
          <p className="text-sm font-bold uppercase text-aqua">Recovery kit</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">
            Personalized treatment, shipped with a 90-day tracking system
          </h1>
          <p className="mt-5 max-w-2xl text-white/70">
            The kit combines topical support, clinician-review medication workflow, scalp stimulation,
            and photo-based accountability.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {kit.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full">
                  <div className="mb-5 flex min-h-36 items-end gap-4 rounded-lg border border-white/10 bg-white/10 p-4">
                    <div className={`h-24 w-14 rounded-lg ${item.color} shadow-glow`} />
                    <div className="h-32 w-16 rounded-lg border border-white/20 bg-white/10" />
                    <div className="h-20 w-20 rounded-lg border border-white/20 bg-white/10" />
                  </div>
                  <p className="text-xl font-black">{item.name}</p>
                  <p className="mt-2 text-sm leading-6 text-white/60">{item.detail}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        <Card className="sticky top-24">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/50">AI Hair Recovery Kit</p>
              <p className="mt-1 text-3xl font-black">₹{price.toLocaleString("en-IN")}</p>
            </div>
            <Package className="size-8 text-aqua" />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { value: "subscription", label: "Subscribe", icon: Repeat, copy: "Monthly care" },
              { value: "one_time", label: "One-time", icon: ShoppingCart, copy: "Single kit" }
            ].map((option) => {
              const Icon = option.icon;
              const active = plan === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setPlan(option.value as CartPlan)}
                  className={`rounded-lg border p-4 text-left transition ${
                    active ? "border-aqua bg-aqua/10" : "border-white/10 bg-white/10 hover:border-white/30"
                  }`}
                >
                  <Icon className="mb-4 size-5 text-aqua" />
                  <p className="font-black">{option.label}</p>
                  <p className="mt-1 text-xs text-white/50">{option.copy}</p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-3">
            {[
              "AI-personalized instructions",
              "Progress photo upload reminders",
              "90-day guarantee eligibility workflow",
              plan === "subscription" ? "Auto-refill every month" : "Full 90-day starter kit"
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                <Check className="size-4 text-leaf" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setCartAdded(true);
                setMessage("Kit added to cart. You can checkout now.");
              }}
            >
              <ShoppingCart className="size-4" />
              {cartAdded ? "Added to cart" : "Add to cart"}
            </Button>
            <Button
              type="button"
              className="bg-aqua text-ink hover:bg-white"
              onClick={checkout}
              disabled={loading}
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              Checkout
            </Button>
          </div>

          {message ? (
            <p className="mt-4 rounded-lg border border-white/10 bg-white/10 p-3 text-sm text-white/70">
              {message}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div className="flex gap-3">
              <Truck className="size-5 text-saffron" />
              <div>
                <p className="text-sm font-bold">Fast dispatch</p>
                <p className="text-xs text-white/50">Tracked orders</p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="size-5 text-leaf" />
              <div>
                <p className="text-sm font-bold">Guarantee</p>
                <p className="text-xs text-white/50">Photo evidence based</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
