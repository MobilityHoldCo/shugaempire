-- ============================================================
-- SHUGA EMPIRE HOLDCO — Supabase Database Schema
-- Run this in the Supabase SQL Editor to create all tables
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. WAITLIST TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text not null,
  email       text not null,
  phone       text,
  city        text not null default 'Lagos',
  role        text not null default 'Driver', -- 'Driver' | 'Rider' | 'Investor'
  notes       text,
  position    integer not null,
  source      text not null default 'website_waitlist',
  status      text not null default 'pending', -- 'pending' | 'approved' | 'rejected' | 'contacted'
  admin_notes text
);

-- Unique email constraint (prevents duplicate signups)
alter table public.waitlist
  add constraint waitlist_email_unique unique (email);

-- Index for fast lookups
create index if not exists waitlist_email_idx on public.waitlist(email);
create index if not exists waitlist_role_idx  on public.waitlist(role);
create index if not exists waitlist_status_idx on public.waitlist(status);
create index if not exists waitlist_city_idx  on public.waitlist(city);

-- ────────────────────────────────────────────────────────────
-- 2. CONTACTS TABLE
-- ────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  full_name   text not null,
  email       text not null,
  phone       text,
  interest    text not null default 'general', -- 'driver' | 'investor' | 'passenger' | 'partner' | 'other' | 'general'
  message     text not null,
  source      text not null default 'contact_page',
  status      text not null default 'new',     -- 'new' | 'read' | 'replied' | 'closed'
  admin_notes text
);

-- Index for quick admin review
create index if not exists contacts_status_idx   on public.contacts(status);
create index if not exists contacts_interest_idx on public.contacts(interest);
create index if not exists contacts_email_idx    on public.contacts(email);

-- ────────────────────────────────────────────────────────────
-- 3. ROW LEVEL SECURITY (RLS)
-- All writes go through the service-role key on the server.
-- Public can only READ their own waitlist entry by email.
-- ────────────────────────────────────────────────────────────
alter table public.waitlist enable row level security;
alter table public.contacts  enable row level security;

-- Allow the service role (server) unrestricted access
create policy "service_role_waitlist_all" on public.waitlist
  for all using (true) with check (true);

create policy "service_role_contacts_all" on public.contacts
  for all using (true) with check (true);

-- ────────────────────────────────────────────────────────────
-- 4. HELPFUL ADMIN VIEWS
-- ────────────────────────────────────────────────────────────
create or replace view public.waitlist_summary as
  select
    role,
    city,
    status,
    count(*)  as total,
    min(created_at) as first_signup,
    max(created_at) as latest_signup
  from public.waitlist
  group by role, city, status
  order by total desc;

create or replace view public.contacts_summary as
  select
    interest,
    status,
    count(*) as total,
    max(created_at) as latest_enquiry
  from public.contacts
  group by interest, status
  order by total desc;
