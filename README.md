# AgentVending — The Agent Vending Machine

> **In one line**: Turn any personal homepage into a 24/7 self-service vending machine — the visitor's AI agent walks in on its own, discovers your services, gets a quote, and places an order. Fully unattended.

**Competition**: Open Agentic Web Challenge (Cognizant × MIT Media Lab × Mozilla × ITU)
**Prize**: $10,000 (grand prize $5,000) | 124 registered | Deadline 2027-01-11
**Submission requirements (scoring criterion #0, checked one by one)**:
- ✅ Publish a spec-compliant agent-network description + a browser-runnable runtime interface
- ✅ Conformance gate: public site must be loadable, have grounded capabilities, and controlled external access
- ✅ YouTube demo video < 2 minutes, **presented on camera by a real human** (no AI voiceover)
- ✅ Judged equally on four dimensions: technological implementation / design / potential impact / idea
- ✅ Reproducible cross-site results + a short written reproduction path

## Core Features (strictly 3)
1. **Agent Discovery Card**: a `/.well-known/agent-network.json` standard descriptor so any agent can automatically discover this site's services
2. **Quote/Order API**: grounded capabilities (quote / order / status), with a budget guard
3. **Cross-site demo**: demo.html ships with a built-in "buyer agent" that completes the full flow in the browser — discover → quote → order → deliver

## First 30 Seconds (pain-point scenario opener)
"You freelance, and your website has an email form. A client's AI assistant wants to hire you — but it can't fill out forms, so it sends an email and waits for your reply. Three days gone in one round trip. What if your website were itself a vending machine? The client's agent walks up, picks a service, gets a quote, places an order, and receives the deliverable — your business runs itself while you sleep. That's AgentVending."

## Reproduction Path (written instructions for judges)
1. Open `index.html` → the vending machine page for humans
2. Open `demo_cross.html` (requires two ports served simultaneously) → full cross-origin transaction log; or `demo.html` for the single-site version
3. `GET /.well-known/agent-network.json` → the machine-readable service discovery descriptor
4. No backend, no keys throughout — just open two browser windows to reproduce the cross-site transaction

## Files
- `index.html` — vending machine storefront (human visitors)
- `demo.html` — single-site live transaction demo
- `demo_cross.html` — **cross-site demo** (buyer :8900 / seller :8899, two origins, postMessage jsonrpc channel)
- `.well-known/agent-network.json` — spec-compliant discovery descriptor
- `js/agent-api.js` — capabilities runtime (quote/order/status)
- `js/buyer-agent.js` — built-in buyer agent (for the demo)
