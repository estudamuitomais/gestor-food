export const ACTION_CLASSIFICATION = Object.freeze({ AUTOMATIC: 'AUTOMÁTICA', APPROVAL: 'REQUER APROVAÇÃO', ASSISTED: 'ASSISTIDA' });

export function classifyAction({ apiSupported, costCents = 0n, marginSafe = true, materialImpact = false }) {
  if (!apiSupported) return ACTION_CLASSIFICATION.ASSISTED;
  if (BigInt(costCents) > 0n || !marginSafe || materialImpact) return ACTION_CLASSIFICATION.APPROVAL;
  return ACTION_CLASSIFICATION.AUTOMATIC;
}

export function explainRecommendation({ salesVariance, ticketVariance, productName, historicalUses, marginSafe }) {
  const reasons = [];
  if (salesVariance <= -10) reasons.push(`vendas estão ${Math.abs(salesVariance).toFixed(1)}% abaixo do esperado`);
  if (ticketVariance < 0) reasons.push(`ticket caiu ${Math.abs(ticketVariance).toFixed(1)}%`);
  if (productName) reasons.push(`${productName} apresenta resultado sem CMV favorável`);
  if (historicalUses > 0) reasons.push(`estratégia semelhante funcionou em ${historicalUses} ocasião(ões)`);
  if (marginSafe) reasons.push('não ultrapassa os limites de margem configurados');
  return reasons.length ? `Estou recomendando esta ação porque: ${reasons.join('; ')}.` : 'Dados insuficientes para uma recomendação de alta confiança.';
}
