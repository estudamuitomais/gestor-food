const entries = [];

export function recordAudit({ action, actor = 'system', entity, entityId, metadata = {} }) {
  const entry = { id: `audit-${entries.length + 1}`, createdAt: new Date().toISOString(), action, actor, entity, entityId, metadata };
  entries.push(entry);
  return entry;
}

export function listAudit() { return [...entries]; }
