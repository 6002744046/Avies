"use client";

import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  ClipboardCheck,
  LineChart,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TimerReset,
  Users,
  WandSparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, SectionHeading } from "@/components/ui/card";
import { MainNav } from "@/components/ui/nav";
import type { AuthUser } from "@/lib/auth";

const HairAssistant = dynamic(
  () => import("@/components/ai/hair-assistant").then((mod) => mod.HairAssistant),
  {
    ssr: false
  }
);

const steps = [
  {
    title: "Scan your pattern",
    copy: "Answer structured questions and select your hair loss stage.",
    icon: Camera
  },
  {
    title: "AI builds the plan",
    copy: "Gemini summarizes likely factors without diagnosing.",
    icon: WandSparkles
  },
  {
    title: "Start the kit",
    copy: "Choose one-time delivery or a monthly recovery plan.",
    icon: PackageCheck
  },
  {
    title: "Track 90 days",
    copy: "Upload before, 30, 60, and 90-day photos for review.",
    icon: LineChart
  }
];

const products = [
  "Topical minoxidil support",
  "Clinician review prompt for finasteride eligibility",
  "0.5 mm derma roller",
  "Scalp care shampoo",
  "Progress photo protocol"
];

const trustMarkers = [
  {
    title: "10,000+ users",
    copy: "Progress journeys structured around baseline, day 30, day 60, and day 90 check-ins.",
    icon: Users
  },
  {
    title: "Dermatologist-backed",
    copy: "Care prompts are designed to support licensed review where medication may be involved.",
    icon: Stethoscope
  },
  {
    title: "Clinically tested ingredients",
    copy: "Routines can include evidence-led staples such as minoxidil support and scalp care.",
    icon: ShieldCheck
  }
];

const testimonials = [
  {
    name: "Rohan M.",
    role: "Founder, Bengaluru",
    quote:
      "The photo checkpoints kept me honest. The plan felt specific instead of another generic hair kit.",
    score: "Day 90 density +24%"
  },
  {
    name: "Aisha K.",
    role: "Product lead, Mumbai",
    quote:
      "I liked that it did not overpromise. It explained the routine, tracked adherence, and made progress visible.",
    score: "Shedding reduced by day 45"
  },
  {
    name: "Dev S.",
    role: "Engineer, Pune",
    quote:
      "The subscription removed friction. I knew what to do each morning and when to upload photos.",
    score: "92% routine adherence"
  }
];

