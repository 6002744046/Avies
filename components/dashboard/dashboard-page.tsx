"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Camera, CheckCircle2, Clock, Loader2, Package, RefreshCcw, WalletCards } from "lucide-react";
import { PhotoUploader } from "@/components/upload/photo-uploader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { demoOrders, demoProgress } from "@/lib/demo-data";
import type { OrderRecord, ProgressMilestone } from "@/lib/types";

const milestones: Array<{ value: ProgressMilestone; label: string }> = [
  { value: "before", label: "Before" },
  { value: "day_30", label: "Day 30" },
  { value: "day_60", label: "Day 60" },
  { value: "day_90", label: "Day 90" }
];

export function DashboardPage() {
  const [orders, setOrders] = useState<OrderRecord[]>(demoOrders);
  const [claimLoading, setClaimLoading] = useState(false);
  const [message, setMessage] = useState("");

  const chartData = useMemo(
    () =>
      demoProgress.map((item) => ({
        milestone: item.milestone.replace("_", " "),
        density: item.density_score
      })),
    []
  );

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const response = await fetch("/api/orders", {
          cache: "no-store"
        });
        const data = await response.json();

        if (active && response.ok) {
          setOrders(data.orders || []);
        }
      } catch {
        if (active) {
          setOrders(demoOrders);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, []);

  async function requestRefund() {
    setClaimLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: "Completed 90-day routine and requesting visible progress review."
        })
      });
      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login?next=/dashboard");
        return;
      }

      setMessage(data.message || "Guarantee request submitted.");
    } catch {
      setMessage("Guarantee request could not be submitted.");
    } finally {
      setClaimLoading(false);
    }
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-coral">Dashboard</p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">Your recovery command center</h1>
            <p className="mt-4 max-w-3xl text-ink/60">
              Track the analysis result, upload progress photos, monitor orders, and keep the guarantee evidence complete.
            </p>
          </div>
          <Button href="/analysis">Run new analysis</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Current plan" value="90 days" tone="aqua" icon={<Clock className="size-5" />} />
          <Metric label="Routine adherence" value="92%" tone="leaf" icon={<CheckCircle2 className="size-5" />} />
          <Metric label="Active order" value="1" tone="saffron" icon={<Package className="size-5" />} />
          <Metric label="Subscription" value="Live" tone="coral" icon={<WalletCards className="size-5" />} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card light>
            <h2 className="text-2xl font-black">Hair growth tracking</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="dash-density" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#74d680" stopOpacity={0.46} />
                      <stop offset="95%" stopColor="#74d680" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e6ebf1" />
                  <XAxis dataKey="milestone" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="density" stroke="#74d680" fill="url(#dash-density)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card light>
            <h2 className="text-2xl font-black">Progress upload</h2>
            <div className="mt-5">
              <PhotoUploader onMessage={setMessage} />
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card light className="lg:col-span-2">
            <h2 className="text-2xl font-black">Orders and subscription</h2>
            <div className="mt-5 overflow-hidden rounded-lg border border-ink/10">
              {orders.slice(0, 3).map((order) => (
                <div key={order.id} className="grid gap-3 border-b border-ink/10 bg-white p-4 last:border-b-0 md:grid-cols-4">
                  <p className="font-bold">{order.id}</p>
                  <p className="capitalize text-ink/60">{(order.planType || order.plan_type).replace("_", " ")}</p>
                  <p className="font-bold">₹{order.amount.toLocaleString("en-IN")}</p>
                  <p className="text-leaf">{order.deliveryStatus || order.status}</p>
                </div>
              ))}
            </div>
            <Button href="/orders" variant="ghost" className="mt-5">
              View all orders
            </Button>
          </Card>

          <Card light>
            <h2 className="text-2xl font-black">90-day guarantee</h2>
            <div className="mt-5 space-y-3">
              {milestones.map((item, index) => (
                <div key={item.value} className="flex items-center gap-3 text-sm">
                  {index < 3 ? <CheckCircle2 className="size-5 text-leaf" /> : <Camera className="size-5 text-coral" />}
                  <span>{item.label} photo</span>
                </div>
              ))}
            </div>
            <Button type="button" className="mt-6 w-full" onClick={requestRefund} disabled={claimLoading}>
              {claimLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
              Request review
            </Button>
          </Card>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/70">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
