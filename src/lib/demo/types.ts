export type AccountType = "ASSET" | "LIABILITY" | "EQUITY" | "INCOME" | "EXPENSE";
export type PartyType = "CUSTOMER" | "SUPPLIER" | "BOTH";
export type StockCategory = "RICE" | "KIRYANA" | "BARDANA";
export type StockUnit = "KG" | "MAUND" | "BAG" | "PCS";
export type VoucherType =
  | "CASH_RECEIPT"
  | "CASH_PAYMENT"
  | "SALE"
  | "PURCHASE"
  | "JOURNAL"
  | "EXPENSE";

export type Account = {
  id: string;
  code: string;
  name: string;
  nameUrdu: string;
  type: AccountType;
  isActive: boolean;
  isSystem: boolean;
};

export type Party = {
  id: string;
  name: string;
  phone: string | null;
  type: PartyType;
};

export type StockItem = {
  id: string;
  name: string;
  category: StockCategory;
  unit: StockUnit;
};

export type VoucherLine = {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
};

export type StockMove = {
  id: string;
  itemId: string;
  qtyIn: number;
  qtyOut: number;
  rate: number;
};

export type Voucher = {
  id: string;
  date: string; // YYYY-MM-DD
  type: VoucherType;
  narration: string;
  partyId: string | null;
  isReversal: boolean;
  reversesId: string | null;
  createdAt: string;
  lines: VoucherLine[];
  stockMoves: StockMove[];
};

export type DemoState = {
  accounts: Account[];
  parties: Party[];
  stockItems: StockItem[];
  vouchers: Voucher[];
};
