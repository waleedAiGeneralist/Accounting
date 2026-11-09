# Hisab Kitab (حساب کتاب)

Client demo for double-entry accounting for a Pakistani rice & kiryana shop.

**Stack:** Next.js (App Router) · TypeScript · Tailwind · browser `localStorage`

No database, no login, no server secrets. Sample ledger data loads in the browser and persists locally. Use Settings → Backup to export/import JSON, or Reset to restore sample data.

Bilingual labels (English + Urdu).

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- Dashboard with cash, receivables, payables, stock value
- Cash / sale / purchase / expense / journal vouchers
- Parties, stock, chart of accounts
- Trial balance, P&amp;L, balance sheet, cash book, ledger, AR/AP, stock report
- Party statement + WhatsApp share text
- EN / Urdu / both + light/dark theme
