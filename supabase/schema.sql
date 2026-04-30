create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.hair_analysis (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  input jsonb not null,
  stage text not null check (stage in ('early', 'moderate', 'advanced', 'diffuse')),
  risk_score integer not null check (risk_score between 0 and 100),
  ai_summary text not null,
  treatment_plan jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.chatbot_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  session_id text not null,
  user_message text not null,
  assistant_message text not null,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  plan_type text not null check (plan_type in ('one_time', 'subscription')),
  amount numeric(10, 2) not null,
  status text not null default 'Processing' check (status in ('Processing', 'Shipped', 'Delivered')),
  razorpay_order_id text,
  razorpay_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  plan_type text not null default 'monthly',
  status text not null default 'Active' check (status in ('Active', 'Paused', 'Cancelled', 'Past Due')),
  amount numeric(10, 2) not null,
  razorpay_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  milestone text not null check (milestone in ('before', 'day_30', 'day_60', 'day_90')),
  image_url text not null,
  notes text,
  density_score integer check (density_score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  reason text not null,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  admin_notes text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hair_analysis_user_created_idx on public.hair_analysis(user_id, created_at desc);
create index if not exists chatbot_logs_session_created_idx on public.chatbot_logs(session_id, created_at desc);
create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);
create index if not exists progress_user_milestone_idx on public.progress_photos(user_id, milestone);
create index if not exists refund_status_created_idx on public.refund_requests(status, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

drop trigger if exists refund_requests_set_updated_at on public.refund_requests;
create trigger refund_requests_set_updated_at
before update on public.refund_requests
for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.hair_analysis enable row level security;
alter table public.chatbot_logs enable row level security;
alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;
alter table public.progress_photos enable row level security;
alter table public.refund_requests enable row level security;

create policy "Users can read their profile"
on public.users for select
using (auth.uid() = auth_user_id);

create policy "Users can update their profile"
on public.users for update
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

create policy "Users can read their analyses"
on public.hair_analysis for select
using (
  user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Users can read their orders"
on public.orders for select
using (
  user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Users can read their subscriptions"
on public.subscriptions for select
using (
  user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Users can manage their progress photos"
on public.progress_photos for all
using (
  user_id in (select id from public.users where auth_user_id = auth.uid())
)
with check (
  user_id in (select id from public.users where auth_user_id = auth.uid())
);

create policy "Users can manage their refund requests"
on public.refund_requests for all
using (
  user_id in (select id from public.users where auth_user_id = auth.uid())
)
with check (
  user_id in (select id from public.users where auth_user_id = auth.uid())
);

insert into storage.buckets (id, name, public)
values ('progress-photos', 'progress-photos', true)
on conflict (id) do nothing;
