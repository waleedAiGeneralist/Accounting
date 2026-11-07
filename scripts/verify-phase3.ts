import { prisma } from "../src/lib/prisma";
import {
  trialBalance,
  profitAndLoss,
  balanceSheet,
  receivablesAging,
  payablesAging,
  stockReport,
  cashBook,
  accountLedger,
} from "../src/lib/reports";
import { CODES } from "../src/lib/accounts";

async function main() {
  const cash = await prisma.account.findUniqueOrThrow({ where: { code: CODES.CASH } });
  const ledger = await accountLedger(cash.id);
  console.log("✓ Ledger rows", ledger.rows.length, "opening", ledger.opening);

  const tb = await trialBalance();
  console.log("✓ Trial Balance Dr", tb.totalDebit, "Cr", tb.totalCredit);
  if (Math.abs(tb.totalDebit - tb.totalCredit) > 0.02) {
    throw new Error("Trial balance does not balance");
  }

  const pl = await profitAndLoss();
  console.log("✓ P&L net", pl.net, "income", pl.totalIncome, "expense", pl.totalExpense, "cogs", pl.cogs);

  const bs = await balanceSheet();
  console.log("✓ Balance Sheet assets", bs.totalAssets, "L+E", bs.totalLiabEquity);

  const ar = await receivablesAging();
  const ap = await payablesAging();
  console.log("✓ Aging AR parties", ar.length, "AP parties", ap.length);

  const stock = await stockReport();
  console.log("✓ Stock items", stock.length);

  const cb = await cashBook();
  console.log("✓ Cash book rows", cb.rows.length);

  console.log("\nPHASE 3 OK");
}

main()
  .catch((e) => {
    console.error("PHASE 3 FAILED", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
