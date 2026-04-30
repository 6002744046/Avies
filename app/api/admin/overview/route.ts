import { NextResponse } from "next/server";
import { demoOrders, demoRefunds } from "@/lib/demo-data";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function GET() {
  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      users: 1842,
      analyses: 3276,
      orders: demoOrders,
      refunds: demoRefunds,
      mode: "demo"
    });
  }

  const [users, analyses, orders, refunds] = await Promise.all([
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.from("hair_analysis").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("refund_requests").select("*").order("created_at", { ascending: false }).limit(10)
  ]);

  return NextResponse.json({
    users: users.count || 0,
    analyses: analyses.count || 0,
    orders: orders.data?.length ? orders.data : demoOrders,
    refunds: refunds.data?.length ? refunds.data : demoRefunds,
    mode: "database"
  });
}
