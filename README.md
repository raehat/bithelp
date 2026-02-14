# AP2 — Agent Payment Protocol

Frontend for the **Agent Payment Protocol** with the **four canonical AP2 components**. Users can "buy anything" with prompts; payment is settled on-chain via x402 (local Bitcoin node in this demo).

## The 4 AP2 components

Every AP2 project has exactly four agents:

| Component | Role |
|-----------|------|
| **Shopping Agent** | Main orchestrator; handles user requests |
| **Merchant Agent** | Handles product queries; creates signed **CartMandates** |
| **Credentials Provider Agent** | Holds user's payment credentials (wallets); facilitates payment |
| **Merchant Payment Processor Agent** | Settles payment on-chain via **x402** |

## Flow

1. **Intent** (Shopping Agent) — User describes what to pay for (prompt), amount, recipient.
2. **Cart** (Merchant Agent) — Returns a signed CartMandate for the request.
3. **Authorization** (Credentials Provider Agent) — User approves or rejects using payment credentials.
4. **Settlement** (Merchant Payment Processor Agent) — Executes payment via x402 (local Bitcoin node here; mock by default).
5. **Receipt** — Auditable record tying intent → cart → authorization → settlement.

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
