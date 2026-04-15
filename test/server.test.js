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

describe('GET /vote', () => {
  it('returns HTML with dark theme thank-you page for a valid topic', async () => {
    const res = await fetch(`${baseUrl}/vote?topic=Building%20MCP%20Servers`);
    assert.equal(res.status, 200);
    const body = await res.text();
    assert.match(body, /Thanks for voting for Building MCP Servers!/);
    assert.match(body, /Your vote has been counted\./);
    assert.match(body, /#0f0f0f/);
    assert.match(body, /#d97706/);
  });

  it('increments the vote count for the given topic', async () => {
    const before = await (await fetch(`${baseUrl}/api/results`)).json();
    await fetch(`${baseUrl}/vote?topic=Claude%20in%20Production`);
    const after = await (await fetch(`${baseUrl}/api/results`)).json();
    assert.equal(after['Claude in Production'], before['Claude in Production'] + 1);
  });

  it('returns 400 HTML page for an unknown topic', async () => {
    const res = await fetch(`${baseUrl}/vote?topic=Unknown`);
    assert.equal(res.status, 400);
  });

  it('returns 400 HTML page when topic query param is missing', async () => {
    const res = await fetch(`${baseUrl}/vote`);
    assert.equal(res.status, 400);
  });
});
