import { calculateOrderResult, aggregateOrders } from './finance.js';

const stores = [
  { id: 'store-1', name: 'Loja Centro', status: 'NORMAL', goalCents: 360000, expectedCents: 328000, reviews: 4.8, cancellationRate: 1.2, health: 91 },
  { id: 'store-2', name: 'Loja Zona Sul', status: 'RECUPERAÇÃO', goalCents: 360000, expectedCents: 410000, reviews: 4.5, cancellationRate: 3.6, health: 67 },
  { id: 'store-3', name: 'Loja Norte', status: 'ATENÇÃO', goalCents: 300000, expectedCents: 286000, reviews: 4.7, cancellationRate: 2.1, health: 78 }
];
export const DEMO_SCENARIOS = Object.freeze(['normal', 'weak-sales', 'critical-reviews', 'cancellations']);

function ordersFor(storeId, index) {
  const base = [3990, 4590, 5290, 2890, 6490, 3590, 4290, 7490];
  return base.map((grossCents, i) => ({
    id: `${storeId}-order-${index}-${i + 1}`,
    storeId,
    status: i === 7 && index === 1 ? 'CANCELLED' : 'CONCLUDED',
    createdAt: `2026-09-26T${String(11 + Math.floor(i / 2)).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}:00-03:00`,
    grossCents,
    storeDiscountCents: i % 3 === 0 ? 400 : 0,
    commissionCents: Math.round(grossCents * 0.11),
    paymentFeeCents: Math.round(grossCents * 0.032),
    storePromotionCents: i % 4 === 0 ? 150 : 0,
    storeDeliveryCents: i % 5 === 0 ? 80 : 0,
    otherCostsCents: 0
  }));
}

export function buildDemoSnapshot({ scenario = 'normal' } = {}) {
  const selectedScenario = DEMO_SCENARIOS.includes(scenario) ? scenario : 'normal';
  const enrichedStores = stores.map((store, index) => {
    const orders = ordersFor(store.id, index);
    const metrics = aggregateOrders(orders);
    return { ...store, orders, metrics, resultCents: metrics.resultWithoutCmvCents, averageTicketCents: metrics.orders ? metrics.grossCents / BigInt(metrics.orders) : 0n };
  });
  const allOrders = enrichedStores.flatMap((store) => store.orders);
  const base = {
    mode: 'DEMO',
    company: { id: 'company-demo', name: 'Empresa Demo — Gerente iFood IA' },
    stores: enrichedStores,
    consolidated: aggregateOrders(allOrders),
    forecasts: enrichedStores.map((store, index) => ({ storeId: store.id, storeName: store.name, expectedClosingCents: store.expectedCents + (index === 1 ? -72000 : 18000), confidence: index === 1 ? 'MÉDIA' : 'ALTA', explanation: index === 1 ? 'Projeção reduzida pelo desvio atual de pedidos.' : 'Histórico recente e ritmo do dia estão dentro do padrão.' })),
    alerts: [
      { level: 'critical', storeId: 'store-2', title: 'Meta em risco', body: 'A projeção atual está abaixo da meta diária. Plano de recuperação aguardando análise.' },
      { level: 'warning', storeId: 'store-3', title: 'Cancelamentos anormais', body: 'A taxa está acima do limite configurado de 2,0%.' },
      { level: 'info', storeId: 'store-1', title: 'Operação normal', body: 'Vendas, avaliação e resultado sem CMV dentro dos parâmetros.' }
    ],
    products: [
      { storeId: 'store-1', name: 'Parmegiana', category: 'Pratos', quantity: 18, grossCents: 71820, resultCents: 55420, classification: 'ALTO RESULTADO + ALTA DEMANDA', allocationMethod: 'RATEIO PROPORCIONAL AO BRUTO' },
      { storeId: 'store-2', name: 'Combo Família', category: 'Combos', quantity: 12, grossCents: 82800, resultCents: 58900, classification: 'ALTO RESULTADO + BAIXA DEMANDA', allocationMethod: 'RATEIO PROPORCIONAL AO BRUTO' },
      { storeId: 'store-3', name: 'Batata Especial', category: 'Acompanhamentos', quantity: 21, grossCents: 52500, resultCents: 34100, classification: 'BAIXO RESULTADO + ALTA DEMANDA', allocationMethod: 'RATEIO PROPORCIONAL AO BRUTO' }
    ],
    reviews: [
      { storeId: 'store-1', rating: 5, category: 'OUTROS', comment: 'Chegou quentinho e muito saboroso!', suggestedReply: 'Que bom saber disso! Obrigado por escolher nossa loja. ❤️' },
      { storeId: 'store-2', rating: 2, category: 'TEMPERATURA', comment: 'A comida chegou fria hoje.', suggestedReply: 'Sentimos muito pela experiência. Vamos revisar o processo para melhorar.' },
      { storeId: 'store-3', rating: 4, category: 'EMBALAGEM', comment: 'Tudo gostoso, mas a embalagem veio amassada.', suggestedReply: 'Obrigado pelo feedback. Vamos reforçar o cuidado com as embalagens.' }
    ],
    opportunities: [
      { storeId: 'store-2', severity: 'high', title: 'Venda abaixo do esperado', description: 'A Loja Zona Sul está 26,3% abaixo do esperado no período.', impact: 'Priorizar diagnóstico do jantar e produtos de maior resultado.' },
      { storeId: 'store-3', severity: 'medium', title: 'Cancelamentos acima do padrão', description: 'A taxa de cancelamento subiu para 2,1%.', impact: 'Verificar operação e motivos antes de criar oferta.' }
    ],
    approvals: [
      { id: 'approval-1', storeId: 'store-2', title: 'Plano de recuperação do jantar', risk: 'médio', cost: 'R$ 0,00', status: 'PENDING', action: 'Destacar produtos com maior resultado sem CMV.' }
    ],
    decisions: [
      { time: '13:30', store: 'Loja Zona Sul', event: 'Detectado: vendas 26,3% abaixo do esperado.' },
      { time: '13:32', store: 'Loja Zona Sul', event: 'Diagnóstico: queda concentrada no volume de pedidos.' }
    ]
  };
  if (selectedScenario === 'weak-sales') { base.stores[1].status = 'RECUPERAÇÃO'; base.stores[1].health = 52; base.opportunities.unshift({ storeId: 'store-2', severity: 'critical', title: 'Cenário de queda agressiva', description: 'A demanda caiu mais de 10% contra o esperado.', impact: 'Ativar análise do jantar.' }); }
  if (selectedScenario === 'critical-reviews') { base.reviews = base.reviews.map(review => review.storeId === 'store-2' ? { ...review, rating: 1, comment: 'Pedido chegou frio e atrasado.' } : review); base.alerts.unshift({ level: 'critical', storeId: 'store-2', title: 'Avaliação crítica', body: 'Nova avaliação com nota 1 requer atenção.' }); }
  if (selectedScenario === 'cancellations') { base.stores[2].cancellationRate = 8.4; base.stores[2].status = 'CRÍTICO'; base.stores[2].health = 39; }
  base.scenario = selectedScenario;
  return base;
}
