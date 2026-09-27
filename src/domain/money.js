export function cents(value) {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Valor monetário inválido');
  const normalized = typeof value === 'string' ? value.replace(',', '.') : value;
  return BigInt(Math.round(Number(normalized) * 100));
}

export function money(value) {
  const amount = typeof value === 'bigint' ? value : cents(value);
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(amount) / 100);
}

export function percent(numerator, denominator) {
  if (denominator === 0n) return 0;
  return Number((numerator * 10000n) / denominator) / 100;
}
