"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, PackageCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { OrderRecord } from "@/lib/types";

function formatDate(value?: string | null) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function deliveryStep(status?: string) {
  if (status === "Delivered") {
    return 3;
  }

  if (status === "Shipped") {
    return 2;
  }

  return 1;
}

export function OrdersPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store"
        });

        if (response.status === 401) {
          window.location.assign("/login?next=/orders");
          return;
        }

        const data = await response.json();
        if (active) {
          setOrders(data.orders || []);
          if (!response.ok) {
            setMessage(data.error || "Could not load orders.");
          }
        }
      } catch {
        if (active) {
          setMessage("Could not load orders.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-coral">Orders</p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">Track your hair kit</h1>
            <p className="mt-4 max-w-2xl text-ink/60">
              Payment status, delivery state, and 90-day guarantee window stay linked to your account.
            </p>
          </div>
          <Button href="/pricing">
            New order <ArrowRight className="size-4" />
          </Button>
        </div>

        {loading ? (
          <Card light className="rounded-2xl">
            <div className="flex items-center gap-3 text-ink/60">
              <Loader2 className="size-5 animate-spin" />
              Loading orders...
            </div>
          </Card>
        ) : null}

        {!loading && !orders.length ? (
          <Card light className="rounded-2xl text-center">
            <PackageCheck className="mx-auto size-10 text-aqua" />
            <h2 className="mt-4 text-2xl font-black">No orders yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-ink/60">
              Start with a kit or monthly treatment plan and your order will appear here after payment.
            </p>
            <Button href="/pricing" className="mt-6">
              Choose plan
            </Button>
          </Card>
        ) : null}

        <div className="grid gap-4">
          {orders.map((order) => {
            const step = deliveryStep(order.deliveryStatus);
            return (
              <Card key={order.id} light className="rounded-2xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-coral">{order.planType || order.plan_type}</p>
                    <h2 className="mt-2 text-2xl font-black">{order.product || "AviEx Hair Recovery Kit"}</h2>
                    <p className="mt-2 text-sm text-ink/55">Order ID: {order.id}</p>
                  </div>
                  <div className="rounded-2xl bg-ink px-4 py-3 text-white">
                    <p className="text-xs text-white/55">Amount</p>
                    <p className="text-xl font-black">₹{order.amount.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {["Pending", "Shipped", "Delivered"].map((label, index) => (
                    <div
                      key={label}
                      className={`rounded-2xl border p-4 ${
                        index + 1 <= step ? "border-aqua/30 bg-aqua/10" : "border-ink/10 bg-white"
                      }`}
                    >
                      <Truck className="mb-3 size-5 text-aqua" />
                      <p className="font-black">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid gap-3 text-sm text-ink/60 sm:grid-cols-3">
                  <p>Payment: {order.paymentStatus || "created"}</p>
                  <p>Started: {formatDate(order.startDate || order.createdAt || order.created_at)}</p>
                  <p>Guarantee until: {formatDate(order.expiryDate)}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {message ? (
          <p className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 text-sm text-ink/70">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
