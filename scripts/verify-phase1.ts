/**
 * Phase 1 verification: seed present + unbalanced voucher rejected + balanced accepted.
 */
import { prisma } from "../src/lib/prisma";
import {
  createVoucherTx,
  VoucherBalanceError,
  getAccountByCode,
} from "../src/lib/voucher";
import { CODES } from "../src/lib/accounts";

async function main() {
  const accountCount = await prisma.account.count();
  if (accountCount < 28) {
    throw new Error(`Expected ≥28 accounts, got ${accountCount}`);
  }
  console.log("✓ Chart of accounts seeded:", accountCount);

  const cash = await getAccountByCode(CODES.CASH);
  const capital = await getAccountByCode(CODES.CAPITAL);
  const pl = await getAccountByCode(CODES.PL);

  // Unbalanced must fail
  try {
    await createVoucherTx({
      date: new Date(),
      type: "JOURNAL",
      narration: "Should fail",
      lines: [
        { accountId: cash.id, debit: 1000 },
        { accountId: capital.id, credit: 500 },
      ],
    });
    throw new Error("Unbalanced voucher was accepted — FAIL");
  } catch (e) {
    if (e instanceof VoucherBalanceError) {
      console.log("✓ Unbalanced voucher rejected:", e.message);
    } else {
      throw e;
    }
  }

  // System account (P&L) must reject manual posting
  try {
    await createVoucherTx({
      date: new Date(),
      type: "JOURNAL",
      narration: "Should fail system",
      lines: [
        { accountId: cash.id, debit: 100 },
        { accountId: pl.id, credit: 100 },
      ],
    });
    throw new Error("System account posting was accepted — FAIL");
  } catch (e) {
    if (e instanceof Error && e.name === "SystemAccountError") {
      console.log("✓ System P&L posting rejected");
    } else {
      throw e;
    }
  }

  // Balanced must succeed
  const v = await createVoucherTx({
    date: new Date(),
    type: "JOURNAL",
    narration: "Opening capital — Phase 1 verify",
    lines: [
      { accountId: cash.id, debit: 100000 },
      { accountId: capital.id, credit: 100000 },
    ],
  });
  console.log("✓ Balanced voucher created:", v.id);

  const totalDebit = v.lines.reduce((s, l) => s + l.debit, 0);
  const totalCredit = v.lines.reduce((s, l) => s + l.credit, 0);
  console.log(`✓ Debit=${totalDebit} Credit=${totalCredit}`);

  console.log("\nPHASE 1 OK");
}

main()
  .catch((e) => {
    console.error("PHASE 1 FAILED", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
