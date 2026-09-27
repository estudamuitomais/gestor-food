import { percent } from './money.js';

export function forecastClosing({ realizedCents, elapsedRatio, historicalExpectedCents, recentTrend = 0 }) {
  const safeRatio = Math.min(Math.max(elapsedRatio, 0.05), 1);
  const runRate = BigInt(Math.round(Number(realizedCents) / safeRatio));
  const blended = BigInt(Math.round(Number(runRate) * 0.6 + Number(historicalExpectedCents) * 0.4));
  const adjusted = BigInt(Math.round(Number(blended) * (1 + recentTrend / 100)));
  const confidence = safeRatio < 0.25 ? 'BAIXA' : safeRatio < 0.6 ? 'MÉDIA' : 'ALTA';
  return { expectedClosingCents: adjusted, confidence, inputs: { realizedCents, elapsedRatio, historicalExpectedCents, recentTrend } };
}

export function calculateStoreHealth({ salesVariancePercent, ticketVariancePercent, cancellationRate, reviewScore, operationalError = false }) {
  const sales = Math.max(0, Math.min(40, 40 + salesVariancePercent * 0.8));
  const ticket = Math.max(0, Math.min(20, 20 + ticketVariancePercent * 0.5));
  const cancellation = Math.max(0, Math.min(20, 20 - cancellationRate * 4));
  const reviews = Math.max(0, Math.min(15, reviewScore / 5 * 15));
  const operation = operationalError ? 0 : 5;
  const score = Math.round(sales + ticket + cancellation + reviews + operation);
  const state = score >= 80 ? 'NORMAL' : score >= 65 ? 'ATENÇÃO' : score >= 45 ? 'RECUPERAÇÃO' : 'CRÍTICO';
  return { score, state, components: { sales: Math.round(sales), ticket: Math.round(ticket), cancellation: Math.round(cancellation), reviews: Math.round(reviews), operation } };
}

export function detectWeakSales({ realizedCents, expectedCents, thresholdPercent = 10 }) {
  const variance = percent(realizedCents - expectedCents, expectedCents);
  return { triggered: variance <= -thresholdPercent, variancePercent: variance, thresholdPercent };
}

export function buildRecoveryPlan({ storeId, forecastCents, goalCents, topProducts = [], priorStrategies = [] }) {
  const gap = goalCents > forecastCents ? goalCents - forecastCents : 0n;
  const best = priorStrategies.filter(strategy => strategy.result === 'EFFECTIVE').sort((a, b) => b.confidence - a.confidence)[0];
  return { storeId, gapCents: gap, additionalOrdersEstimate: topProducts.length ? Math.max(0, Math.ceil(Number(gap) / Number(topProducts[0].averageTicketCents || 1n))) : 0, recommendedStrategy: best?.name ?? 'Destacar produtos de maior resultado sem CMV', confidence: best ? 'MÉDIA' : 'BAIXA', reason: gap > 0n ? 'A projeção está abaixo da meta e exige recuperação.' : 'A projeção atual cobre a meta.' };
}
