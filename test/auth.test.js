import test from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../src/security/auth.js';

test('cria usuário, autentica e não retorna hash de senha', () => {
  const auth = new AuthService();
  const user = auth.register({ id: 'u1', email: 'admin@demo.local', password: 'senha-segura', companyId: 'c1' });
  assert.equal('passwordHash' in user, false);
  const session = auth.login({ email: 'admin@demo.local', password: 'senha-segura' });
  const authenticated = auth.authenticate(session.token);
  assert.equal(authenticated.id, 'u1');
  assert.equal('passwordHash' in authenticated, false);
});

test('token revogado e credencial incorreta não autenticam', () => {
  const auth = new AuthService();
  auth.register({ id: 'u1', email: 'admin@demo.local', password: 'senha-segura', companyId: 'c1' });
  assert.throws(() => auth.login({ email: 'admin@demo.local', password: 'errada' }), /Credenciais inválidas/);
  const session = auth.login({ email: 'admin@demo.local', password: 'senha-segura' });
  auth.revoke(session.token);
  assert.throws(() => auth.authenticate(session.token), /Sessão inválida/);
});

test('normaliza e-mail e rejeita credencial excessivamente grande', () => {
  const auth = new AuthService();
  const user = auth.register({ id: 'u1', email: ' Admin@Demo.Local ', password: 'senha-segura', companyId: 'c1' });
  assert.equal(user.email, 'admin@demo.local');
  assert.equal(auth.login({ email: 'ADMIN@DEMO.LOCAL', password: 'senha-segura' }).user.email, 'admin@demo.local');
  assert.throws(() => auth.register({ id: 'u2', email: 'other@demo.local', password: 'x'.repeat(1025), companyId: 'c1' }), /8 a 1024/);
});

test('registro valida papel e normaliza vínculos de loja', () => {
  const auth = new AuthService();
  const user = auth.register({ id: 'u1', email: 'admin@demo.local', password: 'senha-segura', companyId: 'c1', role: 'MANAGER', storeIds: ['s1', 's1'] });
  assert.deepEqual(user.storeIds, ['s1']);
  assert.throws(() => auth.register({ id: 'u2', email: 'other@demo.local', password: 'senha-segura', companyId: 'c1', role: 'ROOT' }), /Papel de acesso inválido/);
  assert.throws(() => auth.register({ id: 'u3', email: 'third@demo.local', password: 'senha-segura', companyId: 'c1', storeIds: [1] }), /Lojas autorizadas inválidas/);
});

test('sessões expiradas são removidas e TTL inválido é rejeitado', () => {
  let now = 1000;
  const auth = new AuthService({ clock: () => now, sessionTtlMs: 100 });
  auth.register({ id: 'u1', email: 'admin@demo.local', password: 'senha-segura', companyId: 'c1' });
  const session = auth.login({ email: 'admin@demo.local', password: 'senha-segura' });
  now += 101;
  assert.throws(() => auth.authenticate(session.token), /expirada/);
  assert.equal(auth.sessions.size, 0);
  assert.throws(() => new AuthService({ sessionTtlMs: 0 }), /TTL de sessão inválido/);
});
