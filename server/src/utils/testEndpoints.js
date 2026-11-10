import assert from 'node:assert';

async function testEndpoints() {
  console.log('--- Testing API Endpoints over HTTP ---');

  const healthRes = await fetch('http://localhost:5000/api/health');
  assert.strictEqual(healthRes.status, 200);
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'ok');
  assert.strictEqual(health.database.connected, true);
  console.log('Health endpoint verified over HTTP');

  const unauthSummarize = await fetch('http://localhost:5000/api/videos/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://youtube.com/watch?v=UF8uR6Z6KLc' }),
  });
  assert.strictEqual(unauthSummarize.status, 401);
  console.log('Unauthenticated summarize rejection (401) verified over HTTP');

  const regRes = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Endpoint Tester',
      email: `endpoint_tester_${Date.now()}@example.com`,
      password: 'Password123!',
    }),
  });
  assert.strictEqual(regRes.status, 201);
  const regData = await regRes.json();
  const token = regData.token;
  console.log('Test user registered and token acquired');

  const historyRes = await fetch('http://localhost:5000/api/videos/history', {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.strictEqual(historyRes.status, 200);
  const history = await historyRes.json();
  assert.strictEqual(history.success, true);
  console.log(`Authenticated history endpoint verified over HTTP (${history.count} items)`);

  const invalidUrlRes = await fetch('http://localhost:5000/api/videos/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ url: 'https://notyoutube.com/watch?v=123' }),
  });
  assert.strictEqual(invalidUrlRes.status, 400);
  const invalidJson = await invalidUrlRes.json();
  assert.strictEqual(invalidJson.status, 'fail');
  assert.ok(invalidJson.message.includes('Invalid YouTube URL'));
  console.log('Invalid URL validation rejection verified over HTTP');

  console.log('ALL HTTP API ENDPOINT TESTS PASSED SUCCESSFULLY');
}

testEndpoints().catch((err) => {
  console.error('Endpoint test failed:', err);
  process.exit(1);
});
