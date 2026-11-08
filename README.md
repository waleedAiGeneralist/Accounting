# Hisab Kitab (حساب کتاب)

Local-first double-entry accounting for a Pakistani rice & kiryana shop.

**Stack:** Next.js (App Router) · TypeScript · Prisma · SQLite · Tailwind

Bilingual labels (English + Urdu). No auth in v1.

## Setup

Needs **Postgres** (`DATABASE_URL`). Cursor publish-app provisions one automatically.

```bash
npm install
cp .env.example .env   # set DATABASE_URL to your Postgres
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script | Purpose |
|--------|---------|
| `npm run db:seed` | Seed chart of accounts + sample parties/stock |
| `npm run db:studio` | Prisma Studio |
| `npx tsx scripts/verify-phase1.ts` | Balance-enforcement smoke test |

## Phase checklist

### Phase 1 — Database + seed
- Models: Account, Party, Voucher, VoucherLine, StockItem, StockMovement
- Every voucher must balance (debit = credit) inside a Prisma transaction
- Account `3003 Profit & Loss` is system-only (no manual posting)
- Test: `npx tsx scripts/verify-phase1.ts`

### Phase 2 — Entry screens
- `/vouchers/cash?kind=receipt|payment`
- `/vouchers/sale` · `/vouchers/purchase` (party, item, qty, rate, discount, cash/credit)
- `/vouchers/expense` (5003–5008)
- `/vouchers/journal`
- Edit/delete via **reversal** on voucher detail (`/vouchers/[id]`)

### Phase 3 — Reports
- Ledger, Trial Balance, P&L (incl. COGS from stock out), Balance Sheet
- Receivables / Payables with aging
- Stock report, Daily cash book
- Date range + Print + CSV export on report pages

### Phase 4 — Polish
- Dashboard KPIs (today sales, cash, bank, AR, AP)
- Nav search → `/search`
- Dark mode toggle
- Settings → backup/restore SQLite
- Party WhatsApp statement → `/parties/[id]/statement`

## Chart of accounts (seeded)

Assets `1001–1009` · Liabilities `2001–2003` · Equity `3001–3004` · Income `4001–4004` · Expenses `5001–5008`
