const baseUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? 'https://gestor-food.onrender.com').replace(/\/$/, '');
const expectedMode = process.env.SMOKE_EXPECT_MODE ?? 'DEMO';

const checks = [
  ['/healthz', body => body.status === 'ok' && body.mode === expectedMode],
  ['/readyz', body => body.status === 'ready' && body.mode === expectedMode],
  ['/api/ifood/config', body => body.enabled === (expectedMode === 'REAL') && body.mode === expectedMode],
];

let failed = false;
for (const [path, validate] of checks) {
  try {
    const response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(15000) });
    const body = await response.json();
    if (!response.ok || !validate(body)) {
      failed = true;
      console.error(`FAIL ${path}: HTTP ${response.status}`, body);
      continue;
    }
    console.log(`PASS ${path}: HTTP ${response.status}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${path}: ${error.message}`);
  }
}

if (failed) process.exitCode = 1;
