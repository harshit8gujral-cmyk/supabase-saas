-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Organizations
create table if not exists organizations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

-- Profiles (1:1 with auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  org_id uuid not null references organizations(id) on delete cascade,
  role text not null check (role in ('org_admin','org_member','viewer')),
  created_at timestamptz not null default now()
);

-- Machines
create table if not exists machines (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  line text,
  status text not null default 'idle' check (status in ('running','idle','down')),
  last_service_at timestamptz
);

-- Sensors
create table if not exists sensors (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  machine_id uuid not null references machines(id) on delete cascade,
  type text not null,
  unit text not null
);

-- Sensor readings (time-series)
create table if not exists sensor_readings (
  id bigserial primary key,
  org_id uuid not null references organizations(id) on delete cascade,
  sensor_id uuid not null references sensors(id) on delete cascade,
  ts timestamptz not null,
  value double precision not null
);
create index if not exists idx_sensor_readings_sensor_ts on sensor_readings(sensor_id, ts desc);
create index if not exists idx_sensor_readings_org_ts on sensor_readings(org_id, ts desc);

-- Machine status logs
create table if not exists status_logs (
  id bigserial primary key,
  org_id uuid not null references organizations(id) on delete cascade,
  machine_id uuid not null references machines(id) on delete cascade,
  ts timestamptz not null default now(),
  status text not null check (status in ('running','idle','down'))
);
create index if not exists idx_status_logs_machine_ts on status_logs(machine_id, ts desc);

-- Inventory
create table if not exists inventory_items (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  sku text not null,
  name text not null,
  quantity integer not null default 0,
  location text
);
create unique index if not exists uniq_inventory_org_sku on inventory_items(org_id, sku);

-- Stock movements
create table if not exists stock_movements (
  id bigserial primary key,
  org_id uuid not null references organizations(id) on delete cascade,
  item_id uuid not null references inventory_items(id) on delete cascade,
  ts timestamptz not null default now(),
  qty_delta integer not null,
  reason text not null
);
create index if not exists idx_stock_movements_item_ts on stock_movements(item_id, ts desc);

-- Maintenance tickets
create table if not exists maintenance_tickets (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  machine_id uuid not null references machines(id) on delete cascade,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  severity text not null check (severity in ('low','med','high')),
  description text not null
);
create index if not exists idx_maint_org_opened on maintenance_tickets(org_id, opened_at desc);

-- Alerts
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  level text not null check (level in ('info','warn','crit')),
  kind text not null check (kind in ('anomaly','downtime')),
  message text not null,
  meta jsonb
);
create index if not exists idx_alerts_org_created on alerts(org_id, created_at desc);

-- Helper: current user's org
create or replace function auth_current_org()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.org_id
  from profiles p
  where p.id = auth.uid()
$$;

-- Bootstrap new users: create org + profile on first sign-up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  new_org uuid;
begin
  insert into organizations(name) values ('org-' || left(new.id::text, 8)) returning id into new_org;
  insert into profiles(id, email, org_id, role) values (new.id, new.email, new_org, 'org_admin');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Realtime publication (alerts table)
alter publication supabase_realtime add table alerts;
