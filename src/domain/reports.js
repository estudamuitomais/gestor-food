import { money } from './money.js';
import { calculateOrderResult } from './finance.js';

function csvCell(value) {
  const text = String(value ?? '').replaceAll('"', '""');
  return `"${text}"`;
}

export function productsToCsv(products) {
  const lines = [
    ['Produto', 'Categoria', 'Quantidade', 'Venda bruta', 'Resultado sem CMV', 'Critério de rateio'].map(csvCell).join(';')
  ];
  for (const product of products) lines.push([product.name, product.category, product.quantity, money(BigInt(product.grossCents)), money(BigInt(product.resultCents)), product.allocationMethod ?? 'N/A'].map(csvCell).join(';'));
  return `\ufeff${lines.join('\r\n')}\r\n`;
}

export function ordersToCsv(orders) {
  const lines = [['Pedido', 'Loja', 'Status', 'Data', 'Venda bruta', 'Desconto loja', 'Comissão', 'Taxa pagamento', 'Promoção loja', 'Entrega loja', 'Resultado sem CMV'].map(csvCell).join(';')];
  for (const order of orders) {
    const result = calculateOrderResult(order);
    lines.push([order.id, order.storeId, order.status, order.createdAt, money(result.grossCents), money(result.storeDiscountCents), money(result.commissionCents), money(result.paymentFeeCents), money(result.storePromotionCents), money(result.storeDeliveryCents), money(result.resultWithoutCmvCents)].map(csvCell).join(';'));
  }
  return `\ufeff${lines.join('\r\n')}\r\n`;
}

export function dailyExecutiveSummary({ company, stores, consolidated, alerts = [], approvals = [] }) {
  const atRisk = stores.filter(store => ['ATENÇÃO', 'RECUPERAÇÃO', 'CRÍTICO'].includes(store.status));
  return {
    title: `Resumo gerencial — ${company.name}`,
    date: new Intl.DateTimeFormat('pt-BR').format(new Date()),
    headline: `${consolidated.orders} pedidos e ${money(BigInt(consolidated.resultWithoutCmvCents))} de resultado sem CMV.`,
    storesAtRisk: atRisk.map(store => ({ storeId: store.id, name: store.name, status: store.status })),
    alertsCount: alerts.length,
    pendingApprovals: approvals.filter(item => item.status === 'PENDING').length,
    disclaimer: 'Resultado sem CMV não representa lucro contábil e não inclui custo de mercadoria vendida.'
  };
}
