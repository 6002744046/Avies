import { NextResponse } from "next/server";
import { generateHairSummary } from "@/lib/gemini";
import { buildTreatmentPlan, demoAnalysis } from "@/lib/recommendations";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { AnalysisInput } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as AnalysisInput;
    const treatmentPlan = buildTreatmentPlan(input);
    const summary = await generateHairSummary(input);
    const fallback = {
      ...demoAnalysis(input),
      ai_summary: summary,
      treatment_plan: treatmentPlan,
      risk_score: treatmentPlan.riskScore
    };

    const supabase = createServerSupabaseClient();
    if (!supabase) {
      return NextResponse.json({ analysis: fallback, mode: "demo" });
    }

    const { data, error } = await supabase
      .from("hair_analysis")
      .insert({
        input,
        stage: input.stage,
        risk_score: treatmentPlan.riskScore,
        ai_summary: summary,
        treatment_plan: treatmentPlan
      })
      .select("*")
      .single();

    if (error) {
      console.error("Supabase analysis insert failed", error);
      return NextResponse.json({ analysis: fallback, mode: "demo" });
    }

    return NextResponse.json({ analysis: data, mode: "database" });
  } catch (error) {
    console.error("Analysis route failed", error);
    return NextResponse.json({ error: "Could not generate analysis" }, { status: 500 });
  }
}
