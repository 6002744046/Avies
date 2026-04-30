"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, BadgeCheck, BrainCircuit, Camera, ShieldAlert, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { demoAnalysis, formatStage } from "@/lib/recommendations";
import type { AnalysisInput, AnalysisRecord } from "@/lib/types";

const fallbackInput: AnalysisInput = {
  age: 31,
  gender: "male",
  stage: "moderate",
  duration: "1_3_years",
  familyHistory: true,
  lifestyle: ["stress", "sleep"],
  goals: ["regrow_density", "protect_hairline"]
};

const fallback = demoAnalysis(fallbackInput);

function normalize(record: AnalysisRecord | typeof fallback): AnalysisRecord {
  const typedRecord = record as AnalysisRecord;
  const treatmentPlan = typedRecord.treatment_plan || typedRecord.treatmentPlan || fallback.treatment_plan;
  const riskScore = typedRecord.risk_score || typedRecord.riskScore || fallback.risk_score;
  const aiSummary = typedRecord.ai_summary || typedRecord.aiSummary || fallback.ai_summary;
  const createdAt = typedRecord.created_at || typedRecord.createdAt || fallback.created_at;

  return {
    ...record,
    ai_summary: aiSummary,
    created_at: createdAt,
    risk_score: riskScore,
    treatment_plan: treatmentPlan
  };
}

export function ResultView({ id }: { id: string }) {
  const [record, setRecord] = useState<AnalysisRecord>(normalize(fallback));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      try {
        const cached = localStorage.getItem("latestAnalysis");
        if (cached) {
          setRecord(normalize(JSON.parse(cached)));
        }

        const response = await fetch(`/api/analysis/${id}`);
        if (response.status === 401) {
          window.location.assign(`/login?next=/results/${id}`);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          setRecord(normalize(data.analysis));
        }
      } catch {
        const cached = localStorage.getItem("latestAnalysis");
        if (cached) {
          setRecord(normalize(JSON.parse(cached)));
        }
      } finally {
        setLoading(false);
      }
    }

    loadResult();
  }, [id]);

  const riskData = useMemo(
    () => [
      { name: "Risk", value: record.risk_score },
      { name: "Reserve", value: 100 - record.risk_score }
    ],
    [record.risk_score]
  );

  const progressProjection = useMemo(
    () => [
      { day: "0", density: 42 },
      { day: "30", density: 50 },
      { day: "60", density: 61 },
      { day: "90", density: 72 }
    ],
    []
  );
  const aiResult = record.aiResult;
  const imageUrls = record.imageUrls || [];

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-coral">AI result</p>
            <h1 className="mt-3 text-4xl font-black md:text-6xl">Your personalized recovery map</h1>
            <p className="mt-4 max-w-3xl text-ink/60">
              Based on your answers and uploaded image, the platform estimates visible hair signals and builds a structured 90-day plan.
            </p>
          </div>
          <Button href="/pricing">
            Start Treatment <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card light className="relative overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-lg bg-aqua/10 text-aqua">
                <BrainCircuit className="size-5" />
              </span>
              <div>
                <p className="text-sm text-ink/60">Hair loss stage</p>
                <p className="text-2xl font-black">{formatStage(record.stage)}</p>
              </div>
            </div>
            <div className="mt-8 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    innerRadius={70}
                    outerRadius={94}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    <Cell fill="#ff7d64" />
                    <Cell fill="#e8edf3" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-x-0 top-[178px] text-center">
              <p className="text-5xl font-black">{record.risk_score}%</p>
              <p className="text-sm text-ink/50">support priority</p>
            </div>
          </Card>

          <Card light>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-ink/60">Personalized plan</p>
                <h2 className="mt-2 text-3xl font-black">{record.treatment_plan.title}</h2>
              </div>
              <Sparkles className="size-7 text-aqua" />
            </div>
            <p className="mt-5 leading-7 text-ink/70">{record.ai_summary}</p>
            <div className="mt-6 rounded-lg border border-coral/20 bg-coral/10 p-4">
              <div className="flex gap-3">
                <ShieldAlert className="mt-1 size-5 shrink-0 text-coral" />
                <p className="text-sm leading-6 text-ink/70">
                  {aiResult?.disclaimer || record.treatment_plan.disclaimer}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {record.treatment_plan.likelyFactors.slice(0, 4).map((factor) => (
                <div key={factor} className="rounded-lg border border-ink/10 bg-white p-4">
                  <BadgeCheck className="mb-3 size-5 text-leaf" />
                  <p className="text-sm leading-6 text-ink/70">{factor}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card light>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-2xl bg-aqua/10 text-aqua">
                <Camera className="size-5" />
              </span>
              <div>
                <p className="text-sm text-ink/60">Visual insights</p>
                <h2 className="text-2xl font-black">AI image estimate</h2>
              </div>
            </div>
            {imageUrls[0] ? (
              <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl border border-ink/10 bg-white">
                <Image src={imageUrls[0]} alt="Uploaded hair analysis" fill className="object-cover" unoptimized />
              </div>
            ) : null}
          </Card>

          <Card light>
            <h2 className="text-2xl font-black">Structured result</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Hair density", aiResult?.hairDensity || "Estimated after image upload"],
                ["Hair loss stage", aiResult?.hairLossStage || formatStage(record.stage)],
                ["Scalp condition", aiResult?.scalpCondition || "Healthy"],
                ["Scalp visibility", aiResult?.scalpVisibility || "Medium"],
                ["Hairline recession", aiResult?.hairlineRecession || "Moderate"],
                ["Confidence", aiResult ? `${aiResult.confidenceScore}%` : `${record.risk_score}%`]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-ink/10 bg-white p-4">
                  <p className="text-xs font-bold uppercase text-coral">{label}</p>
                  <p className="mt-2 text-xl font-black">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-2xl border border-aqua/20 bg-aqua/10 p-4 text-sm leading-6 text-ink/70">
              {aiResult?.recommendation || record.treatment_plan.title}
            </p>
          </Card>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card light>
            <h2 className="text-2xl font-black">Projected tracking curve</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressProjection}>
                  <defs>
                    <linearGradient id="density" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#44d7c6" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#44d7c6" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e6ebf1" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="density" stroke="#44d7c6" fill="url(#density)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card light>
            <h2 className="text-2xl font-black">Your kit routine</h2>
            <div className="mt-5 space-y-3">
              {record.treatment_plan.routine.map((item) => (
                <div key={item.cadence} className="rounded-lg border border-ink/10 bg-white p-4">
                  <p className="text-sm font-black text-coral">{item.cadence}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/70">{item.action}</p>
                </div>
              ))}
            </div>
            <Button href="/pricing" className="mt-6 w-full">
              Checkout with this plan <ArrowRight className="size-4" />
            </Button>
          </Card>
        </div>
      </div>
      {loading ? <span className="sr-only">Loading result</span> : null}
    </section>
  );
}
