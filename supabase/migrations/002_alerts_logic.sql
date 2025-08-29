-- Anomaly detection on sensor_readings insert (rolling z-score over last 100)
create or replace function detect_sensor_anomaly()
returns trigger
language plpgsql
security definer
as $$
declare
  mu double precision;
  sigma double precision;
  z double precision;
begin
  select avg(value), stddev_pop(value)
  into mu, sigma
  from (
    select value from sensor_readings
    where sensor_id = new.sensor_id
    order by ts desc
    limit 100
  ) t;

  if sigma is null or sigma = 0 then
    return new;
  end if;

  z := abs((new.value - mu) / sigma);

  if z >= 3 then
    insert into alerts(org_id, level, kind, message, meta)
    values (new.org_id, 'warn', 'anomaly',
            format('Sensor %s value %.3f deviates (z=%.2f)', new.sensor_id, new.value, z),
            jsonb_build_object('sensor_id', new.sensor_id, 'ts', new.ts, 'value', new.value, 'z', z));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_detect_sensor_anomaly on sensor_readings;
create trigger trg_detect_sensor_anomaly
  after insert on sensor_readings
  for each row execute function detect_sensor_anomaly();

-- Downtime alert on status_logs insert when status = 'down'
create or replace function alert_machine_down()
returns trigger
language plpgsql
security definer
as $$
declare mname text;
begin
  if new.status = 'down' then
    select name into mname from machines where id = new.machine_id;
    insert into alerts(org_id, level, kind, message, meta)
    values (new.org_id, 'crit', 'downtime',
            coalesce(mname,'machine') || ' reported DOWN',
            jsonb_build_object('machine_id', new.machine_id, 'ts', new.ts));
  end if;
  return new;
end;
$$;

drop trigger if exists trg_alert_machine_down on status_logs;
create trigger trg_alert_machine_down
  after insert on status_logs
  for each row execute function alert_machine_down();

-- Add tables to Realtime publication
alter publication supabase_realtime add table sensor_readings;
alter publication supabase_realtime add table status_logs;
