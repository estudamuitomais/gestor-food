export class NotificationCenter {
  constructor() { this.items = []; }
  publish({ type, title, body, storeId, severity = 'info' }) {
    const item = { id: `notification-${this.items.length + 1}`, type, title, body, storeId, severity, read: false, createdAt: new Date().toISOString() };
    this.items.unshift(item);
    return item;
  }
  markRead(id) { const item = this.items.find(row => row.id === id); if (!item) throw new Error('Notificação não encontrada.'); item.read = true; return item; }
  unread() { return this.items.filter(item => !item.read); }
}
