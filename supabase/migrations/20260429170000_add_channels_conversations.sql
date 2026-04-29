-- Phase 1 (added): Channel connector scaffolding + conversation-first schema

-- ---------------------------------------------------------------------------
-- Utility: updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- channel_accounts (per salesperson; stores tokens/metadata)
-- ---------------------------------------------------------------------------
create table if not exists public.channel_accounts (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers (id) on delete cascade,
  salesperson_id uuid not null references public.users (id) on delete cascade,
  provider text not null
    check (provider in ('sms', 'facebook', 'kijiji', 'email', 'whatsapp', 'other')),
  status text not null default 'disconnected'
    check (status in ('connected', 'disconnected', 'error')),
  external_account_id text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists channel_accounts_salesperson_id_idx
  on public.channel_accounts (salesperson_id);
create index if not exists channel_accounts_dealer_id_idx
  on public.channel_accounts (dealer_id);
create index if not exists channel_accounts_provider_idx
  on public.channel_accounts (provider);

drop trigger if exists set_channel_accounts_updated_at on public.channel_accounts;
create trigger set_channel_accounts_updated_at
  before update on public.channel_accounts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- conversations (unified inbox thread)
-- ---------------------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers (id) on delete cascade,
  salesperson_id uuid not null references public.users (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  channel_account_id uuid references public.channel_accounts (id) on delete set null,
  external_thread_id text,
  title text not null default '',
  last_message_at timestamptz,
  unread_count integer not null default 0 check (unread_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel_account_id, external_thread_id)
);

create index if not exists conversations_salesperson_last_message_idx
  on public.conversations (salesperson_id, last_message_at desc nulls last);
create index if not exists conversations_lead_id_idx
  on public.conversations (lead_id);
create index if not exists conversations_channel_account_id_idx
  on public.conversations (channel_account_id);

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- messages (individual inbound/outbound messages)
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers (id) on delete cascade,
  salesperson_id uuid not null references public.users (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  external_message_id text,
  direction text not null check (direction in ('inbound', 'outbound')),
  body text not null default '',
  sent_at timestamptz,
  status text not null default 'sent'
    check (status in ('queued', 'sent', 'delivered', 'read', 'failed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (conversation_id, external_message_id)
);

create index if not exists messages_conversation_sent_at_idx
  on public.messages (conversation_id, sent_at desc nulls last, created_at desc);
create index if not exists messages_salesperson_id_idx
  on public.messages (salesperson_id);

-- ---------------------------------------------------------------------------
-- Link leads <-> conversations (optional; keeps current lead-first UX working)
-- ---------------------------------------------------------------------------
alter table public.leads
  add column if not exists conversation_id uuid references public.conversations (id) on delete set null;

create index if not exists leads_conversation_id_idx on public.leads (conversation_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (mirror your existing "salesperson owns rows" model)
-- ---------------------------------------------------------------------------
alter table public.channel_accounts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- channel_accounts: own rows only
drop policy if exists channel_accounts_select_own on public.channel_accounts;
create policy channel_accounts_select_own
  on public.channel_accounts for select
  using (salesperson_id = auth.uid());

drop policy if exists channel_accounts_insert_own on public.channel_accounts;
create policy channel_accounts_insert_own
  on public.channel_accounts for insert
  with check (salesperson_id = auth.uid());

drop policy if exists channel_accounts_update_own on public.channel_accounts;
create policy channel_accounts_update_own
  on public.channel_accounts for update
  using (salesperson_id = auth.uid())
  with check (salesperson_id = auth.uid());

drop policy if exists channel_accounts_delete_own on public.channel_accounts;
create policy channel_accounts_delete_own
  on public.channel_accounts for delete
  using (salesperson_id = auth.uid());

-- conversations: own rows only
drop policy if exists conversations_select_own on public.conversations;
create policy conversations_select_own
  on public.conversations for select
  using (salesperson_id = auth.uid());

drop policy if exists conversations_insert_own on public.conversations;
create policy conversations_insert_own
  on public.conversations for insert
  with check (salesperson_id = auth.uid());

drop policy if exists conversations_update_own on public.conversations;
create policy conversations_update_own
  on public.conversations for update
  using (salesperson_id = auth.uid())
  with check (salesperson_id = auth.uid());

drop policy if exists conversations_delete_own on public.conversations;
create policy conversations_delete_own
  on public.conversations for delete
  using (salesperson_id = auth.uid());

-- messages: own rows only
drop policy if exists messages_select_own on public.messages;
create policy messages_select_own
  on public.messages for select
  using (salesperson_id = auth.uid());

drop policy if exists messages_insert_own on public.messages;
create policy messages_insert_own
  on public.messages for insert
  with check (salesperson_id = auth.uid());

drop policy if exists messages_update_own on public.messages;
create policy messages_update_own
  on public.messages for update
  using (salesperson_id = auth.uid())
  with check (salesperson_id = auth.uid());

drop policy if exists messages_delete_own on public.messages;
create policy messages_delete_own
  on public.messages for delete
  using (salesperson_id = auth.uid());

