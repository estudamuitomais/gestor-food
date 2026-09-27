import { percent } from './money.js';

function storedCents(value) {
  return BigInt(value ?? 0);
}

export function calculateOrderResult(order) {
  const originalGross = storedCents(order.grossCents);
  const refunded = storedCents(order.refundedCents);
  const cancelled = order.status === 'CANCELLED' || order.status === 'REFUNDED';
  const gross = cancelled ? 0n : (originalGross > refunded ? originalGross - refunded : 0n);
  const additions = storedCents(order.additionsCents);
  const storeDiscount = cancelled ? 0n : storedCents(order.storeDiscountCents);
  const commission = cancelled ? 0n : storedCents(order.commissionCents);
  const paymentFee = cancelled ? 0n : storedCents(order.paymentFeeCents);
  const promotion = cancelled ? 0n : storedCents(order.storePromotionCents);
  const delivery = cancelled ? 0n : storedCents(order.storeDeliveryCents);
  const other = cancelled ? 0n : storedCents(order.otherCostsCents);
  const result = gross + (gross === 0n ? 0n : additions) - storeDiscount - commission - paymentFee - promotion - delivery - other;
  return {
    grossCents: gross,
    additionsCents: additions,
    storeDiscountCents: storeDiscount,
    commissionCents: commission,
    paymentFeeCents: paymentFee,
    storePromotionCents: promotion,
    storeDeliveryCents: delivery,
    otherCostsCents: other,
    resultWithoutCmvCents: result,
    netPercent: percent(result, gross + additions)
  };
}

export function aggregateOrders(orders) {
  const totals = orders.reduce((acc, order) => {
    const result = calculateOrderResult(order);
    for (const key of ['grossCents', 'storeDiscountCents', 'commissionCents', 'paymentFeeCents', 'storePromotionCents', 'storeDeliveryCents', 'otherCostsCents', 'resultWithoutCmvCents']) acc[key] += result[key];
    acc.orders += 1;
    return acc;
  }, { orders: 0, grossCents: 0n, storeDiscountCents: 0n, commissionCents: 0n, paymentFeeCents: 0n, storePromotionCents: 0n, storeDeliveryCents: 0n, otherCostsCents: 0n, resultWithoutCmvCents: 0n });
  return { ...totals, netPercent: percent(totals.resultWithoutCmvCents, totals.grossCents) };
}
