/**
 * Phase 2: cash, sale, purchase, expense, journal + reverse.
 */
import { prisma } from "../src/lib/prisma";
import {
  createVoucherTx,
  reverseVoucher,
  getAccountsByCodes,
  buildSaleLines,
  buildPurchaseLines,
  appendCogsLines,
} from "../src/lib/voucher";
import { CODES } from "../src/lib/accounts";

async function main() {
  const map = await getAccountsByCodes([
    CODES.CASH,
    CODES.BANK,
    CODES.RECEIVABLES,
    CODES.PAYABLES,
    CODES.RICE_SALE,
    CODES.RICE_PURCHASE,
    CODES.RICE_STOCK,
    CODES.DISCOUNT_GIVEN,
    CODES.DISCOUNT_RECEIVED,
    CODES.RENT,
    CODES.CAPITAL,
  ]);

  const party = await prisma.party.findFirst({
    where: { type: { in: ["CUSTOMER", "BOTH"] } },
  });
  const supplier = await prisma.party.findFirst({
    where: { type: { in: ["SUPPLIER", "BOTH"] } },
  });
  const item = await prisma.stockItem.findFirst({ where: { category: "RICE" } });
  if (!party || !supplier || !item) throw new Error("Seed parties/items missing");

  const receipt = await createVoucherTx({
    date: new Date(),
    type: "CASH_RECEIPT",
    narration: "Phase2 cash receipt",
    partyId: party.id,
    lines: [
      { accountId: map.get(CODES.CASH)!.id, debit: 5000 },
      { accountId: map.get(CODES.RECEIVABLES)!.id, credit: 5000 },
    ],
  });
  console.log("✓ Cash receipt", receipt.id);

  // Purchase first so stock has cost basis
  const purchase = await createVoucherTx({
    date: new Date(),
    type: "PURCHASE",
    narration: "Phase2 purchase",
    partyId: supplier.id,
    lines: buildPurchaseLines({
      cashOrBankId: map.get(CODES.CASH)!.id,
      stockAccountId: map.get(CODES.RICE_STOCK)!.id,
      payablesId: map.get(CODES.PAYABLES)!.id,
      discountReceivedId: map.get(CODES.DISCOUNT_RECEIVED)!.id,
      amount: 20000,
      discount: 0,
      isCash: false,
    }),
    stockMoves: [{ itemId: item.id, qtyIn: 20, rate: 1000 }],
  });
  console.log("✓ Purchase", purchase.id);

  const sale = await createVoucherTx({
    date: new Date(),
    type: "SALE",
    narration: "Phase2 sale",
    partyId: party.id,
    lines: appendCogsLines(
      buildSaleLines({
        cashOrBankId: map.get(CODES.CASH)!.id,
        saleAccountId: map.get(CODES.RICE_SALE)!.id,
        receivablesId: map.get(CODES.RECEIVABLES)!.id,
        discountGivenId: map.get(CODES.DISCOUNT_GIVEN)!.id,
        amount: 12000,
        discount: 200,
        isCash: true,
      }),
      {
        cogsAccountId: map.get(CODES.RICE_PURCHASE)!.id,
        stockAccountId: map.get(CODES.RICE_STOCK)!.id,
        cost: 10000, // 10 @ 1000
      }
    ),
    stockMoves: [{ itemId: item.id, qtyOut: 10, rate: 1000 }],
  });
  console.log("✓ Sale", sale.id);

  const expense = await createVoucherTx({
    date: new Date(),
    type: "EXPENSE",
    narration: "Phase2 rent",
    lines: [
      { accountId: map.get(CODES.RENT)!.id, debit: 15000 },
      { accountId: map.get(CODES.CASH)!.id, credit: 15000 },
    ],
  });
  console.log("✓ Expense", expense.id);

  const journal = await createVoucherTx({
    date: new Date(),
    type: "JOURNAL",
    narration: "Phase2 journal capital top-up",
    lines: [
      { accountId: map.get(CODES.BANK)!.id, debit: 50000 },
      { accountId: map.get(CODES.CAPITAL)!.id, credit: 50000 },
    ],
  });
  console.log("✓ Journal", journal.id);

  const rev = await reverseVoucher(expense.id);
  console.log("✓ Reversed expense →", rev.id);

  const stock = await prisma.stockMovement.aggregate({
    where: { itemId: item.id },
    _sum: { qtyIn: true, qtyOut: true },
  });
  console.log("✓ Stock moves in/out", stock._sum);

  console.log("\nPHASE 2 OK");
}

main()
  .catch((e) => {
    console.error("PHASE 2 FAILED", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
