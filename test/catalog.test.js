import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeCatalog, calculateMaximumDiscount, classifyProduct } from '../src/domain/catalog.js';

test('desconto máximo preserva resultado mínimo configurado', () => {
  assert.equal(calculateMaximumDiscount({ priceCents: 10000, minimumMarginPercent: 20, fixedCostsCents: 3000 }), 5000n);
  assert.equal(calculateMaximumDiscount({ priceCents: 1000, minimumMarginPercent: 50, fixedCostsCents: 600 }), 0n);
});

test('classifica produto por demanda e resultado', () => {
  assert.equal(classifyProduct({ quantity: 10, resultCents: 1000n, averageQuantity: 10, averageResult: 1000n }), 'ALTO RESULTADO + ALTA DEMANDA');
});

test('analisa catálogo sem ocultar o critério', () => {
  const result = analyzeCatalog([{ id: 'p1', quantity: 10, resultCents: 1000n }, { id: 'p2', quantity: 1, resultCents: 100n }]);
  assert.equal(result.length, 2);
  assert.ok(result[0].classification.includes('ALTO RESULTADO'));
});
