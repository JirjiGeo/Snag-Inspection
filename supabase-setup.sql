-- Run this once in Supabase Dashboard > SQL Editor.
create table if not exists public.snag_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.snag_workspaces enable row level security;

drop policy if exists "Users can read their own workspace" on public.snag_workspaces;
drop policy if exists "Users can create their own workspace" on public.snag_workspaces;
drop policy if exists "Users can update their own workspace" on public.snag_workspaces;

create policy "Users can read their own workspace"
  on public.snag_workspaces for select
  using (auth.uid() = user_id);

create policy "Users can create their own workspace"
  on public.snag_workspaces for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own workspace"
  on public.snag_workspaces for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

alter table public.snag_workspaces replica identity full;
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'snag_workspaces'
  ) then
    alter publication supabase_realtime add table public.snag_workspaces;
  end if;
end $$;
