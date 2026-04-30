"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AnalysisInput, HairStage } from "@/lib/types";

const stageOptions: Array<{
  value: HairStage;
  title: string;
  copy: string;
  density: number;
}> = [
  {
    value: "early",
    title: "Early recession",
    copy: "Temples or hairline beginning to move back.",
    density: 76
  },
  {
    value: "diffuse",
    title: "Diffuse shedding",
    copy: "Overall thinning without a single clear pattern.",
    density: 58
  },
  {
    value: "moderate",
    title: "Moderate thinning",
    copy: "Crown or frontal thinning is consistently visible.",
    density: 43
  },
  {
    value: "advanced",
    title: "Advanced pattern",
    copy: "Large areas of scalp visibility or broad recession.",
    density: 28
  }
];

const lifestyleOptions = [
  "stress",
  "sleep",
  "diet",
  "dandruff",
  "heat_styling",
  "recent_illness"
];

const goals = ["reduce_shedding", "regrow_density", "protect_hairline", "improve_scalp"];

const initialInput: AnalysisInput = {
  age: 29,
  gender: "male",
  stage: "early",
  duration: "6_12_months",
  familyHistory: true,
  lifestyle: ["stress"],
  goals: ["reduce_shedding", "regrow_density"]
};

function StageVisual({ density }: { density: number }) {
  const hairs = Math.round(density / 3);
  return (
    <div className="relative h-28 overflow-hidden rounded-lg bg-[#e6d1bf]">
      <div className="absolute inset-x-0 bottom-0 h-20 rounded-t-[48%] bg-[#c99f82]" />
      {Array.from({ length: hairs }).map((_, index) => (
        <span
          key={index}
          className="absolute bottom-11 w-0.5 rounded-full bg-ink/70"
          style={{
            left: `${8 + ((index * 17) % 84)}%`,
            height: `${16 + ((index * 11) % 58)}px`,
            transform: `rotate(${-20 + ((index * 13) % 40)}deg)`
          }}
        />
      ))}
    </div>
  );
}

