export const ROLES = Object.freeze({ OWNER: 'OWNER', ADMIN: 'ADMIN', MANAGER: 'MANAGER', ANALYST: 'ANALYST', OPERATOR: 'OPERATOR' });

const permissions = {
  OWNER: ['read', 'manage_users', 'manage_settings', 'approve_actions', 'execute_actions', 'view_financial'],
  ADMIN: ['read', 'manage_users', 'manage_settings', 'approve_actions', 'execute_actions', 'view_financial'],
  MANAGER: ['read', 'approve_actions', 'execute_actions', 'view_financial'],
  ANALYST: ['read', 'view_financial'],
  OPERATOR: ['read', 'execute_actions']
};

export function can(user, permission) { return Boolean(user && permissions[user.role]?.includes(permission)); }

export function assertTenantAccess(user, { companyId, storeId } = {}) {
  if (!user?.companyId || user.companyId !== companyId) throw new Error('Acesso negado: empresa diferente.');
  if (storeId && !user.storeIds?.includes(storeId) && ![ROLES.OWNER, ROLES.ADMIN].includes(user.role)) throw new Error('Acesso negado: loja não autorizada.');
  return true;
}

export function authorize(user, permission, scope) {
  if (!can(user, permission)) throw new Error(`Acesso negado: permissão ${permission} necessária.`);
  return assertTenantAccess(user, scope);
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, accessToken, refreshToken, ...safe } = user;
  return safe;
}
