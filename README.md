# AI Hair Recovery Platform

A startup-grade full-stack MVP for an AI-powered hair recovery kit business. It includes a high-conversion landing page, guided AI hair analysis, Gemini-powered assistant, product checkout, subscriptions, progress tracking, a 90-day guarantee workflow, and an admin panel.

## Stack

- Next.js App Router
- Tailwind CSS
- Framer Motion
- Supabase Auth, Database, and Storage
- Gemini API for assistant and analysis summaries
- Razorpay Orders and Subscriptions APIs

## Quick Start

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and add keys for Supabase, Gemini, and Razorpay. The app runs in demo mode without keys so the UX can be tested locally.

## Supabase Setup

Run `supabase/schema.sql` in your Supabase SQL editor. Create a private storage bucket named `progress-photos` or set `SUPABASE_PROGRESS_BUCKET` to your bucket name.

## Important Routes

- `/` landing page and AI assistant
- `/analysis` multi-step hair analysis
- `/results/demo` AI result page
- `/product` hair recovery kit checkout
- `/auth` email/password auth
- `/dashboard` user dashboard and progress uploads
- `/admin` admin operations view

## Safety Positioning

The AI prompts and UI explicitly avoid medical diagnosis, guaranteed outcomes, or prescription claims. Recommendations are framed as general wellness guidance and should be reviewed by licensed clinicians where medication is involved.
