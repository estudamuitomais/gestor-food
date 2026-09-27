export function compareStores(stores, metric = 'resultWithoutCmvCents') {
  return [...stores].sort((a, b) => Number((b.metrics?.[metric] ?? b[metric] ?? 0) - (a.metrics?.[metric] ?? a[metric] ?? 0))).map((store, index) => ({ storeId: store.id, storeName: store.name, rank: index + 1, value: store.metrics?.[metric] ?? store[metric] ?? 0 }));
}

export function findTransferableStrategies({ sourceStoreId, targetStoreId, strategies }) {
  return strategies.filter(strategy => strategy.storeId === sourceStoreId && strategy.result === 'EFFECTIVE').map(strategy => ({ ...strategy, sourceStoreId, targetStoreId, classification: 'REQUER APROVAÇÃO', caveat: 'Resultado observado em outra loja; precisa de teste controlado.' }));
}
