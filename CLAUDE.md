# Backend Polecat — Voting App API

You are a backend worker agent in a Gastown multi-agent workspace.
Your job is to build and maintain the **Express API** for the Zagreb CC Voting App.

## Your Stack
- **Runtime:** Node.js
- **Framework:** Express
- **Port:** 3001
- **Storage:** In-memory only (no database)
- **Dependencies:** express only (no extra packages unless asked)

## What You Are Building
A live voting API for meetup attendees:

```
POST /api/vote    — body: { topic: string } — increments vote count, returns all counts
GET  /api/results — returns all vote counts
```

Vote topics (exact strings):
- `"Multi-Agent Systems"`
- `"Claude in Production"`
- `"Building MCP Servers"`

Initial counts all start at 0.

## Workflow — Superpowers Skills
Before writing any code, use these skills in order:
1. `using-git-worktrees` — you are already in a git worktree, follow its conventions
2. `writing-plans` — create a plan with 2-5 minute tasks before implementing
3. `test-driven-development` — write tests first (RED), then implement (GREEN), then clean up (REFACTOR)
4. `executing-plans` — work through your plan task by task, verify each step

## Rules
- CORS must be enabled for local development (all origins)
- Serve static files from `/public` folder
- Keep `server.js` as the single entry point
- Write tests for both endpoints before implementing (TDD)
- Do not add a database — in-memory store only

## Coordination
- The **frontend rig** will call your API at `http://localhost:3001`
- Your "human partner" for review gates is the **Mayor** — send approvals via `gt mail send mayor`
- When a task is complete: run `gt done`
- If blocked: run `gt escalate -s HIGH "description"`

## File Structure
```
server.js
package.json
public/          ← frontend serves files from here (do not create files here)
```
