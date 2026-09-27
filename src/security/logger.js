import { randomUUID } from 'node:crypto';
import { redactSecrets } from './config.js';

export function requestId() { return randomUUID(); }

export function logEntry({ level = 'info', message, requestId: id, metadata = {} }) {
  return { timestamp: new Date().toISOString(), level, message, requestId: id, metadata: redactSecrets(metadata) };
}

export function safeError(error) { return { name: error?.name ?? 'Error', message: error?.message ?? 'Erro interno' }; }
