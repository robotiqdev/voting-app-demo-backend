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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning');
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

app.get('/vote', (req, res) => {
  const { topic } = req.query;
  if (!topic || !(topic in votes)) {
    return res.status(400).send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invalid Vote</title></head>
<body style="background:#0f0f0f;color:white;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
<h1 style="color:#d97706;">Invalid topic</h1>
</body>
</html>`);
  }
  votes[topic]++;
  res.send(`<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Thank You</title></head>
<body style="background:#0f0f0f;color:white;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;">
<h1 style="color:#d97706;">Thanks for voting for ${topic}!</h1>
<p>Your vote has been counted.</p>
</body>
</html>`);
});

export default app;

// Only listen when run directly, not when imported by tests
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Vote API running on port ${PORT}`);
  });
}
