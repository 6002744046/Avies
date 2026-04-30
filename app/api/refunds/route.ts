import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reason?: string };
    const reason =
      body.reason || "Completed 90-day routine and requesting visible progress review.";
    const supabase = createServerSupabaseClient();

    if (!supabase) {
      return NextResponse.json({
        message: "Demo guarantee request submitted. Add Supabase keys to persist refund reviews.",
        refund: {
          id: `refund_demo_${Date.now()}`,
          reason,
          status: "Pending",
          created_at: new Date().toISOString()
        }
      });
    }

    const { data, error } = await supabase
      .from("refund_requests")
      .insert({
        reason,
        status: "Pending"
      })
      .select("*")
      .single();

    if (error) {
      console.error("Refund insert failed", error);
      return NextResponse.json({ message: "Could not submit guarantee request." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Guarantee request submitted for admin review.",
      refund: data
    });
  } catch (error) {
    console.error("Refund route failed", error);
    return NextResponse.json({ message: "Could not submit guarantee request." }, { status: 500 });
  }
}
