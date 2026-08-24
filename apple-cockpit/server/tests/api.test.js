const test = require('node:test');
const assert = require('node:assert');
const { app, server, broadcastInterval } = require('../index');

test('API endpoints return structured responses', async (t) => {
  const testPort = 5999;
  
  await new Promise((resolve) => server.listen(testPort, resolve));

  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${testPort}/api/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'ok');

    // 2. Devices route
    const devRes = await fetch(`http://localhost:${testPort}/api/devices`);
    const devData = await devRes.json();
    assert.strictEqual(devData.success, true);
    assert.strictEqual(devData.devices.length, 3);

    // 3. Host route
    const hostRes = await fetch(`http://localhost:${testPort}/api/devices/host`);
    const hostData = await hostRes.json();
    assert.strictEqual(hostData.success, true);
    assert.ok(hostData.host.hostname);

    // 4. Diagnostics route
    const diagRes = await fetch(`http://localhost:${testPort}/api/diagnostics`);
    const diagData = await diagRes.json();
    assert.strictEqual(diagData.success, true);
    assert.ok(typeof diagData.score === 'number');

    // 5. Repair action
    const repRes = await fetch(`http://localhost:${testPort}/api/diagnostics/repair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionId: 'restart-sharingd' })
    });
    const repData = await repRes.json();
    assert.strictEqual(repData.success, true);

  } finally {
    clearInterval(broadcastInterval);
    await new Promise((resolve) => server.close(resolve));
  }
});
