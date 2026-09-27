import test from 'node:test';
import assert from 'node:assert/strict';
import { IfoodSyncService, MemoryEventRepository, MemoryOrderRepository } from '../src/integrations/ifood/sync-service.js';

test('processa eventos uma única vez e reconhece somente os processados', async () => {
  const calls = [];
  const client = { pollEvents: async () => ({ events: [{ id: 'evt-1', code: 'PLACED', orderId: 'order-1' }, { id: 'evt-1', code: 'PLACED', orderId: 'order-1' }] }), acknowledgeEvents: async ids => calls.push(ids) };
  const sync = new IfoodSyncService({ client, eventRepository: new MemoryEventRepository(), orderRepository: new MemoryOrderRepository() });
  const result = await sync.syncOnce();
  assert.equal(result.received, 2);
  assert.equal(result.processed, 1);
  assert.deepEqual(calls, [['evt-1']]);
  assert.equal(sync.orders.list().length, 1);
});

test('reconhece cada evento imediatamente após processá-lo', async () => {
  const calls = [];
  const client = { pollEvents: async () => ({ events: [{ id: 'evt-1', code: 'PLACED' }, { id: 'evt-2', code: 'CONFIRMED' }] }), acknowledgeEvents: async ids => calls.push(ids) };
  const sync = new IfoodSyncService({ client });
  await sync.syncOnce();
  assert.deepEqual(calls, [['evt-1'], ['evt-2']]);
});

test('polling exige intervalo mínimo de 30 segundos e pode ser encerrado', () => {
  const sync = new IfoodSyncService({ client: {} });
  assert.throws(() => sync.startPolling({ intervalMs: 29999 }), /mínimo 30 segundos/);
  assert.equal(sync.startPolling({ intervalMs: 30000 }), true);
  assert.equal(sync.startPolling({ intervalMs: 30000 }), false);
  assert.equal(sync.stopPolling(), true);
  assert.equal(sync.stopPolling(), false);
});

test('busca detalhes oficiais para evento de pedido colocado', async () => {
  let fetched = false;
  const client = { pollEvents: async () => ({ events: [{ id: 'evt-2', code: 'PLACED', orderId: 'order-2' }] }), getOrder: async () => { fetched = true; return { id: 'order-2', items: [] }; }, acknowledgeEvents: async () => {} };
  const sync = new IfoodSyncService({ client });
  await sync.syncOnce();
  assert.equal(fetched, true);
  assert.deepEqual(sync.orders.get('order-2').details, { id: 'order-2', items: [] });
});

test('preserva payload original do evento para auditoria', async () => {
  const eventRepository = new MemoryEventRepository();
  const event = { id: 'evt-raw', code: 'CANCELLED', orderId: 'order-raw', metadata: { reason: 'CUSTOMER' } };
  const client = { pollEvents: async () => ({ events: [event] }), acknowledgeEvents: async () => {} };
  await new IfoodSyncService({ client, eventRepository }).syncOnce();
  assert.equal(eventRepository.get('evt-raw').metadata.reason, 'CUSTOMER');
  assert.ok(eventRepository.get('evt-raw').receivedAt);
});

test('ingestão de webhook é idempotente e normaliza pedido', async () => {
  const client = { getOrder: async () => ({ id: 'order-webhook' }) };
  const sync = new IfoodSyncService({ client, eventRepository: new MemoryEventRepository(), orderRepository: new MemoryOrderRepository() });
  const event = { id: 'evt-webhook', code: 'PLACED', orderId: 'order-webhook' };
  assert.deepEqual(await sync.ingestEvent(event), { processed: true, duplicate: false });
  assert.deepEqual(await sync.ingestEvent(event), { processed: false, duplicate: true });
  assert.equal(sync.events.list().length, 1);
  assert.equal(sync.orders.get('order-webhook').status, 'PLACED');
});

test('ingestão concorrente reserva o evento antes do processamento', async () => {
  let resolveDetails;
  const detailsReady = new Promise(resolve => { resolveDetails = resolve; });
  const client = { getOrder: async () => detailsReady.then(() => ({ id: 'order-concurrent' })) };
  const sync = new IfoodSyncService({ client });
  const event = { id: 'evt-concurrent', code: 'PLACED', orderId: 'order-concurrent' };
  const first = sync.ingestEvent(event);
  await Promise.resolve();
  const second = await sync.ingestEvent(event);
  assert.deepEqual(second, { processed: false, duplicate: true });
  resolveDetails();
  assert.deepEqual(await first, { processed: true, duplicate: false });
});

test('reconcilia eventos e pedidos normalizados', () => {
  const sync = new IfoodSyncService({ client: {} });
  sync.events.add({ id: 'evt-1', orderId: 'order-1' });
  sync.orders.upsert({ externalId: 'order-1' });
  sync.orders.upsert({ externalId: 'order-sem-evento' });
  const result = sync.reconcile();
  assert.deepEqual(result.eventsWithoutOrder, []);
  assert.deepEqual(result.ordersWithoutEvent, ['order-sem-evento']);
});
