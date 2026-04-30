"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  PackageCheck,
  RefreshCcw,
  ShieldCheck,
  Stethoscope,
  Users,
  WalletCards,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Metric } from "@/components/ui/metric";
import type { UserRole } from "@/lib/auth";

type AdminUser = {
  createdAt: string | null;
  email: string;
  role: UserRole;
  uid: string;
};

type RefundRequest = {
  adminNotes: string;
  createdAt: string | null;
  id: string;
  reason: string;
  reviewedAt: string | null;
  status: "pending" | "approved" | "denied";
  userEmail: string;
  userId: string;
};

type AdminOrder = {
  amount: number;
  createdAt: string | null;
  deliveryStatus: "Pending" | "Shipped" | "Delivered";
  id: string;
  paymentStatus: "created" | "paid" | "failed" | "refunded";
  planType: "one_time" | "subscription";
  product: string;
  userEmail: string;
  userId: string;
};

type AdminReport = {
  createdAt: string | null;
  hairDensity: string;
  hairLossStage: string;
  id: string;
  imageUrl: string;
  recommendation: string;
  userId: string;
};

type AdminOverview = {
  charts: {
    revenue: Array<{ date: string; revenue: number }>;
    userGrowth: Array<{ date: string; users: number }>;
  };
  metrics: {
    activeSubscriptions: number;
    orders: number;
    refunds: number;
    refundsPending: number;
    revenue: number;
    users: number;
  };
  orders: AdminOrder[];
  refunds: RefundRequest[];
  reports: AdminReport[];
  users: AdminUser[];
};

const emptyOverview: AdminOverview = {
  charts: {
    revenue: [],
    userGrowth: []
  },
  metrics: {
    activeSubscriptions: 0,
    orders: 0,
    refunds: 0,
    refundsPending: 0,
    revenue: 0,
    users: 0
  },
  orders: [],
  refunds: [],
  reports: [],
  users: []
};

