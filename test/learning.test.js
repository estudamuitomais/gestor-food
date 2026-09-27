import test from 'node:test';
import assert from 'node:assert/strict';
import { ApprovalInbox, APPROVAL_STATUS } from '../src/domain/approvals.js';
import { CommercialMemory, ExperimentRegistry } from '../src/domain/learning.js';

test('aprovação registra decisão e impede segunda decisão', () => {
  const inbox = new ApprovalInbox();
  inbox.create({ id: 'a1', title: 'Testar estratégia' });
  const result = inbox.decide('a1', { status: APPROVAL_STATUS.APPROVED, actor: 'admin' });
  assert.equal(result.status, 'APPROVED');
  assert.throws(() => inbox.decide('a1', { status: APPROVAL_STATUS.REJECTED, actor: 'admin' }), /já decidida/);
});

test('memória prioriza estratégia eficaz', () => {
  const memory = new CommercialMemory();
  memory.record({ storeId: 's1', context: 'jantar-fraco', name: 'Combo', result: 'INEFFECTIVE', confidence: 0.9 });
  memory.record({ storeId: 's1', context: 'jantar-fraco', name: 'Destaque', result: 'EFFECTIVE', confidence: 0.7 });
  assert.equal(memory.rank({ storeId: 's1', context: 'jantar-fraco' })[0].name, 'Destaque');
});

test('experimento com amostra pequena não declara causalidade', () => {
  const experiments = new ExperimentRegistry();
  experiments.create({ id: 'e1', hypothesis: 'Combo aumenta resultado', variantA: 'Original', variantB: 'Combo' });
  const result = experiments.conclude('e1', { sampleA: 8, sampleB: 12, conclusion: 'B venceu', confidence: 'ALTA' });
  assert.equal(result.conclusion, 'INCONCLUSIVO — amostra pequena');
  assert.equal(result.confidence, 'BAIXA');
});
