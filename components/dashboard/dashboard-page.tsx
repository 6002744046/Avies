"use client";

import { FormEvent, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Camera, CheckCircle2, Clock, Loader2, Package, RefreshCcw, Upload, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import { demoOrders, demoProgress } from "@/lib/demo-data";
import type { ProgressMilestone } from "@/lib/types";

const milestones: Array<{ value: ProgressMilestone; label: string }> = [
  { value: "before", label: "Before" },
  { value: "day_30", label: "Day 30" },
  { value: "day_60", label: "Day 60" },
  { value: "day_90", label: "Day 90" }
];

export function DashboardPage() {
  const [milestone, setMilestone] = useState<ProgressMilestone>("day_90");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
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

  async function uploadProgress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("milestone", milestone);
      formData.append("notes", notes);
      if (file) {
        formData.append("photo", file);
      }

      const response = await fetch("/api/progress", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      setMessage(data.message || "Progress uploaded.");
      setFile(null);
      setNotes("");
    } catch {
      setMessage("Progress upload failed. Check Supabase Storage configuration.");
    } finally {
      setLoading(false);
    }
  }

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
            <form onSubmit={uploadProgress} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-ink/70">Milestone</span>
                <select
                  value={milestone}
                  onChange={(event) => setMilestone(event.target.value as ProgressMilestone)}
                  className="mt-2 w-full rounded-lg border border-ink/10 bg-white px-4 py-3 outline-none focus:border-aqua"
                >
                  {milestones.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink/70">Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="mt-2 w-full rounded-lg border border-dashed border-ink/20 bg-white px-4 py-5 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-ink/70">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-lg border border-ink/10 bg-white px-4 py-3 outline-none focus:border-aqua"
                  placeholder="Shedding, irritation, adherence, or visible changes"
                />
              </label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                Upload milestone
              </Button>
            </form>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <Card light className="lg:col-span-2">
            <h2 className="text-2xl font-black">Orders and subscription</h2>
            <div className="mt-5 overflow-hidden rounded-lg border border-ink/10">
              {demoOrders.map((order) => (
                <div key={order.id} className="grid gap-3 border-b border-ink/10 bg-white p-4 last:border-b-0 md:grid-cols-4">
                  <p className="font-bold">{order.id}</p>
                  <p className="capitalize text-ink/60">{order.plan_type.replace("_", " ")}</p>
                  <p className="font-bold">₹{order.amount.toLocaleString("en-IN")}</p>
                  <p className="text-leaf">{order.status}</p>
                </div>
              ))}
            </div>
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
