import { PrismaClient, AccountType, StockCategory, StockUnit, PartyType } from "@prisma/client";

const prisma = new PrismaClient();

const CHART_OF_ACCOUNTS: Array<{
  code: string;
  name: string;
  nameUrdu: string;
  type: AccountType;
  isSystem?: boolean;
}> = [
  // Assets
  { code: "1001", name: "Cash in Hand", nameUrdu: "نقد رقم", type: "ASSET" },
  { code: "1002", name: "Cash at Bank/Easypaisa/JazzCash", nameUrdu: "بینک / ایزی پیسہ / جاز کیش", type: "ASSET" },
  { code: "1003", name: "Customer Receivables", nameUrdu: "گاہکوں سے وصولی", type: "ASSET" },
  { code: "1004", name: "Advance to Suppliers", nameUrdu: "سپلائر کو ایڈوانس", type: "ASSET" },
  { code: "1005", name: "Rice Stock", nameUrdu: "چاول سٹاک", type: "ASSET" },
  { code: "1006", name: "Kiryana Stock", nameUrdu: "کریانہ سٹاک", type: "ASSET" },
  { code: "1007", name: "Bardana Stock", nameUrdu: "بردانه سٹاک", type: "ASSET" },
  { code: "1008", name: "Furniture & Equipment", nameUrdu: "فرنیچر اور سامان", type: "ASSET" },
  { code: "1009", name: "Shop Advance/Security", nameUrdu: "دکان ایڈوانس / سیکیورٹی", type: "ASSET" },
  // Liabilities
  { code: "2001", name: "Supplier Payables", nameUrdu: "سپلائر واجب الادا", type: "LIABILITY" },
  { code: "2002", name: "Bank Loan/Udhar", nameUrdu: "بینک قرض / ادھار", type: "LIABILITY" },
  { code: "2003", name: "Customer Advance", nameUrdu: "گاہک ایڈوانس", type: "LIABILITY" },
  // Equity
  { code: "3001", name: "Owner Capital", nameUrdu: "مالک کا سرمایہ", type: "EQUITY" },
  { code: "3002", name: "Owner Drawings", nameUrdu: "مالک کی نکاسی", type: "EQUITY" },
  { code: "3003", name: "Profit & Loss", nameUrdu: "منافع و نقصان", type: "EQUITY", isSystem: true },
  { code: "3004", name: "Opening Balance Equity", nameUrdu: "ابتدائی بیلنس ایکوٹی", type: "EQUITY" },
  // Income
  { code: "4001", name: "Rice Sale", nameUrdu: "چاول فروخت", type: "INCOME" },
  { code: "4002", name: "Kiryana Sale", nameUrdu: "کریانہ فروخت", type: "INCOME" },
  { code: "4003", name: "Bardana/Gunny Bag Sale", nameUrdu: "بردانه / بوری فروخت", type: "INCOME" },
  { code: "4004", name: "Discount Received", nameUrdu: "موصول ڈسکاؤنٹ", type: "INCOME" },
  // Expenses
  { code: "5001", name: "Rice Purchase", nameUrdu: "چاول خریداری", type: "EXPENSE" },
  { code: "5002", name: "Kiryana Purchase", nameUrdu: "کریانہ خریداری", type: "EXPENSE" },
  { code: "5003", name: "Freight/Transport/Bardana Loading", nameUrdu: "کرایہ / ٹرانسپورٹ / بردانه لوڈنگ", type: "EXPENSE" },
  { code: "5004", name: "Shop Rent", nameUrdu: "دکان کرایہ", type: "EXPENSE" },
  { code: "5005", name: "Labour/Munshi Salary", nameUrdu: "مزدوری / منشی تنخواہ", type: "EXPENSE" },
  { code: "5006", name: "Electricity/Mobile/Tea", nameUrdu: "بجلی / موبائل / چائے", type: "EXPENSE" },
  { code: "5007", name: "Wastage/Shortage", nameUrdu: "ضائع / کمی", type: "EXPENSE" },
  { code: "5008", name: "Discount Given", nameUrdu: "دیا گیا ڈسکاؤنٹ", type: "EXPENSE" },
];

const SAMPLE_STOCK: Array<{
  name: string;
  category: StockCategory;
  unit: StockUnit;
}> = [
  { name: "Super Basmati", category: "RICE", unit: "KG" },
  { name: "Irri-6", category: "RICE", unit: "MAUND" },
  { name: "Sugar", category: "KIRYANA", unit: "KG" },
  { name: "Cooking Oil 1L", category: "KIRYANA", unit: "PCS" },
  { name: "Gunny Bag", category: "BARDANA", unit: "BAG" },
];

const SAMPLE_PARTIES: Array<{
  name: string;
  phone: string;
  type: PartyType;
}> = [
  { name: "Ahmed Traders", phone: "03001234567", type: "CUSTOMER" },
  { name: "Karachi Rice Mills", phone: "03219876543", type: "SUPPLIER" },
  { name: "Bismillah Store", phone: "03331234567", type: "BOTH" },
];

async function main() {
  console.log("Seeding chart of accounts...");
  for (const account of CHART_OF_ACCOUNTS) {
    await prisma.account.upsert({
      where: { code: account.code },
      update: {
        name: account.name,
        nameUrdu: account.nameUrdu,
        type: account.type,
        isSystem: account.isSystem ?? false,
        isActive: true,
      },
      create: {
        code: account.code,
        name: account.name,
        nameUrdu: account.nameUrdu,
        type: account.type,
        isSystem: account.isSystem ?? false,
      },
    });
  }

  console.log("Seeding sample stock items...");
  const existingItems = await prisma.stockItem.count();
  if (existingItems === 0) {
    await prisma.stockItem.createMany({ data: SAMPLE_STOCK });
  }

  console.log("Seeding sample parties...");
  const existingParties = await prisma.party.count();
  if (existingParties === 0) {
    await prisma.party.createMany({ data: SAMPLE_PARTIES });
  }

  const counts = {
    accounts: await prisma.account.count(),
    parties: await prisma.party.count(),
    stockItems: await prisma.stockItem.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
