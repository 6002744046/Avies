"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Database, PackageCheck, RefreshCcw, ShieldCheck, Users, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { demoOrders, demoRefunds } from "@/lib/demo-data";

type AdminOverview = {
  users: number;
  analyses: number;
  orders: typeof demoOrders;
  refunds: typeof demoRefunds;
};

const fallback: AdminOverview = {
  users: 1842,
  analyses: 3276,
  orders: demoOrders,
  refunds: demoRefunds
};

export function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview>(fallback);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        const response = await fetch("/api/admin/overview");
        if (response.ok) {
          const data = await response.json();
          setOverview(data);
        }
      } catch {
        setOverview(fallback);
      }
    }

    loadOverview();
  }, []);

  function decideRefund(id: string, status: "Approved" | "Rejected") {
    setOverview((current) => ({
      ...current,
      refunds: current.refunds.map((refund) =>
        refund.id === id ? { ...refund, status, admin_notes: `${status} in demo admin panel.` } : refund
      )
    }));
    setMessage(`Refund ${status.toLowerCase()} for ${id}. Wire this action to a secure admin-only route before production launch.`);
  }

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase text-coral">Admin panel</p>
          <h1 className="mt-3 text-4xl font-black md:text-6xl">Operations cockpit</h1>
          <p className="mt-4 max-w-3xl text-ink/60">
            View users, hair analysis records, orders, subscriptions, progress evidence, and guarantee refund requests.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Users" value={overview.users.toLocaleString()} tone="aqua" icon={<Users className="size-5" />} />
          <Metric label="Analyses" value={overview.analyses.toLocaleString()} tone="coral" icon={<Database className="size-5" />} />
          <Metric label="Open orders" value={overview.orders.length.toString()} tone="saffron" icon={<PackageCheck className="size-5" />} />
          <Metric label="Refund queue" value={overview.refunds.length.toString()} tone="leaf" icon={<RefreshCcw className="size-5" />} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <Card light>
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">Orders</h2>
              <ShieldCheck className="size-6 text-leaf" />
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-ink/10">
              {overview.orders.map((order) => (
                <div key={order.id} className="grid gap-3 border-b border-ink/10 bg-white p-4 last:border-b-0 md:grid-cols-5">
                  <p className="font-bold">{order.id}</p>
                  <p className="capitalize text-ink/60">{order.plan_type.replace("_", " ")}</p>
                  <p>₹{order.amount.toLocaleString("en-IN")}</p>
                  <p className="text-leaf">{order.status}</p>
                  <select
                    defaultValue={order.status}
                    className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm"
                    aria-label={`Update ${order.id} status`}
                  >
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                  </select>
                </div>
              ))}
            </div>
          </Card>

          <Card light>
            <h2 className="text-2xl font-black">Guarantee claims</h2>
            <div className="mt-5 space-y-3">
              {overview.refunds.map((refund) => (
                <div key={refund.id} className="rounded-lg border border-ink/10 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{refund.id}</p>
                      <p className="mt-2 text-sm leading-6 text-ink/60">{refund.reason}</p>
                    </div>
                    <span className="rounded-lg bg-saffron/20 px-3 py-1 text-xs font-bold text-ink">
                      {refund.status}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => decideRefund(refund.id, "Approved")}
                    >
                      <CheckCircle2 className="size-4" /> Approve
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => decideRefund(refund.id, "Rejected")}
                    >
                      <XCircle className="size-4" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["Hair analysis data", "Stage, score, AI summary, and selected lifestyle factors."],
            ["Subscription health", "Active, cancelled, renewals due, and failed payment queues."],
            ["Progress evidence", "Before, day 30, day 60, and day 90 uploads for review."]
          ].map(([title, copy]) => (
            <Card key={title} light>
              <p className="text-xl font-black">{title}</p>
              <p className="mt-3 text-sm leading-6 text-ink/60">{copy}</p>
            </Card>
          ))}
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-ink/10 bg-white p-4 text-sm text-ink/70">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
