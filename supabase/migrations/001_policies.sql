-- Enable RLS
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table machines enable row level security;
alter table sensors enable row level security;
alter table sensor_readings enable row level security;
alter table status_logs enable row level security;
alter table inventory_items enable row level security;
alter table stock_movements enable row level security;
alter table maintenance_tickets enable row level security;
alter table alerts enable row level security;

-- Profiles: user can see own profile; org admins can see all in org
create policy "profiles self select"
  on profiles for select
  using (id = auth.uid());

create policy "profiles org admin select"
  on profiles for select
  using (org_id = auth_current_org());

-- Organizations: readable by members of the org
create policy "org read"
  on organizations for select
  using (id = auth_current_org());

-- Generic read policies by org_id
create policy "machines read"
  on machines for select
  using (org_id = auth_current_org());

create policy "sensors read"
  on sensors for select
  using (org_id = auth_current_org());

create policy "sensor_readings read"
  on sensor_readings for select
  using (org_id = auth_current_org());

create policy "status_logs read"
  on status_logs for select
  using (org_id = auth_current_org());

create policy "inventory read"
  on inventory_items for select
  using (org_id = auth_current_org());

create policy "stock_movements read"
  on stock_movements for select
  using (org_id = auth_current_org());

create policy "maintenance read"
  on maintenance_tickets for select
  using (org_id = auth_current_org());

create policy "alerts read"
  on alerts for select
  using (org_id = auth_current_org());

-- Writes: restrict to same org (member/admin); viewers read-only
-- Helper: role check from profiles
create or replace function auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid()
$$;

-- Allow insert/update/delete when same org and role != 'viewer'
create policy "machines cud"
  on machines for all
  using (org_id = auth_current_org() and auth_role() <> 'viewer')
  with check (org_id = auth_current_org());

create policy "sensors cud"
  on sensors for all
  using (org_id = auth_current_org() and auth_role() <> 'viewer')
  with check (org_id = auth_current_org());

create policy "sensor_readings insert"
  on sensor_readings for insert
  with check (org_id = auth_current_org());

create policy "status_logs insert"
  on status_logs for insert
  with check (org_id = auth_current_org());

create policy "inventory cud"
  on inventory_items for all
  using (org_id = auth_current_org() and auth_role() <> 'viewer')
  with check (org_id = auth_current_org());

create policy "stock_movements insert"
  on stock_movements for insert
  with check (org_id = auth_current_org());

create policy "maintenance cud"
  on maintenance_tickets for all
  using (org_id = auth_current_org() and auth_role() <> 'viewer')
  with check (org_id = auth_current_org());

create policy "alerts insert"
  on alerts for insert
  with check (org_id = auth_current_org());
