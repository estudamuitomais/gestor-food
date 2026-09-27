export const APPROVAL_STATUS = Object.freeze({ PENDING: 'PENDING', APPROVED: 'APPROVED', REJECTED: 'REJECTED', ALTERED: 'ALTERED' });

export class ApprovalInbox {
  constructor({ audit = () => {}, persistence = null } = {}) { this.items = new Map(); this.audit = audit; this.persistence = persistence; }
  get(id) { return this.items.get(id); }
  async hydrate() {
    if (!this.persistence?.load) return 0;
    const items = await this.persistence.load();
    for (const item of items) this.items.set(item.id, item);
    return items.length;
  }
  create(input) {
    const item = { id: input.id ?? `approval-${this.items.size + 1}`, status: APPROVAL_STATUS.PENDING, createdAt: new Date().toISOString(), ...input };
    this.items.set(item.id, item);
    void this.persistence?.save?.(item).catch?.(() => {});
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
    void this.persistence?.save?.(updated).catch?.(() => {});
    this.audit({ action: `APPROVAL_${status}`, entityId: id, actor, metadata: { note } });
    return updated;
  }
  list(status) { return [...this.items.values()].filter(item => !status || item.status === status); }
}
