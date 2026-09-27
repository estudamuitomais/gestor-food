import { percent } from './money.js';
import { calculateOrderResult } from './finance.js';

function allocate(total, itemGross, orderGross) {
  if (orderGross === 0n) return 0n;
  return (total * itemGross) / orderGross;
}

export function allocateOrderCosts(order) {
  const items = order.items ?? [];
  const orderGross = items.reduce((sum, item) => sum + BigInt(item.grossCents ?? 0), 0n);
  const result = calculateOrderResult(order);
  return items.map((item) => {
    const itemGross = BigInt(item.grossCents ?? 0);
    const allocated = {
      storeDiscountCents: allocate(result.storeDiscountCents, itemGross, orderGross),
      commissionCents: allocate(result.commissionCents, itemGross, orderGross),
      paymentFeeCents: allocate(result.paymentFeeCents, itemGross, orderGross),
      storePromotionCents: allocate(result.storePromotionCents, itemGross, orderGross),
      storeDeliveryCents: allocate(result.storeDeliveryCents, itemGross, orderGross),
      otherCostsCents: allocate(result.otherCostsCents, itemGross, orderGross)
    };
    const costs = Object.values(allocated).reduce((sum, value) => sum + value, 0n);
    return { ...item, ...allocated, allocatedCostCents: costs, resultWithoutCmvCents: itemGross - costs, netPercent: percent(itemGross - costs, itemGross), allocationMethod: 'RATEIO_PROPORCIONAL_AO_BRUTO_DO_ITEM' };
  });
}

export function productFinancialReport(orders) {
  const byProduct = new Map();
  for (const order of orders) {
    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') continue;
    for (const item of allocateOrderCosts(order)) {
      const current = byProduct.get(item.productId) ?? { productId: item.productId, productName: item.productName, quantity: 0, grossCents: 0n, allocatedCostCents: 0n, resultWithoutCmvCents: 0n };
      current.quantity += Number(item.quantity ?? 1);
      current.grossCents += BigInt(item.grossCents ?? 0);
      current.allocatedCostCents += item.allocatedCostCents;
      current.resultWithoutCmvCents += item.resultWithoutCmvCents;
      byProduct.set(item.productId, current);
    }
  }
  return [...byProduct.values()].map((row) => ({ ...row, averagePriceCents: row.quantity ? row.grossCents / BigInt(row.quantity) : 0n, netPercent: percent(row.resultWithoutCmvCents, row.grossCents), allocationMethod: 'RATEIO_PROPORCIONAL_AO_BRUTO_DO_ITEM' })).sort((a, b) => Number(b.resultWithoutCmvCents - a.resultWithoutCmvCents));
}
