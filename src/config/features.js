export function featureStatus(env = process.env, persistence = null) {
  return {
    mode: env.IFOOD_INTEGRATION_ENABLED === 'true' ? 'REAL' : 'DEMO',
    costsBlocked: env.COSTS_ENABLED !== 'true',
    authRequired: env.REQUIRE_AUTH === 'true',
    persistence: persistence ?? { mode: 'MEMORY', productionReady: false },
    modules: {
      demo: true,
      dashboard: true,
      financeWithoutCmv: true,
      forecasts: true,
      approvals: true,
      experiments: true,
      customerMessaging: false,
      ifoodCatalogWrites: false,
      ifoodReviewReplies: false,
      cmv: false
    }
  };
}
