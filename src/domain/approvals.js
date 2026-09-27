export const APPROVAL_STATUS = Object.freeze({ PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED', ALTERED: 'ALTERED' });

export class ApprovalInbox {
  constructor({ audit = () => {} } = {}) { this.items = new Map(); this.audit = audit; }
  create(input) {
    const item = { id: input.id ?? `approval-${this.items.size + 1}`, status: APPROVAL_STATUS.PENDING, createdAt: new Date().toISOString(), ...input };
    this.items.set(item.id, item);
    this.audit({ action: 'APPROVAL_CREATED', entityId: item.id });
    return item;
  }
  decide(id, { status, actor, note = '' }) {
    if (![APPROVAL_STATUS.APPROVED, APPROVAL_STATUS.REJECTED, APPROVAL_STATUS.ALTERED].includes(status)) throw new Error('Decisão de aprovação inválida.');
    const item = this.items.get(id);
    if (!item) throw new Error('Aprovação não encontrada.');
    if (item.status !== APPROVAL_STATUS.PENDING) throw new Error('Aprovação já decidida.');
    const updated = { ...item, status, decidedBy: actor, decidedAt: new Date().toISOString(), note };
    this.items.set(id, updated);
    this.audit({ action: `APPROVAL_${status}`, entityId: id, actor, metadata: { note } });
    return updated;
  }
  list(status) { return [...this.items.values()].filter(item => !status || item.status === status); }
}
