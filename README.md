# BitHelp, A Bitcoin enabled credential provider for Agent Payment Protocol

BitHelp is a Bitcoin-enabled credential provider for the Agent Payment Protocol. We enable smooth Bitcoin payments over x402 using browser-based wallets, instead of handling private keys ourselves.

Frontend with the **four canonical AP2 components**. Users describe what to buy in plain language; the Shopping Agent suggests exact details (and the Merchant finds a matching order when possible). Payment is settled on-chain via **Unisat Wallet** — no local Bitcoin node required.

## The 4 AP2 components

Every AP2 project has exactly four agents with **different roles**. They **communicate securely with each other** via signed messages (they do not share in-memory state).

| Component | Role |
|-----------|------|
| **Shopping Agent** | Orchestrator only; talks to user and to the other three agents. Does NOT hold credentials, create cart, or settle. |
| **Merchant Agent** | Accepts CartRequest from Shopping; returns **signed CartMandate**. Does NOT see credentials or execute payment. |
| **Credentials Provider Agent (bitcoin enabled)** | Holds payment credentials (wallets). Accepts ApprovalRequest; returns **signed PaymentAuthorization**. Does NOT create cart or settle. |
| **Merchant Payment Processor Agent** | Accepts SettlementRequest (with auth signature); settles on-chain via **x402**; returns **signed SettlementResult**. Does NOT hold credentials. |

**Secure communication:** Each cross-agent message is signed by the sender so the receiver can verify origin (e.g. Merchant signs CartMandate, Credentials Provider signs authorization, Processor signs settlement result).

## Flow

1. **Intent** (Shopping Agent) — User types what they want (e.g. "2 coffees for Alice"). Agent suggests exact details (summary, amount, recipient); user can refine or confirm.
2. **Cart** (Merchant Agent) — Returns a signed CartMandate, matching an order when possible.
3. **Authorization** (Credentials Provider Agent) — User approves or rejects using payment credentials (Unisat).
4. **Settlement** (Merchant Payment Processor Agent) — User signs and sends via Unisat (payment made over x402); Processor returns signed SettlementResult.
5. **Receipt** — Auditable record tying intent → cart → authorization → settlement.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Bitcoin: Unisat Wallet

- **No local node.** Install the [Unisat Wallet](https://unisat.io) browser extension.
- **Wallets:** Connect Unisat on the Wallets page (Credentials Provider). That address is used for approvals.
- **Settlement:** On the Settlement step, Unisat will prompt you to sign and send the payment. The Processor records the txid and returns a signed result.

## Reusable pattern

- **Intent** — What to pay (prompt/summary, amount, recipient, createdBy).
- **Authorization** — Who approved (user/agent), status (approved/rejected), optional reason.
- **Settlement** — What was executed (txid, amount, recipient, success/fail, executedBy).
- **Receipt** — Single auditable object linking the three; can be stored or sent to other systems.

Other teams can copy the credential provider to enable bitcoin payments through browser based wallets over X402 protocol

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
