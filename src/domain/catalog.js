export function calculateMaximumDiscount({ priceCents, minimumMarginPercent = 0, fixedCostsCents = 0 }) {
  const price = BigInt(priceCents);
  const minimumResult = (price * BigInt(Math.round(minimumMarginPercent * 100))) / 10000n;
  const maximum = price - BigInt(fixedCostsCents) - minimumResult;
  return maximum > 0n ? maximum : 0n;
}

export function classifyProduct({ quantity, resultCents, averageQuantity, averageResult }) {
  const highDemand = quantity >= averageQuantity;
  const highResult = resultCents >= averageResult;
  if (highResult && highDemand) return 'ALTO RESULTADO + ALTA DEMANDA';
  if (highResult) return 'ALTO RESULTADO + BAIXA DEMANDA';
  if (highDemand) return 'BAIXO RESULTADO + ALTA DEMANDA';
  return 'BAIXO RESULTADO + BAIXA DEMANDA';
}

export function analyzeCatalog(products) {
  if (!products.length) return [];
  const averageQuantity = products.reduce((sum, product) => sum + product.quantity, 0) / products.length;
  const averageResult = products.reduce((sum, product) => sum + BigInt(product.resultCents), 0n) / BigInt(products.length);
  return products.map(product => ({ ...product, classification: classifyProduct({ ...product, averageQuantity, averageResult }) }));
}
