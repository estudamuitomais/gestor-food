import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { ROLES, sanitizeUser } from './access.js';

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [salt, expectedHex] = String(stored).split(':');
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export class AuthService {
  constructor({ clock = () => Date.now(), sessionTtlMs = 8 * 60 * 60 * 1000 } = {}) {
    if (!Number.isFinite(sessionTtlMs) || sessionTtlMs <= 0) throw new Error('TTL de sessão inválido.');
    this.clock = clock; this.sessionTtlMs = sessionTtlMs; this.users = new Map(); this.sessions = new Map();
  }
  register({ id, email, password, companyId, role = 'OWNER', storeIds = [] } = {}) {
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    if (!id || !companyId || normalizedEmail.length > 254 || typeof password !== 'string' || password.length < 8 || password.length > 1024) throw new Error('E-mail, empresa e senha de 8 a 1024 caracteres são obrigatórios.');
    if (!Object.values(ROLES).includes(role)) throw new Error('Papel de acesso inválido.');
    if (!Array.isArray(storeIds) || storeIds.some(storeId => typeof storeId !== 'string')) throw new Error('Lojas autorizadas inválidas.');
    const normalizedStoreIds = [...new Set(storeIds)];
    if ([...this.users.values()].some(user => user.email === normalizedEmail)) throw new Error('E-mail já cadastrado.');
    const user = { id, email: normalizedEmail, passwordHash: hashPassword(password), companyId, role, storeIds: normalizedStoreIds, createdAt: new Date(this.clock()).toISOString() };
    this.users.set(id, user);
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
  login({ email, password } = {}) {
    this.pruneExpiredSessions();
    const normalizedEmail = String(email ?? '').trim().toLowerCase();
    const user = [...this.users.values()].find(candidate => candidate.email === normalizedEmail);
    if (!user || !verifyPassword(password, user.passwordHash)) throw new Error('Credenciais inválidas.');
    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    this.sessions.set(tokenHash, { userId: user.id, expiresAt: this.clock() + this.sessionTtlMs });
    const { passwordHash, ...safeUser } = user;
    return { token: rawToken, expiresAt: new Date(this.clock() + this.sessionTtlMs).toISOString(), user: safeUser };
  }
  authenticate(token) {
    const hash = createHash('sha256').update(String(token ?? '')).digest('hex');
    const session = this.sessions.get(hash);
    if (!session || session.expiresAt <= this.clock()) { this.sessions.delete(hash); throw new Error('Sessão inválida ou expirada.'); }
    return sanitizeUser(this.users.get(session.userId));
  }
  revoke(token) { const hash = createHash('sha256').update(String(token ?? '')).digest('hex'); this.sessions.delete(hash); }
  pruneExpiredSessions() {
    const now = this.clock();
    for (const [hash, session] of this.sessions) if (session.expiresAt <= now) this.sessions.delete(hash);
  }
}
