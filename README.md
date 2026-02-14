# AP2 — Agent Payment Protocol

Frontend for a **clean intent → authorization → settlement** flow with **auditable receipts**. Users can "buy anything" with prompts and pay with Bitcoin via a **local node** (no mainnet by default).

## Flow

1. **Intent** — User describes what to pay for (prompt), amount in BTC, recipient. Creates an auditable intent record.
2. **Authorization** — Human (or agent) reviews and approves or rejects. Records who authorized and when.
3. **Settlement** — System executes the payment against the local Bitcoin node. Records txid and outcome.
4. **Receipt** — Immutable record tying intent + authorization + settlement for humans and systems.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Bitcoin: local node vs mock

- **Default:** Mock mode (no real node). Payments are simulated; no network calls.
- **Real local node:** Run Bitcoin Core (e.g. regtest) on `127.0.0.1:8332`. In `src/main.tsx` set:

  ```ts
  ;(window as any).__AP2_MOCK_BTC__ = false
  ```

  The Vite dev server proxies `/btc` to `http://127.0.0.1:8332` for JSON-RPC (`sendtoaddress`, etc.).

## Reusable pattern

- **Intent** — What to pay (prompt/summary, amount, recipient, createdBy).
- **Authorization** — Who approved (user/agent), status (approved/rejected), optional reason.
- **Settlement** — What was executed (txid, amount, recipient, success/fail, executedBy).
- **Receipt** — Single auditable object linking the three; can be stored or sent to other systems.

Other teams can copy this flow and swap the settlement backend (e.g. Lightning, other chains).

## Tech

- **Vite** + **React** + **TypeScript**
- **React Router** for intent → authorize → settle → receipt
- **Context** for flow state (could be replaced by URL state or a store)
- **CSS modules** + CSS variables (dark theme, Outfit + JetBrains Mono)

## Scripts

| Command   | Description        |
|----------|--------------------|
| `npm run dev`     | Start dev server   |
| `npm run build`   | Production build   |
| `npm run preview` | Preview production build |
