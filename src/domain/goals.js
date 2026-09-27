export function calculateGoalProgress({ goalCents, realizedCents, expectedCents, forecastCents }) {
  const goal = BigInt(goalCents);
  const realized = BigInt(realizedCents);
  const expected = BigInt(expectedCents);
  const forecast = BigInt(forecastCents);
  return { goalCents: goal, realizedCents: realized, expectedCents: expected, forecastCents: forecast, varianceToExpectedCents: realized - expected, amountToRecoverCents: goal > forecast ? goal - forecast : 0n, reached: realized >= goal, forecastAtRisk: forecast < goal };
}

export function buildGoals(stores, forecasts) {
  return stores.map(store => {
    const forecast = forecasts.find(item => item.storeId === store.id)?.expectedClosingCents ?? 0;
    return { storeId: store.id, storeName: store.name, period: 'DIÁRIA', ...calculateGoalProgress({ goalCents: store.goalCents, realizedCents: store.metrics.grossCents, expectedCents: store.expectedCents, forecastCents: forecast }) };
  });
}
