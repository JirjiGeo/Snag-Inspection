create extension if not exists pgcrypto;

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  department text not null,
  designation text not null,
  joining_date date,
  reporting_to text,
  job_description_name text,
  job_description_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evaluations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  evaluation_date date not null default current_date,
  score numeric(5,2) not null check (score >= 0 and score <= 100),
  previous_score numeric(5,2) check (previous_score >= 0 and previous_score <= 100),
  ratings jsonb not null default '[]'::jsonb,
  employee_area_of_development text,
  employee_improvement text,
  employee_strength text,
  direct_manager_comments text,
  evaluator_comment text,
  employee_signature text,
  manager_signature text,
  evaluator_signature text,
  created_at timestamptz not null default now()
);

create index if not exists evaluations_employee_id_idx on public.evaluations(employee_id);
create index if not exists evaluations_date_idx on public.evaluations(evaluation_date desc);

alter table public.employees enable row level security;
alter table public.evaluations enable row level security;

create policy "Authenticated users can read employees"
  on public.employees for select to authenticated using (true);
create policy "Authenticated users can insert employees"
  on public.employees for insert to authenticated with check (true);
create policy "Authenticated users can update employees"
  on public.employees for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete employees"
  on public.employees for delete to authenticated using (true);

create policy "Authenticated users can read evaluations"
  on public.evaluations for select to authenticated using (true);
create policy "Authenticated users can insert evaluations"
  on public.evaluations for insert to authenticated with check (true);
create policy "Authenticated users can update evaluations"
  on public.evaluations for update to authenticated using (true) with check (true);
create policy "Authenticated users can delete evaluations"
  on public.evaluations for delete to authenticated using (true);