async function fetchAdminOverview() {
  const response = await fetch("/api/admin/overview", {
    cache: "no-store"
  });
  const data = await response.json();

  return { data, response };
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function statusClasses(status: RefundRequest["status"]) {
  if (status === "approved") {
    return "bg-leaf/20 text-ink";
  }

  if (status === "denied") {
    return "bg-coral/20 text-ink";
  }

  return "bg-saffron/25 text-ink";
}

export function AdminPage() {
  const [overview, setOverview] = useState<AdminOverview>(emptyOverview);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function loadOverview() {
    setLoading(true);
    setMessage("");

    try {
      const { data, response } = await fetchAdminOverview();

      if (response.status === 401) {
        window.location.assign("/login?next=/admin");
        return;
      }

      if (response.status === 403) {
        window.location.assign("/");
        return;
      }

      if (response.ok) {
        setOverview(data as AdminOverview);
      } else {
        setMessage(data.error || "Could not load admin overview.");
      }
    } catch {
      setMessage("Could not load admin overview.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    void fetchAdminOverview()
      .then(({ data, response }) => {
        if (!active) {
          return;
        }

        if (response.status === 401) {
          window.location.assign("/login?next=/admin");
          return;
        }

        if (response.status === 403) {
          window.location.assign("/");
          return;
        }

        if (response.ok) {
          setOverview(data as AdminOverview);
        } else {
          setMessage(data.error || "Could not load admin overview.");
        }
      })
      .catch(() => {
        if (active) {
          setMessage("Could not load admin overview.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function changeRole(uid: string, role: UserRole) {
    setSavingId(uid);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not update role.");
        return;
      }

      setOverview((current) => ({
        ...current,
        users: current.users.map((user) => (user.uid === uid ? { ...user, role } : user))
      }));
      setMessage(`Role updated to ${role}.`);
    } catch {
      setMessage("Could not update role.");
    } finally {
      setSavingId(null);
    }
  }

  async function updateDelivery(id: string, deliveryStatus: AdminOrder["deliveryStatus"]) {
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus })
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not update delivery status.");
        return;
      }

      setOverview((current) => ({
        ...current,
        orders: current.orders.map((order) =>
          order.id === id ? { ...order, deliveryStatus } : order
        )
      }));
      setMessage("Delivery status updated.");
    } catch {
      setMessage("Could not update delivery status.");
    } finally {
      setSavingId(null);
    }
  }

  async function decideRefund(id: string, status: "approved" | "denied") {
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/refunds/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          adminNotes: `${status} after 90-day guarantee evidence review.`,
          status
        })
      });
      const data = await response.json();

      if (response.status === 401) {
        window.location.assign("/login?next=/admin");
        return;
      }

      if (response.status === 403) {
        window.location.assign("/");
        return;
      }

      if (!response.ok) {
        setMessage(data.error || "Could not update refund request.");
        return;
      }

      setOverview((current) => ({
        ...current,
        metrics: {
          ...current.metrics,
          refundsPending: Math.max(
            0,
            current.refunds.filter((refund) => refund.status === "pending" && refund.id !== id)
              .length
          )
        },
        refunds: current.refunds.map((refund) =>
          refund.id === id ? { ...refund, ...data.refund } : refund
        )
      }));
      setMessage(`Refund ${status === "approved" ? "approved" : "denied"} for ${id}.`);
    } catch {
      setMessage("Could not update refund request.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-sm font-bold uppercase text-coral">Admin analytics</p>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-6xl">Operations command</h1>
            <p className="mt-4 max-w-3xl text-ink/60">
              Users, orders, revenue, subscriptions, delivery, AI reports, and 90-day refund reviews
              are loaded only after server-side admin verification.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={() => void loadOverview()}>
            <RefreshCcw className="size-4" /> Refresh
          </Button>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            icon={<Users className="size-5" />}
            label="Total users"
            tone="aqua"
            value={overview.metrics.users.toLocaleString("en-IN")}
          />
          <Metric
            icon={<PackageCheck className="size-5" />}
            label="Total orders"
            tone="coral"
            value={overview.metrics.orders.toLocaleString("en-IN")}
          />
          <Metric
            icon={<WalletCards className="size-5" />}
            label="Revenue"
            tone="saffron"
            value={`₹${overview.metrics.revenue.toLocaleString("en-IN")}`}
          />
          <Metric
            icon={<Stethoscope className="size-5" />}
            label="Active subscriptions"
            tone="leaf"
            value={overview.metrics.activeSubscriptions.toLocaleString("en-IN")}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card light className="rounded-2xl">
            <div className="flex items-center gap-3">
              <BarChart3 className="size-5 text-aqua" />
              <h2 className="text-2xl font-black">Revenue over time</h2>
            </div>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.charts.revenue}>
                  <defs>
                    <linearGradient id="admin-revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#44d7c6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#44d7c6" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e6ebf1" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#44d7c6" fill="url(#admin-revenue)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card light className="rounded-2xl">
            <div className="flex items-center gap-3">
              <Users className="size-5 text-coral" />
              <h2 className="text-2xl font-black">User growth</h2>
            </div>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overview.charts.userGrowth}>
                  <defs>
                    <linearGradient id="admin-users" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7d64" stopOpacity={0.46} />
                      <stop offset="95%" stopColor="#ff7d64" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e6ebf1" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#ff7d64" fill="url(#admin-users)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card light className="rounded-2xl">
            <h2 className="text-2xl font-black">User management</h2>
            <div className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white">
              {overview.users.length ? (
                overview.users.map((user) => (
                  <div
                    key={user.uid}
                    className="grid gap-3 border-b border-ink/10 p-4 last:border-b-0 md:grid-cols-[1.4fr_0.75fr_0.8fr]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-black">{user.email || "No email"}</p>
                      <p className="mt-1 truncate text-xs text-ink/45">{user.uid}</p>
                    </div>
                    <select
                      value={user.role}
                      disabled={savingId === user.uid}
                      onChange={(event) => changeRole(user.uid, event.target.value as UserRole)}
                      className="rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm font-bold"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <p className="text-sm text-ink/55">{formatDate(user.createdAt)}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm leading-6 text-ink/55">
                  {loading ? "Loading users..." : "No Firestore users yet."}
                </div>
              )}
            </div>
          </Card>

          <Card light className="rounded-2xl">
            <h2 className="text-2xl font-black">Orders</h2>
            <div className="mt-5 space-y-3">
              {overview.orders.length ? (
                overview.orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-ink/10 bg-white p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-black">{order.product}</p>
                        <p className="mt-1 text-xs text-ink/45">{order.userEmail || order.userId}</p>
                      </div>
                      <p className="font-black">₹{order.amount.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <p className="rounded-2xl bg-ink/5 px-3 py-2 text-sm">{order.paymentStatus}</p>
                      <p className="rounded-2xl bg-ink/5 px-3 py-2 text-sm">{order.planType}</p>
                      <select
                        value={order.deliveryStatus}
                        disabled={savingId === order.id}
                        onChange={(event) =>
                          updateDelivery(order.id, event.target.value as AdminOrder["deliveryStatus"])
                        }
                        className="rounded-2xl border border-ink/10 bg-white px-3 py-2 text-sm font-bold"
                      >
                        <option>Pending</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                      </select>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/55">
                  {loading ? "Loading orders..." : "No orders yet."}
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <Card light className="rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-coral">90-day guarantee</p>
                <h2 className="mt-1 text-2xl font-black">Refund review</h2>
              </div>
              <ShieldCheck className="size-6 shrink-0 text-leaf" />
            </div>

            <div className="mt-5 space-y-3">
              {overview.refunds.length ? (
                overview.refunds.map((refund) => (
                  <motion.div
                    key={refund.id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    className="rounded-2xl border border-ink/10 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black">{refund.userEmail || refund.id}</p>
                        <p className="mt-1 text-xs text-ink/45">
                          Submitted {formatDate(refund.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`rounded-2xl px-3 py-1 text-xs font-black ${statusClasses(
                          refund.status
                        )}`}
                      >
                        {refund.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-ink/60">{refund.reason}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => decideRefund(refund.id, "approved")}
                        disabled={savingId === refund.id}
                      >
                        <CheckCircle2 className="size-4" /> Approve
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => decideRefund(refund.id, "denied")}
                        disabled={savingId === refund.id}
                      >
                        <XCircle className="size-4" /> Deny
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="rounded-2xl border border-ink/10 bg-white p-6 text-sm leading-6 text-ink/55">
                  {loading ? "Loading refund requests..." : "No refund requests yet."}
                </div>
              )}
            </div>
          </Card>

          <Card light className="rounded-2xl">
            <h2 className="text-2xl font-black">AI reports</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {overview.reports.length ? (
                overview.reports.map((report) => (
                  <div key={report.id} className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
                    {report.imageUrl ? (
                      <div className="relative aspect-[4/3] bg-ink/5">
                        <Image src={report.imageUrl} alt="AI analysis upload" fill className="object-cover" unoptimized />
                      </div>
                    ) : null}
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase text-coral">{report.hairLossStage || "AI report"}</p>
                      <p className="mt-2 font-black">{report.hairDensity || "Density estimate pending"}</p>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink/60">
                        {report.recommendation || "No recommendation available."}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-ink/10 bg-white p-6 text-sm text-ink/55 md:col-span-2">
                  {loading ? "Loading AI reports..." : "No AI reports yet."}
                </div>
              )}
            </div>
          </Card>
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
