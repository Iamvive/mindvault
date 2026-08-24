const test = require('node:test');
const assert = require('node:assert');
const { getSystemProfile, runHealthAudit, executeRepair } = require('../services/macDiagnostics');
const { getEcosystemTopology } = require('../services/bonjourScanner');

test('getSystemProfile returns required system keys', () => {
  const profile = getSystemProfile();
  assert.ok(profile.hostname, 'Should have hostname');
  assert.ok(profile.deviceType, 'Should identify deviceType');
  assert.ok(profile.ip, 'Should have IP address');
  assert.ok(typeof profile.bluetoothActive === 'boolean', 'bluetoothActive must be boolean');
});

test('runHealthAudit runs 8-point checks and returns valid score', () => {
  const audit = runHealthAudit();
  assert.ok(typeof audit.score === 'number', 'Score must be a number');
  assert.ok(audit.checks.length >= 8, 'Must have at least 8 diagnostic checks');
  
  const checkIds = audit.checks.map(c => c.id);
  assert.ok(checkIds.includes('wifi-subnet'));
  assert.ok(checkIds.includes('bluetooth'));
  assert.ok(checkIds.includes('sharingd'));
  assert.ok(checkIds.includes('airdrop'));
  assert.ok(checkIds.includes('universal-control'));
  assert.ok(checkIds.includes('screen-sharing'));
});

test('executeRepair handles known repair actions safely', () => {
  const sharingdFix = executeRepair('restart-sharingd');
  assert.strictEqual(sharingdFix.success, true);
  assert.ok(sharingdFix.message.includes('sharingd'));

  const pingFix = executeRepair('clipboard-ping');
  assert.strictEqual(pingFix.success, true);

  const unknownFix = executeRepair('invalid-action-xyz');
  assert.strictEqual(unknownFix.success, false);
});

test('getEcosystemTopology returns Mac mini, MacBook, and iPad nodes', () => {
  const topology = getEcosystemTopology();
  assert.strictEqual(topology.devices.length, 3);
  
  const types = topology.devices.map(d => d.type);
  assert.ok(types.includes('mac-mini'));
  assert.ok(types.includes('macbook'));
  assert.ok(types.includes('ipad'));
});