export function AnalysisWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<AnalysisInput>(initialInput);
  const [loading, setLoading] = useState(false);
  const totalSteps = 4;

  const progress = useMemo(() => ((step + 1) / totalSteps) * 100, [step]);

  function toggleValue(key: "lifestyle" | "goals", value: string) {
    setInput((current) => {
      const exists = current[key].includes(value);
      return {
        ...current,
        [key]: exists
          ? current[key].filter((item) => item !== value)
          : [...current[key], value]
      };
    });
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });
      const data = await response.json();
      localStorage.setItem("latestAnalysis", JSON.stringify(data.analysis));
      router.push(`/results/${data.analysis.id}`);
    } catch {
      localStorage.setItem(
        "latestAnalysis",
        JSON.stringify({
          id: "offline-demo",
          input,
          stage: input.stage,
          risk_score: 61,
          ai_summary:
            "Your offline demo result suggests a structured 90-day routine with photo tracking and scalp support.",
          treatment_plan: null,
          created_at: new Date().toISOString()
        })
      );
      router.push("/results/offline-demo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-5xl">
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-sm text-white/70">
          <span>Step {step + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-lg bg-white/10">
          <motion.div
            className="h-full bg-aqua"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>
      </div>

      <Card>
        {step === 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-bold text-aqua">Profile</p>
              <h1 className="mt-3 text-3xl font-black md:text-5xl">Start with your baseline</h1>
              <p className="mt-4 text-white/60">
                These answers help the AI estimate stage, priority, and the right treatment cadence.
              </p>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-white/70">Age</span>
                <input
                  type="number"
                  min={16}
                  max={90}
                  value={input.age}
                  onChange={(event) => setInput({ ...input, age: Number(event.target.value) })}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-aqua"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-white/70">Gender</span>
                <select
                  value={input.gender}
                  onChange={(event) =>
                    setInput({ ...input, gender: event.target.value as AnalysisInput["gender"] })
                  }
                  className="mt-2 w-full rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-aqua"
                >
                  <option className="text-ink" value="male">Male</option>
                  <option className="text-ink" value="female">Female</option>
                  <option className="text-ink" value="non_binary">Non-binary</option>
                  <option className="text-ink" value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </label>
              <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/10 p-4">
                <span>
                  <span className="block text-sm font-semibold">Family history</span>
                  <span className="block text-xs text-white/50">Parents, siblings, or close relatives</span>
                </span>
                <input
                  type="checkbox"
                  checked={input.familyHistory}
                  onChange={(event) => setInput({ ...input, familyHistory: event.target.checked })}
                  className="size-5 accent-aqua"
                />
              </label>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <p className="text-sm font-bold text-aqua">Visual stage</p>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">Select the closest pattern</h1>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {stageOptions.map((option) => {
                const active = input.stage === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => setInput({ ...input, stage: option.value })}
                    className={`rounded-lg border p-3 text-left transition ${
                      active
                        ? "border-aqua bg-aqua/10"
                        : "border-white/10 bg-white/10 hover:border-white/30"
                    }`}
                  >
                    <StageVisual density={option.density} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{option.title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/60">{option.copy}</p>
                      </div>
                      {active ? <Check className="size-5 shrink-0 text-aqua" /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-bold text-aqua">Timeline</p>
              <h1 className="mt-3 text-3xl font-black md:text-5xl">How long has it been visible?</h1>
              <p className="mt-4 text-white/60">
                Duration affects urgency, plan intensity, and photo checkpoint expectations.
              </p>
            </div>
            <div className="grid gap-3">
              {[
                ["under_6_months", "Under 6 months"],
                ["6_12_months", "6 to 12 months"],
                ["1_3_years", "1 to 3 years"],
                ["3_plus_years", "3+ years"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    setInput({ ...input, duration: value as AnalysisInput["duration"] })
                  }
                  className={`rounded-lg border p-4 text-left font-semibold transition ${
                    input.duration === value
                      ? "border-aqua bg-aqua/10 text-white"
                      : "border-white/10 bg-white/10 text-white/70 hover:border-white/30"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <p className="text-sm font-bold text-aqua">Lifestyle and goals</p>
            <h1 className="mt-3 text-3xl font-black md:text-5xl">Personalize the routine</h1>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div>
                <p className="mb-3 font-bold">Lifestyle factors</p>
                <div className="grid gap-3">
                  {lifestyleOptions.map((option) => (
                    <label
                      key={option}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-4"
                    >
                      <input
                        type="checkbox"
                        checked={input.lifestyle.includes(option)}
                        onChange={() => toggleValue("lifestyle", option)}
                        className="size-5 accent-aqua"
                      />
                      <span className="capitalize text-white/80">{option.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-3 font-bold">Recovery goals</p>
                <div className="grid gap-3">
                  {goals.map((goal) => (
                    <label
                      key={goal}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/10 p-4"
                    >
                      <input
                        type="checkbox"
                        checked={input.goals.includes(goal)}
                        onChange={() => toggleValue("goals", goal)}
                        className="size-5 accent-aqua"
                      />
                      <span className="capitalize text-white/80">{goal.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled={step === 0 || loading}
            onClick={() => setStep((value) => Math.max(0, value - 1))}
          >
            <ArrowLeft className="size-4" /> Back
          </Button>
          {step < totalSteps - 1 ? (
            <Button
              type="button"
              className="bg-aqua text-ink hover:bg-white"
              onClick={() => setStep((value) => Math.min(totalSteps - 1, value + 1))}
            >
              Continue <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button type="submit" className="bg-aqua text-ink hover:bg-white" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <BrainCircuit className="size-4" />}
              Generate AI Plan
            </Button>
          )}
        </div>
      </Card>
    </form>
  );
}
