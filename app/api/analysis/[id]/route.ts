import { NextResponse } from "next/server";
import { demoAnalysis } from "@/lib/recommendations";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { AnalysisInput } from "@/lib/types";

const fallbackInput: AnalysisInput = {
  age: 31,
  gender: "male",
  stage: "moderate",
  duration: "1_3_years",
  familyHistory: true,
  lifestyle: ["stress", "sleep"],
  goals: ["regrow_density", "protect_hairline"]
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fallback = demoAnalysis(fallbackInput);

  if (id.startsWith("demo") || id.startsWith("offline")) {
    return NextResponse.json({ analysis: { ...fallback, id } });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ analysis: { ...fallback, id }, mode: "demo" });
  }

  const { data, error } = await supabase
    .from("hair_analysis")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ analysis: { ...fallback, id }, mode: "demo" });
  }

  return NextResponse.json({ analysis: data, mode: "database" });
}
