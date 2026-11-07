export type LangMode = "en" | "ur" | "both";
export type ThemeMode = "light" | "dark";

export type DictEntry = { en: string; ur: string };

function e(en: string, ur: string): DictEntry {
  return { en, ur };
}

/** Label dictionary — English + Urdu */
export const D = {
  appName: e("Hisab Kitab", "حساب کتاب"),
  shop: e("Rice & Kiryana", "چاول و کریانہ"),
  dashboard: e("Dashboard", "ڈیش بورڈ"),
  vouchers: e("Vouchers", "واؤچرز"),
  cashReceipt: e("Cash Receipt", "نقد وصولی"),
  cashPayment: e("Cash Payment", "نقد ادائیگی"),
  sale: e("Sale", "فروخت"),
  purchase: e("Purchase", "خریداری"),
  expense: e("Expense", "اخراجات"),
  journal: e("Journal", "جرنل"),
  parties: e("Parties", "پارٹیز"),
  stock: e("Stock", "سٹاک"),
  accounts: e("Accounts", "اکاؤنٹس"),
  reports: e("Reports", "رپورٹس"),
  ledger: e("Ledger", "کھاتہ"),
  trialBalance: e("Trial Balance", "ٹرائل بیلنس"),
  profitLoss: e("Profit & Loss", "منافع و نقصان"),
  balanceSheet: e("Balance Sheet", "بیلنس شیٹ"),
  receivables: e("Receivables", "وصولیاں"),
  payables: e("Payables", "ادائگیاں"),
  stockReport: e("Stock Report", "سٹاک رپورٹ"),
  cashBook: e("Daily Cash Book", "روزانہ کیش بک"),
  settings: e("Settings", "ترتیبات"),
  save: e("Save", "محفوظ"),
  cancel: e("Cancel", "منسوخ"),
  delete: e("Delete / Reverse", "حذف / ریورس"),
  edit: e("Edit", "ترمیم"),
  date: e("Date", "تاریخ"),
  party: e("Party", "پارٹی"),
  narration: e("Narration", "تفصیل"),
  amount: e("Amount", "رقم"),
  debit: e("Debit", "ڈیبٹ"),
  credit: e("Credit", "کریڈٹ"),
  account: e("Account", "اکاؤنٹ"),
  item: e("Item", "آئٹم"),
  qty: e("Qty", "مقدار"),
  unit: e("Unit", "یونٹ"),
  rate: e("Rate", "ریٹ"),
  discount: e("Discount", "ڈسکاؤنٹ"),
  total: e("Total", "کل"),
  cash: e("Cash", "نقد"),
  creditSale: e("Credit (Udhar)", "ادھار"),
  bank: e("Bank / JazzCash", "بینک / جاز کیش"),
  from: e("From", "سے"),
  to: e("To", "تک"),
  print: e("Print", "پرنٹ"),
  exportCsv: e("Export CSV", "CSV ایکسپورٹ"),
  search: e("Search", "تلاش"),
  darkMode: e("Dark", "ڈارک"),
  lightMode: e("Light", "برائیٹ"),
  theme: e("Theme", "تھیم"),
  language: e("Language", "زبان"),
  english: e("English", "انگریزی"),
  urdu: e("Urdu", "اردو"),
  bilingual: e("Both (EN + Urdu)", "دونوں (انگریزی + اردو)"),
  backup: e("Backup DB", "بیک اپ"),
  restore: e("Restore DB", "ریسٹور"),
  whatsapp: e("WhatsApp Statement", "واٹس ایپ سٹیٹمنٹ"),
  preferences: e("Preferences", "ترجیحات"),
  themeHint: e("Choose light or dark appearance", "روشن یا تاریک ظاہری شکل چنیں"),
  languageHint: e("Show English, Urdu, or both", "انگریزی، اردو، یا دونوں دکھائیں"),
  type: e("Type", "قسم"),
  status: e("Status", "حالت"),
  opening: e("Opening", "ابتدائی"),
  balance: e("Balance", "بیلنس"),
  payment: e("Payment", "ادائیگی"),
  apply: e("Apply", "لگائیں"),
  viewAll: e("View all", "سب دیکھیں"),
  recentVouchers: e("Recent vouchers", "حالیہ واؤچرز"),
  todaySales: e("Today's Sales", "آج کی فروخت"),
  active: e("Active", "فعال"),
  reversed: e("Reversed", "ریورس"),
  reversal: e("Reversal", "ریورسل"),
  category: e("Category", "زمرہ"),
  value: e("Value", "قیمت"),
  phone: e("Phone", "فون"),
  name: e("Name", "نام"),
  statement: e("Statement", "سٹیٹمنٹ"),
  customer: e("Customer", "گاہک"),
  supplier: e("Supplier", "سپلائر"),
  both: e("Both", "دونوں"),
  localFirst: e("local-first", "مقامی"),
} as const;

export type LabelKey = keyof typeof D;

/** Format a dictionary entry for the active language mode. */
export function formatEntry(entry: DictEntry, lang: LangMode = "en"): string {
  if (lang === "ur") return entry.ur;
  if (lang === "both") return `${entry.en} (${entry.ur})`;
  return entry.en;
}

export function t(key: LabelKey, lang: LangMode = "en"): string {
  return formatEntry(D[key], lang);
}

/** @deprecated Prefer <Tx /> or t() — bilingual string for metadata/fallbacks */
export const L: Record<LabelKey, string> = Object.fromEntries(
  (Object.keys(D) as LabelKey[]).map((k) => [k, formatEntry(D[k], "both")])
) as Record<LabelKey, string>;

export const VOUCHER_TYPE_KEYS: Record<string, LabelKey> = {
  CASH_RECEIPT: "cashReceipt",
  CASH_PAYMENT: "cashPayment",
  SALE: "sale",
  PURCHASE: "purchase",
  JOURNAL: "journal",
  EXPENSE: "expense",
};

/** Legacy string map (bilingual) for places still needing plain strings. */
export const VOUCHER_TYPE_LABEL: Record<string, string> = {
  CASH_RECEIPT: L.cashReceipt,
  CASH_PAYMENT: L.cashPayment,
  SALE: L.sale,
  PURCHASE: L.purchase,
  JOURNAL: L.journal,
  EXPENSE: L.expense,
};
