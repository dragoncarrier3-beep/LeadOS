-- LeadOS / Replik MVP — four core tables, RLS, auth profile sync
-- Run in Supabase SQL Editor or via supabase db push

-- ---------------------------------------------------------------------------
-- dealers
-- ---------------------------------------------------------------------------
create table if not exists public.dealers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  province text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- users (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  dealer_id uuid not null references public.dealers (id) on delete restrict,
  name text not null default '',
  email text not null default '',
  phone text not null default '',
  role text not null default 'salesperson'
    check (role in ('salesperson', 'manager', 'client')),
  stripe_customer_id text,
  subscription_status text not null default 'trial'
    check (subscription_status in ('active', 'trial', 'inactive')),
  speed_score integer not null default 0 check (speed_score >= 0 and speed_score <= 100),
  created_at timestamptz not null default now()
);

create index if not exists users_dealer_id_idx on public.users (dealer_id);

-- ---------------------------------------------------------------------------
-- leads
-- ---------------------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers (id) on delete cascade,
  salesperson_id uuid not null references public.users (id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null default '',
  vehicle text not null default '',
  source text not null default 'website',
  status text not null default 'new'
    check (status in ('new', 'contacted', 'appointment', 'fi', 'sold', 'lost')),
  heat text not null default 'cold'
    check (heat in ('hot', 'warm', 'cold', 'credit')),
  score integer not null default 0 check (score >= 0 and score <= 100),
  notes text not null default '',
  received_at timestamptz not null default now(),
  first_response_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_salesperson_id_idx on public.leads (salesperson_id);
create index if not exists leads_dealer_id_idx on public.leads (dealer_id);
create index if not exists leads_received_at_idx on public.leads (received_at desc);

-- ---------------------------------------------------------------------------
-- client_portals
-- ---------------------------------------------------------------------------
create table if not exists public.client_portals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id) on delete cascade,
  salesperson_id uuid not null references public.users (id) on delete cascade,
  vehicle text not null default '',
  loan_amount numeric(12, 2),
  interest_rate numeric(6, 3),
  term_months integer,
  start_date date,
  months_paid integer not null default 0,
  stripe_subscription_id text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists client_portals_lead_id_idx on public.client_portals (lead_id);
create index if not exists client_portals_salesperson_id_idx on public.client_portals (salesperson_id);

-- ---------------------------------------------------------------------------
-- Seed dealer (Phase 1 default for new signups)
-- ---------------------------------------------------------------------------
insert into public.dealers (id, name, city, province)
values (
  '00000000-0000-4000-8000-000000000001',
  'Dev Dealer',
  'Montreal',
  'QC'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- New auth user → public.users row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_dealer uuid := '00000000-0000-4000-8000-000000000001';
  display_name text;
begin
  display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1)
  );
  insert into public.users (id, dealer_id, name, email, phone, role, subscription_status, speed_score)
  values (
    new.id,
    default_dealer,
    display_name,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'salesperson',
    'trial',
    0
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.dealers enable row level security;
alter table public.users enable row level security;
alter table public.leads enable row level security;
alter table public.client_portals enable row level security;

-- Dealers: salesperson sees their own dealer row
drop policy if exists dealers_select_own on public.dealers;
create policy dealers_select_own
  on public.dealers for select
  using (
    id in (select u.dealer_id from public.users u where u.id = auth.uid())
  );

-- users: own row only
drop policy if exists users_select_own on public.users;
create policy users_select_own
  on public.users for select
  using (id = auth.uid());

drop policy if exists users_update_own on public.users;
create policy users_update_own
  on public.users for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- leads: own leads only
drop policy if exists leads_select_own on public.leads;
create policy leads_select_own
  on public.leads for select
  using (salesperson_id = auth.uid());

drop policy if exists leads_insert_own on public.leads;
create policy leads_insert_own
  on public.leads for insert
  with check (salesperson_id = auth.uid());

drop policy if exists leads_update_own on public.leads;
create policy leads_update_own
  on public.leads for update
  using (salesperson_id = auth.uid())
  with check (salesperson_id = auth.uid());

drop policy if exists leads_delete_own on public.leads;
create policy leads_delete_own
  on public.leads for delete
  using (salesperson_id = auth.uid());

-- client_portals: own rows
drop policy if exists client_portals_select_own on public.client_portals;
create policy client_portals_select_own
  on public.client_portals for select
  using (salesperson_id = auth.uid());

drop policy if exists client_portals_insert_own on public.client_portals;
create policy client_portals_insert_own
  on public.client_portals for insert
  with check (salesperson_id = auth.uid());

drop policy if exists client_portals_update_own on public.client_portals;
create policy client_portals_update_own
  on public.client_portals for update
  using (salesperson_id = auth.uid())
  with check (salesperson_id = auth.uid());

drop policy if exists client_portals_delete_own on public.client_portals;
create policy client_portals_delete_own
  on public.client_portals for delete
  using (salesperson_id = auth.uid());
