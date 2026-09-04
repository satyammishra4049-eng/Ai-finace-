# Northline Paper — Finance Controller

Agent that closes one finance-ops loop: bank file against invoices, bills, Stripe payouts, and tax remittances. It reports a **match rate**, a **labeled accuracy** score, and an **exception list** for everything it would not force-clear.

## Stack

- Next.js 15 (App Router) + TypeScript
- Deterministic reconciliation engine in `src/lib/reconcile.ts`
- Synthetic but internally consistent books in `src/lib/books.ts` (August–2 September 2026)
- Optional OpenAI memo on `POST /api/reconcile` if `OPENAI_API_KEY` is set

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data (not random)

Northline Paper Co. is a Chicago merchant. Invoices use resale vs taxable customers correctly. Bank amounts are in cents and agree with the source document except where the story requires a short pay, a bank fee, or an unidentified ACH — those are the exceptions.

## API

- `GET /api/books` — ledgers
- `GET` / `POST /api/reconcile` — run the close
- `POST /api/ask` — `{ "question": "Did Harbor Press pay?" }`
# Ai-finace-
