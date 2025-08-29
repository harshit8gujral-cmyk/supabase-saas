import { supabaseServer } from '@/lib/supabase/server'

export async function getMachines(org_id: string) {
  const sb = supabaseServer()
  return sb.from('machines')
    .select('id,name,line,status,last_service_at')
    .eq('org_id', org_id)
    .order('name')
}

export async function getMachine(org_id: string, id: string) {
  const sb = supabaseServer()
  const machine = await sb.from('machines')
    .select('id,name,line,status,last_service_at')
    .eq('org_id', org_id).eq('id', id).single()
  const logs = await sb.from('machine_status_history')
    .select('ts,status').eq('org_id', org_id).eq('machine_id', id)
    .order('ts', { ascending: false }).limit(200)
  return { machine, logs }
}

export async function getSensorSeries(org_id: string, sensor_id: string, sinceISO: string) {
  const sb = supabaseServer()
  return sb.from('sensor_data')
    .select('ts,value')
    .eq('org_id', org_id).eq('sensor_id', sensor_id)
    .gte('ts', sinceISO).order('ts', { ascending: true }).limit(5000)
}

export async function getInventory(org_id: string) {
  const sb = supabaseServer()
  return sb.from('stock')
    .select('id,sku,name,quantity,location')
    .eq('org_id', org_id).order('sku')
}

export async function getStockMovements(org_id: string, item_id: string) {
  const sb = supabaseServer()
  return sb.from('stock_movements')
    .select('ts,qty_delta,reason')
    .eq('org_id', org_id).eq('item_id', item_id)
    .order('ts', { ascending: false }).limit(200)
}

export async function getMaintenance(org_id: string) {
  const sb = supabaseServer()
  return sb.from('maintenance_tickets')
    .select('id,machine_id,opened_at,closed_at,severity,description')
    .eq('org_id', org_id).order('opened_at', { ascending: false })
}

export async function getAlerts(org_id: string) {
  const sb = supabaseServer()
  return sb.from('alerts')
    .select('id,created_at,level,kind,message')
    .eq('org_id', org_id).order('created_at', { ascending: false }).limit(200)
}
