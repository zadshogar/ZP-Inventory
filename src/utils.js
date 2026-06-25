export function today() { return new Date().toISOString().slice(0, 10); }

export function uid() { return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6); }

export function getStatus(part) {
  if (part.qty <= (part.criticalLevel || 0)) return 'critical';
  if (part.qty <= (part.lowLevel      || 0)) return 'low';
  return 'ok';
}