function HeroScene() {
  const strands = useMemo(
    () =>
      Array.from({ length: 34 }, (_, index) => ({
        left: `${50 + ((index * 37) % 42)}%`,
        top: `${16 + ((index * 23) % 48)}%`,
        rotate: -18 + ((index * 17) % 38),
        height: 42 + ((index * 11) % 58),
        delay: index * 0.05
      })),
    []
  );

  return (
    <div className="hero-scene">
      {strands.map((strand, index) => (
        <motion.span
          key={index}
          className="hair-strand"
          style={{
            left: strand.left,
            top: strand.top,
            height: strand.height,
            rotate: `${strand.rotate}deg`
          }}
          animate={{ y: [0, -8, 0], opacity: [0.34, 0.76, 0.34] }}
          transition={{
            duration: 3.8,
            delay: strand.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
      <div className="absolute bottom-[18%] right-[11%] hidden w-[min(520px,42vw)] md:block">
        <div className="grid grid-cols-4 gap-3">
          {[64, 72, 81, 90].map((value, index) => (
            <motion.div
              key={value}
              initial={{ height: 34 }}
              animate={{ height: 34 + index * 20 }}
              transition={{ duration: 1.2, delay: index * 0.15 }}
              className="rounded-lg border border-white/20 bg-white/10 p-3 backdrop-blur"
            >
              <p className="text-xs text-white/60">Day {index * 30}</p>
              <p className="text-lg font-black text-white">{value}%</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BeforeAfterSlider() {
  const [value, setValue] = useState(52);

  return (
    <div className="mx-auto mt-12 max-w-5xl">
      <div className="relative overflow-hidden rounded-lg border border-ink/10 bg-white shadow-panel">
        <div className="grid min-h-[360px] grid-cols-1 md:grid-cols-2">
          <div className="relative flex items-end overflow-hidden bg-[#dce4e8] p-8 text-ink">
            <div className="absolute inset-x-0 bottom-0 h-48 rounded-t-[48%] bg-[#caa68c]" />
            {Array.from({ length: 34 }).map((_, index) => (
              <span
                key={index}
                className="absolute bottom-28 w-0.5 rounded-full bg-ink/60"
                style={{
                  left: `${10 + ((index * 19) % 80)}%`,
                  height: `${18 + ((index * 7) % 52)}px`,
                  transform: `rotate(${-22 + ((index * 11) % 44)}deg)`
                }}
              />
            ))}
            <div className="relative z-10">
              <p className="text-sm font-bold">Baseline</p>
              <p className="text-3xl font-black">Visible thinning</p>
            </div>
          </div>
          <div className="relative flex items-end overflow-hidden bg-[#e9efe9] p-8 text-ink">
            <div className="absolute inset-x-0 bottom-0 h-48 rounded-t-[48%] bg-[#caa68c]" />
            {Array.from({ length: 72 }).map((_, index) => (
              <span
                key={index}
                className="absolute bottom-28 w-0.5 rounded-full bg-ink/70"
                style={{
                  left: `${8 + ((index * 13) % 84)}%`,
                  height: `${30 + ((index * 9) % 74)}px`,
                  transform: `rotate(${-18 + ((index * 7) % 36)}deg)`
                }}
              />
            ))}
            <div className="relative z-10">
              <p className="text-sm font-bold">Day 90</p>
              <p className="text-3xl font-black">Improved density</p>
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden border-r-2 border-aqua"
          style={{ width: `${value}%` }}
        >
          <div className="h-full w-[calc(100vw-32px)] max-w-5xl" />
        </div>
      </div>
      <input
        aria-label="Before after comparison"
        type="range"
        min="15"
        max="85"
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-5 w-full accent-aqua"
      />
    </div>
  );
}

function Scroll3DShowcase() {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  const rotateX = useTransform(scrollYProgress, [0, 1], [18, -14]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-22, 20]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section ref={ref} className="overflow-hidden bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase text-coral">3D progress path</p>
          <h2 className="mt-3 text-4xl font-black leading-tight md:text-6xl">
            Every scroll maps the 90-day journey
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink/65">
            Analysis, checkout, delivery, photo evidence, and refund eligibility move as one tracked system.
          </p>
        </div>
        <div className="relative min-h-[420px] [perspective:1100px]">
          <motion.div
            style={{ rotateX, rotateY, y }}
            className="absolute inset-6 rounded-[2rem] border border-ink/10 bg-mist p-5 shadow-panel [transform-style:preserve-3d]"
          >
            {[
              ["AI scan", "Density, hairline, scalp visibility"],
              ["Razorpay", "Verified order or subscription"],
              ["Delivery", "Pending, shipped, delivered"],
              ["Day 90", "Guarantee review evidence"]
            ].map(([title, copy], index) => (
              <div
                key={title}
                className="absolute left-6 right-6 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm"
                style={{
                  top: `${8 + index * 21}%`,
                  transform: `translateZ(${index * 44}px) translateX(${index % 2 ? 28 : 0}px)`
                }}
              >
                <p className="text-xs font-bold uppercase text-coral">Step {index + 1}</p>
                <p className="mt-2 text-2xl font-black">{title}</p>
                <p className="mt-2 text-sm leading-6 text-ink/60">{copy}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export function LandingPage({ user }: { user: AuthUser | null }) {
  return (
    <main className="min-h-screen bg-mist pb-24 text-ink md:pb-0">
      <MainNav user={user} />
      <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden px-4 pb-16 pt-28 text-ink sm:px-6 lg:px-8">
        <HeroScene />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-2xl border border-ink/10 bg-white/80 px-3 py-2 text-sm font-semibold text-ink/75 shadow-sm backdrop-blur">
              <Sparkles className="size-4 text-aqua" />
              AI analysis, personalized kits, progress protection
            </div>
            <h1 className="text-5xl font-black leading-[1.02] md:text-7xl">
              Regrow Your Hair in 90 Days or Money Back
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
              AviEx combines AI hair analysis, dermatologist-backed routines, progress tracking,
              and a transparent 90-day refund workflow for users who need trust before checkout.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/analysis" className="min-h-14 rounded-2xl bg-aqua text-base text-ink hover:bg-white">
                Start Hair Analysis <ArrowRight className="size-4" />
              </Button>
              <Button
                href={user ? "/dashboard" : "/signup"}
                variant="ghost"
                className="min-h-14 rounded-2xl bg-white text-base"
              >
                {user ? "Open Dashboard" : "Create Account"}
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="grid max-w-4xl grid-cols-1 gap-3 text-sm sm:grid-cols-3"
          >
            {trustMarkers.map((item) => {
              const Icon = item.icon;

              return (
              <motion.div
                key={item.title}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0 }
                }}
                className="rounded-2xl border border-ink/10 bg-white/85 p-4 shadow-sm backdrop-blur"
              >
                <Icon className="mb-3 size-5 text-coral" />
                <p className="text-xl font-black text-ink">{item.title}</p>
                <p className="mt-2 leading-6 text-ink/60">{item.copy}</p>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <Scroll3DShowcase />

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Before / after"
          title="Transformation tracking that earns trust"
          copy="Standardized progress photos help users understand whether the routine is working and give admins the evidence needed for guarantee reviews."
        />
        <BeforeAfterSlider />
        <div className="mt-10 text-center">
          <Button href="/analysis">
            Get your baseline <Camera className="size-4" />
          </Button>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-white sm:px-6 lg:px-8">
        <SectionHeading
          dark
          eyebrow="How it works"
          title="Four steps from uncertainty to a tracked routine"
          copy="The platform turns answers into a plan, a kit, a subscription, and a measurable 90-day journey."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full">
                  <div className="mb-5 grid size-12 place-items-center rounded-lg bg-aqua/10 text-aqua">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-lg font-black">{step.title}</p>
                  <p className="mt-3 text-sm leading-6 text-white/60">{step.copy}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button href="/analysis" className="bg-aqua text-ink hover:bg-white">
            Start the flow <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Personalized kit"
              title="Everything needed to begin with structure"
              copy="One kit, two purchase paths, and a routine that adapts to analysis answers and progress milestones."
            />
            <div className="mt-8 flex justify-center gap-3 lg:justify-start">
              <Button href="/pricing">Choose a plan</Button>
              <Button href="/results/demo" variant="ghost">
                See sample result
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product, index) => (
              <Card key={product} light className="min-h-32">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-ink text-white">
                    {index + 1}
                  </span>
                  <BadgeCheck className="size-5 text-leaf" />
                </div>
                <p className="font-bold">{product}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trust section"
          title="Health-grade signals at every step"
          copy="Trust markers are embedded into the journey: clinician prompts, clear AI limits, progress evidence, and guarantee review."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-3">
          {[
            { label: "10,000+ users", icon: ClipboardCheck, copy: "Designed for repeated tracking, adherence, and structured progress review." },
            { label: "Dermatologist-backed", icon: Stethoscope, copy: "Medication eligibility is positioned for licensed clinical review." },
            { label: "Clinically tested ingredients", icon: ShieldCheck, copy: "Plans can include evidence-led ingredients and scalp care routines." }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.06 }}
              >
                <Card light className="h-full rounded-2xl">
                  <Icon className="size-7 text-coral" />
                  <p className="mt-5 text-xl font-black">{item.label}</p>
                  <p className="mt-3 text-sm leading-6 text-ink/60">{item.copy}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-10 text-center">
          <Button href="/pricing">Build your kit</Button>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Customer signals"
          title="Progress feels better when it is measurable"
          copy="The dashboard keeps users connected to the routine and gives the team clean operational data."
        />
        <div className="mx-auto mt-12 grid max-w-7xl gap-4 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} light>
              <div className="mb-5 flex gap-1 text-saffron">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm leading-7 text-ink/70">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-6 border-t border-ink/10 pt-4">
                <p className="font-black">{testimonial.name}</p>
                <p className="text-sm text-ink/50">{testimonial.role}</p>
                <p className="mt-3 text-sm font-bold text-leaf">{testimonial.score}</p>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button href="/analysis">Personalize my plan</Button>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase text-aqua">90-day progress guarantee</p>
            <h2 className="mt-4 text-4xl font-black md:text-6xl">
              Follow the plan for 90 days. If there is no visible improvement, request a refund.
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
              Guarantee eligibility requires a before photo plus 30, 60, and 90-day uploads.
              Admins review evidence and approve or reject claims inside the operations panel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/pricing" className="bg-aqua text-ink hover:bg-white">
                Start Treatment <ArrowRight className="size-4" />
              </Button>
              <Button href="/dashboard" variant="secondary">
                Track progress
              </Button>
            </div>
          </div>
          <div className="grid gap-4">
            {[
              ["Before", "Baseline photo secured"],
              ["Day 30", "Adherence and shedding review"],
              ["Day 60", "Density signal comparison"],
              ["Day 90", "Guarantee claim eligibility"]
            ].map(([day, copy]) => (
              <div key={day} className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/10 p-4">
                <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-white text-ink">
                  <TimerReset className="size-5" />
                </span>
                <div>
                  <p className="font-black">{day}</p>
                  <p className="text-sm text-white/60">{copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-mist px-4 py-10 text-center text-sm text-ink/60">
        <p>AviEx provides general hair wellness guidance only. Consult a licensed clinician for medication and diagnosis.</p>
      </footer>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink/10 bg-white/90 p-3 shadow-[0_-16px_40px_rgba(9,17,31,0.12)] backdrop-blur md:hidden">
        <Button href="/analysis" className="min-h-14 w-full rounded-2xl bg-aqua text-base text-ink hover:bg-white">
          Start Hair Analysis <ArrowRight className="size-5" />
        </Button>
      </div>
      <HairAssistant />
    </main>
  );
}
