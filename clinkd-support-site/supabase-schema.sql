create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  message text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.tickets enable row level security;

drop policy if exists "Anyone can submit tickets" on public.tickets;
create policy "Anyone can submit tickets"
on public.tickets
for insert
to anon
with check (
  length(email) <= 320
  and length(message) <= 5000
);

drop policy if exists "Admins can read tickets" on public.tickets;
create policy "Admins can read tickets"
on public.tickets
for select
to authenticated
using (true);

drop policy if exists "Admins can update tickets" on public.tickets;
create policy "Admins can update tickets"
on public.tickets
for update
to authenticated
using (true)
with check (true);
