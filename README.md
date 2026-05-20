# AI Chief of Staff

An AI system that processes a CEO's morning communications — triaging every message, delegating what can be handled by others, and surfacing only the decisions that require personal attention.

Built with Claude (Anthropic) + React + Node.js.

## Features

- **Triage** — every message classified as Ignore / Delegate / Decide with a reason and a ready-to-send drafted response
- **Flags** — critical items the CEO needs to know about (production incidents, scheduling conflicts, phishing, at-risk deals)
- **Daily Briefing** — one-page markdown summary readable in under 2 minutes
- **Load Custom Data** — drop any JSON file of messages to re-analyse on the fly (useful for live demos)

## Stack

| Layer | Tech |
|---|---|
| LLM | Claude Opus (`claude-opus-4-7`) via Anthropic SDK |
| Backend | Node.js + Express |
| Frontend | React 18 + Vite + Tailwind CSS |

## Quick Start

### 1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

Or from the root (requires `concurrently`):
```bash
npm install && npm run install:all
```

### 2. Set your Anthropic API key

```bash
# Create backend/.env
echo "ANTHROPIC_API_KEY=sk-ant-..." > backend/.env
```

### 3. Run

Open two terminals:

```bash
# Terminal 1 — API server (port 3001)
cd backend && npm start

# Terminal 2 — Frontend dev server (port 5173)
cd frontend && npm run dev
```

Then open **http://localhost:5173**

The first page load calls Claude and caches the result. Subsequent loads are instant.

## Testing with New Data

The **Load Data** button (top right) accepts any `.json` file matching this format:

```json
[
  {
    "id": 1,
    "channel": "email" | "slack" | "whatsapp",
    "from": "Name <email@example.com>",
    "subject": "Optional — for email",
    "channel_name": "Optional — for slack",
    "timestamp": "2026-03-18T08:00:00Z",
    "body": "Message text"
  }
]
```

## API

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/analyze` | Analyse `messages.json` (cached after first call) |
| `POST` | `/api/analyze` | Analyse custom `{ messages: [...] }` payload |
| `GET` | `/api/health` | Health check |

## Architecture

```
frontend (Vite:5173)
    │  /api/* proxied to →
backend (Express:3001)
    │  calls →
Anthropic API (claude-opus-4-7)
```

The backend sends all messages to Claude in a single prompt with a structured JSON schema. The response is parsed and served to the frontend. The default messages are cached in-process after the first analysis.
