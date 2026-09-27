import test from 'node:test';
import assert from 'node:assert/strict';
import { ROLES, assertTenantAccess, authorize, can, sanitizeUser } from '../src/security/access.js';

const manager = { id: 'u1', companyId: 'c1', storeIds: ['s1'], role: ROLES.MANAGER, passwordHash: 'secret' };

test('papéis controlam permissões', () => {
  assert.equal(can(manager, 'approve_actions'), true);
  assert.equal(can({ role: ROLES.ANALYST }, 'approve_actions'), false);
});

test('isolamento impede acesso à empresa ou loja errada', () => {
  assert.throws(() => assertTenantAccess(manager, { companyId: 'c2' }), /empresa diferente/);
  assert.throws(() => authorize(manager, 'read', { companyId: 'c1', storeId: 's2' }), /loja não autorizada/);
});

test('usuário sanitizado não expõe segredos', () => {
  const safe = sanitizeUser({ ...manager, password: 'x', accessToken: 'y' });
  assert.equal('passwordHash' in safe, false);
  assert.equal('accessToken' in safe, false);
});
