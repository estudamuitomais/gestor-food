const entries = [];
let sink = null;

export function recordAudit({ action, actor = 'system', entity, entityId, metadata = {} }) {
  const entry = { id: `audit-${Date.now()}-${entries.length + 1}`, createdAt: new Date().toISOString(), action, actor, entity, entityId, metadata };
  entries.push(entry);
  if (sink) void sink.append(entry).catch(() => {});
  return entry;
}

export function listAudit() { return [...entries]; }

export function configureAuditPersistence(nextSink) { sink = nextSink ?? null; }

export async function hydrateAudit() {
  if (!sink?.load) return 0;
  const persisted = await sink.load();
  const known = new Set(entries.map(entry => entry.id));
  for (const entry of persisted) if (!known.has(entry.id)) entries.push(entry);
  return persisted.length;
}
