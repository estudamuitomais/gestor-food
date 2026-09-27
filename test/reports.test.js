import test from 'node:test';
import assert from 'node:assert/strict';
import { productsToCsv, dailyExecutiveSummary } from '../src/domain/reports.js';

test('exporta produtos em CSV brasileiro com critério de rateio', () => {
  const csv = productsToCsv([{ name: 'Parmegiana', category: 'Pratos', quantity: 2, grossCents: 3990, resultCents: 2794, allocationMethod: 'RATEIO' }]);
  assert.match(csv, /"Produto";"Categoria"/);
  assert.match(csv, /R\$\s*39,90/);
  assert.match(csv, /RATEIO/);
});

test('resumo diário destaca lojas em risco e aprovações pendentes', () => {
  const summary = dailyExecutiveSummary({ company: { name: 'Demo' }, stores: [{ id: 's1', name: 'Loja 1', status: 'RECUPERAÇÃO' }], consolidated: { orders: 4, resultWithoutCmvCents: 1000 }, alerts: [{}], approvals: [{ status: 'PENDING' }] });
  assert.equal(summary.storesAtRisk.length, 1);
  assert.equal(summary.pendingApprovals, 1);
  assert.match(summary.disclaimer, /CMV/);
});
