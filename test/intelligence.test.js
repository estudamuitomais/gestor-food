import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyCustomer, classifyReview, suggestCustomerMessage } from '../src/domain/customer-insights.js';
import { compareStores, findTransferableStrategies } from '../src/domain/cross-store.js';
import { NotificationCenter } from '../src/domain/notifications.js';

test('classifica clientes sem extrapolar dados privados', () => {
  assert.equal(classifyCustomer({ orderCount: 1 }), 'NOVO');
  assert.equal(classifyCustomer({ orderCount: 3 }), 'RECORRENTE');
  assert.match(suggestCustomerMessage({ classification: 'RECORRENTE', storeName: 'Loja Demo' }), /novamente/);
});

test('classifica avaliação por categoria', () => {
  assert.equal(classifyReview('A comida chegou fria'), 'TEMPERATURA');
  assert.equal(classifyReview('A embalagem veio amassada'), 'EMBALAGEM');
});

test('compara lojas e marca estratégia cruzada como aprovação', () => {
  const ranking = compareStores([{ id: 'a', name: 'A', metrics: { resultWithoutCmvCents: 100n } }, { id: 'b', name: 'B', metrics: { resultWithoutCmvCents: 200n } }]);
  assert.equal(ranking[0].storeId, 'b');
  const transferable = findTransferableStrategies({ sourceStoreId: 'a', targetStoreId: 'b', strategies: [{ storeId: 'a', result: 'EFFECTIVE', name: 'Combo' }] });
  assert.equal(transferable[0].classification, 'REQUER APROVAÇÃO');
});

test('central interna controla notificações sem serviço pago', () => {
  const center = new NotificationCenter();
  const item = center.publish({ type: 'ALERT', title: 'Meta em risco', body: 'Verifique a loja.' });
  assert.equal(center.unread().length, 1);
  center.markRead(item.id);
  assert.equal(center.unread().length, 0);
});
