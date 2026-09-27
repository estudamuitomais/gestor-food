export async function monitorMerchants(client) {
  const merchants = await client.listMerchants();
  const list = Array.isArray(merchants) ? merchants : merchants?.merchants ?? [];
  const statuses = [];
  for (const merchant of list) {
    const status = await client.getMerchantStatus(merchant.id);
    statuses.push({ merchantId: merchant.id, name: merchant.name, status });
  }
  return statuses;
}
