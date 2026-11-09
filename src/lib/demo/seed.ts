import type { DemoState } from "./types";

function id(prefix: string, n: number) {
  return `${prefix}_${n}`;
}

export function createSeedState(): DemoState {
  const accounts = [
    { code: "1001", name: "Cash in Hand", nameUrdu: "نقد رقم", type: "ASSET" as const },
    { code: "1002", name: "Cash at Bank/Easypaisa/JazzCash", nameUrdu: "بینک / ایزی پیسہ", type: "ASSET" as const },
    { code: "1003", name: "Customer Receivables", nameUrdu: "گاہکوں سے وصولی", type: "ASSET" as const },
    { code: "1004", name: "Advance to Suppliers", nameUrdu: "سپلائر کو ایڈوانس", type: "ASSET" as const },
    { code: "1005", name: "Rice Stock", nameUrdu: "چاول سٹاک", type: "ASSET" as const },
    { code: "1006", name: "Kiryana Stock", nameUrdu: "کریانہ سٹاک", type: "ASSET" as const },
    { code: "1007", name: "Bardana Stock", nameUrdu: "بردانه سٹاک", type: "ASSET" as const },
    { code: "2001", name: "Supplier Payables", nameUrdu: "سپلائر واجب الادا", type: "LIABILITY" as const },
    { code: "2003", name: "Customer Advance", nameUrdu: "گاہک ایڈوانس", type: "LIABILITY" as const },
    { code: "3001", name: "Owner Capital", nameUrdu: "مالک کا سرمایہ", type: "EQUITY" as const },
    { code: "3002", name: "Owner Drawings", nameUrdu: "مالک کی نکاسی", type: "EQUITY" as const },
    { code: "3003", name: "Profit & Loss", nameUrdu: "منافع و نقصان", type: "EQUITY" as const, isSystem: true },
    { code: "4001", name: "Rice Sale", nameUrdu: "چاول فروخت", type: "INCOME" as const },
    { code: "4002", name: "Kiryana Sale", nameUrdu: "کریانہ فروخت", type: "INCOME" as const },
    { code: "5001", name: "Rice Purchase", nameUrdu: "چاول خریداری", type: "EXPENSE" as const },
    { code: "5002", name: "Kiryana Purchase", nameUrdu: "کریانہ خریداری", type: "EXPENSE" as const },
    { code: "5004", name: "Shop Rent", nameUrdu: "دکان کرایہ", type: "EXPENSE" as const },
    { code: "5005", name: "Labour/Munshi Salary", nameUrdu: "مزدوری / منشی", type: "EXPENSE" as const },
    { code: "5006", name: "Electricity/Mobile/Tea", nameUrdu: "بجلی / موبائل", type: "EXPENSE" as const },
  ].map((a, i) => ({
    id: id("acc", i + 1),
    code: a.code,
    name: a.name,
    nameUrdu: a.nameUrdu,
    type: a.type,
    isActive: true,
    isSystem: Boolean((a as { isSystem?: boolean }).isSystem),
  }));

  const byCode = Object.fromEntries(accounts.map((a) => [a.code, a]));

  const parties = [
    { name: "Ahmed Traders", phone: "03001234567", type: "CUSTOMER" as const },
    { name: "Karachi Rice Mills", phone: "03219876543", type: "SUPPLIER" as const },
    { name: "Bismillah Store", phone: "03331234567", type: "BOTH" as const },
  ].map((p, i) => ({ id: id("pty", i + 1), ...p }));

  const stockItems = [
    { name: "Super Basmati", category: "RICE" as const, unit: "KG" as const },
    { name: "Irri-6", category: "RICE" as const, unit: "MAUND" as const },
    { name: "Sugar", category: "KIRYANA" as const, unit: "KG" as const },
    { name: "Cooking Oil 1L", category: "KIRYANA" as const, unit: "PCS" as const },
    { name: "Gunny Bag", category: "BARDANA" as const, unit: "BAG" as const },
  ].map((s, i) => ({ id: id("stk", i + 1), ...s }));

  const today = new Date().toISOString().slice(0, 10);
  const vouchers = [
    {
      id: id("vch", 1),
      date: today,
      type: "JOURNAL" as const,
      narration: "Opening capital & cash",
      partyId: null,
      isReversal: false,
      reversesId: null,
      createdAt: new Date().toISOString(),
      lines: [
        { id: id("ln", 1), accountId: byCode["1001"].id, debit: 200000, credit: 0 },
        { id: id("ln", 2), accountId: byCode["3001"].id, debit: 0, credit: 200000 },
      ],
      stockMoves: [],
    },
    {
      id: id("vch", 2),
      date: today,
      type: "SALE" as const,
      narration: "Sample rice sale — Ahmed Traders",
      partyId: parties[0].id,
      isReversal: false,
      reversesId: null,
      createdAt: new Date().toISOString(),
      lines: [
        { id: id("ln", 3), accountId: byCode["1003"].id, debit: 45000, credit: 0 },
        { id: id("ln", 4), accountId: byCode["4001"].id, debit: 0, credit: 45000 },
      ],
      stockMoves: [
        {
          id: id("mv", 1),
          itemId: stockItems[0].id,
          qtyIn: 0,
          qtyOut: 50,
          rate: 900,
        },
      ],
    },
  ];

  return { accounts, parties, stockItems, vouchers };
}
