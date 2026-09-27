import { calculateOrderResult } from './finance.js';

export function aggregateDailyMetrics(orders) {
  const groups = new Map();
  for (const order of orders) {
    const date = order.createdAt.slice(0, 10);
    const key = `${order.storeId}:${date}`;
    const current = groups.get(key) ?? { storeId: order.storeId, date, orders: 0, completedOrders: 0, cancelledOrders: 0, grossCents: 0n, resultWithoutCmvCents: 0n };
    current.orders += 1;
    if (order.status === 'CANCELLED' || order.status === 'REFUNDED') current.cancelledOrders += 1;
    else { current.completedOrders += 1; const result = calculateOrderResult(order); current.grossCents += result.grossCents; current.resultWithoutCmvCents += result.resultWithoutCmvCents; }
    groups.set(key, current);
  }
  return [...groups.values()].map(row => ({ ...row, averageTicketCents: row.completedOrders ? row.grossCents / BigInt(row.completedOrders) : 0n, cancellationRate: row.orders ? row.cancelledOrders / row.orders * 100 : 0 }));
}

export function aggregateHourlyMetrics(orders) {
  const groups = new Map();
  for (const order of orders) {
    const hour = order.createdAt.slice(11, 13);
    const key = `${order.storeId}:${order.createdAt.slice(0, 10)}:${hour}`;
    const current = groups.get(key) ?? { storeId: order.storeId, date: order.createdAt.slice(0, 10), hour: Number(hour), orders: 0, grossCents: 0n, resultWithoutCmvCents: 0n };
    current.orders += 1;
    if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED') { const result = calculateOrderResult(order); current.grossCents += result.grossCents; current.resultWithoutCmvCents += result.resultWithoutCmvCents; }
    groups.set(key, current);
  }
  return [...groups.values()].sort((a, b) => a.hour - b.hour);
}
