# Express Vote API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Express API server on port 3001 with in-memory vote tracking for POST /api/vote and GET /api/results.

**Architecture:** Single `server.js` entry point with an in-memory votes map, CORS enabled for all origins, static files served from `/public`. Tests use Node.js built-in `node:test` runner and `node:http` for HTTP assertions.

**Tech Stack:** Node.js 20, Express 4, node:test (built-in test runner)

---

## File Structure

- Create: `package.json` — project metadata, express dependency, test/start scripts
- Create: `server.js` — Express app, in-memory store, both routes
- Create: `test/server.test.js` — TDD tests for both endpoints

---

### Task 1: Create package.json

**Files:**
- Create: `package.json`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "voting-api",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node --test test/server.test.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
npm install
```

Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add package.json with express dependency (hq-adg)"
```

---

### Task 2: Write failing tests (RED)

**Files:**
- Create: `test/server.test.js`

- [ ] **Step 1: Create test directory and write tests**

```bash
mkdir -p test
```

Write `test/server.test.js`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail (RED)**

```bash
npm test 2>&1
```

Expected: Tests FAIL because `server.js` doesn't exist yet.

- [ ] **Step 3: Commit failing tests**

```bash
git add test/server.test.js
git commit -m "test: add failing tests for vote API (hq-adg)"
```

---

### Task 3: Implement server.js (GREEN)

**Files:**
- Create: `server.js`

- [ ] **Step 1: Write server.js**

```js
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());

// CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Serve static files from /public
app.use(express.static(join(__dirname, 'public')));

// In-memory votes store
const votes = {
  'Multi-Agent Systems': 0,
  'Claude in Production': 0,
  'Building MCP Servers': 0,
};

app.get('/api/results', (req, res) => {
  res.json({ ...votes });
});

app.post('/api/vote', (req, res) => {
  const { topic } = req.body;
  if (!topic || !(topic in votes)) {
    return res.status(400).json({ error: 'Invalid topic' });
  }
  votes[topic]++;
  res.json({ ...votes });
});

export default app;

// Only listen when run directly, not when imported by tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Vote API running on port ${PORT}`);
  });
}
```

- [ ] **Step 2: Add "type": "module" to package.json (required for ESM imports)**

Update `package.json`:

```json
{
  "name": "voting-api",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "test": "node --test test/server.test.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
```

- [ ] **Step 3: Run tests to verify they pass (GREEN)**

```bash
npm test 2>&1
```

Expected: All 4 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add server.js package.json
git commit -m "feat: express server with vote API (hq-adg)"
```

---

### Task 4: Final verification

**Files:** (no changes)

- [ ] **Step 1: Run full test suite**

```bash
npm test 2>&1
```

Expected: All tests pass, 0 failures.

- [ ] **Step 2: Verify server starts**

```bash
timeout 3 node server.js 2>&1 || true
```

Expected: `Vote API running on port 3001`

- [ ] **Step 3: Confirm clean git state**

```bash
git status
git log origin/main..HEAD --oneline
```

Expected: clean working tree, at least 2 commits ahead of main.

---

## Self-Review

**Spec coverage:**
- [x] POST /api/vote — increments vote count, returns all counts
- [x] GET /api/results — returns all vote counts
- [x] Vote topics (exact strings)
- [x] Initial counts all 0
- [x] CORS for all origins
- [x] Static files from /public
- [x] server.js single entry point
- [x] In-memory only (no database)
- [x] package.json + npm install
- [x] Commit message 'feat: express server with vote API'

**Placeholder scan:** None found — all steps contain actual code.

**Type consistency:** `votes` object used consistently throughout.
