export const costGuard = {
  enabled: false,
  assertAllowed({ estimatedCents = 0n, reason }) {
    if (!this.enabled && BigInt(estimatedCents) > 0n) throw new Error(`Ação bloqueada pelo modo de custo zero: ${reason}`);
    return true;
  }
};
