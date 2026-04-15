import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

// Start server on a test port to avoid conflicts
process.env.PORT = '3099';

// Dynamic import so the module loads fresh
const { default: app } = await import('../server.js');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(3099, () => {
      baseUrl = 'http://localhost:3099';
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

describe('GET /api/results', () => {
  it('returns initial vote counts of 0 for all topics', async () => {
    const res = await fetch(`${baseUrl}/api/results`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, {
      'Multi-Agent Systems': 0,
      'Claude in Production': 0,
      'Building MCP Servers': 0,
    });
  });
});

describe('POST /api/vote', () => {
  it('increments vote for a valid topic and returns updated counts', async () => {
    const res = await fetch(`${baseUrl}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Multi-Agent Systems' }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body['Multi-Agent Systems'], 1);
    assert.equal(body['Claude in Production'], 0);
    assert.equal(body['Building MCP Servers'], 0);
  });

  it('returns 400 for an unknown topic', async () => {
    const res = await fetch(`${baseUrl}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: 'Unknown Topic' }),
    });
    assert.equal(res.status, 400);
  });

  it('returns 400 when topic is missing from body', async () => {
    const res = await fetch(`${baseUrl}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });
});
