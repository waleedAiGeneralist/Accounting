"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { roundMoney } from "@/lib/money";
import { createSeedState } from "./seed";
import { accountByCode } from "./compute";
import type {
  DemoState,
  Party,
  PartyType,
  StockCategory,
  StockItem,
  StockUnit,
  Voucher,
  VoucherLine,
  VoucherType,
} from "./types";

const STORAGE_KEY = "hk-demo-ledger-v2-petty";

type DemoApi = {
  ready: boolean;
  state: DemoState;
  resetDemo: () => void;
  addParty: (input: { name: string; phone?: string; type: PartyType }) => void;
  addStock: (input: {
    name: string;
    category: StockCategory;
    unit: StockUnit;
  }) => void;
  addVoucher: (input: {
    date: string;
    type: VoucherType;
    narration: string;
    partyId?: string | null;
    project?: string | null;
    postRef?: string | null;
    head?: string | null;
    sno?: string | null;
    lines: Array<{ accountId: string; debit?: number; credit?: number }>;
    stockMoves?: Array<{
      itemId: string;
      qtyIn?: number;
      qtyOut?: number;
      rate: number;
    }>;
  }) => { ok: true; id: string } | { ok: false; error: string };
  reverseVoucher: (id: string) => { ok: true; id: string } | { ok: false; error: string };
  exportJson: () => string;
  importJson: (raw: string) => { ok: true } | { ok: false; error: string };
};

const DemoContext = createContext<DemoApi | null>(null);

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function persist(state: DemoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed?.accounts?.length) {
        if (!parsed.projects) parsed.projects = [];
        parsed.vouchers = (parsed.vouchers ?? []).map((v) => ({
          ...v,
          project: v.project ?? null,
          postRef: v.postRef ?? null,
          head: v.head ?? null,
          sno: v.sno ?? null,
        }));
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return createSeedState();
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<DemoState>(() => createSeedState());

  useEffect(() => {
    setState(load());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    persist(state);
  }, [state, ready]);

  const resetDemo = useCallback(() => {
    const next = createSeedState();
    setState(next);
    persist(next);
  }, []);

  const addParty = useCallback(
    (input: { name: string; phone?: string; type: PartyType }) => {
      const party: Party = {
        id: uid("pty"),
        name: input.name.trim(),
        phone: input.phone?.trim() || null,
        type: input.type,
      };
      setState((s) => ({ ...s, parties: [...s.parties, party] }));
    },
    []
  );

  const addStock = useCallback(
    (input: { name: string; category: StockCategory; unit: StockUnit }) => {
      const item: StockItem = {
        id: uid("stk"),
        name: input.name.trim(),
        category: input.category,
        unit: input.unit,
      };
      setState((s) => ({ ...s, stockItems: [...s.stockItems, item] }));
    },
    []
  );

  const addVoucher = useCallback(
    (input: {
      date: string;
      type: VoucherType;
      narration: string;
      partyId?: string | null;
      project?: string | null;
      postRef?: string | null;
      head?: string | null;
      sno?: string | null;
      lines: Array<{ accountId: string; debit?: number; credit?: number }>;
      stockMoves?: Array<{
        itemId: string;
        qtyIn?: number;
        qtyOut?: number;
        rate: number;
      }>;
    }) => {
      const lines: VoucherLine[] = input.lines.map((l) => ({
        id: uid("ln"),
        accountId: l.accountId,
        debit: roundMoney(l.debit ?? 0),
        credit: roundMoney(l.credit ?? 0),
      }));
      const dr = roundMoney(lines.reduce((s, l) => s + l.debit, 0));
      const cr = roundMoney(lines.reduce((s, l) => s + l.credit, 0));
      if (dr <= 0 || dr !== cr) {
        return { ok: false as const, error: "Voucher must balance (Dr = Cr)" };
      }
      const voucher: Voucher = {
        id: uid("vch"),
        date: input.date,
        type: input.type,
        narration: input.narration,
        partyId: input.partyId ?? null,
        project: input.project ?? null,
        postRef: input.postRef ?? null,
        head: input.head ?? null,
        sno: input.sno ?? null,
        isReversal: false,
        reversesId: null,
        createdAt: new Date().toISOString(),
        lines,
        stockMoves: (input.stockMoves ?? []).map((m) => ({
          id: uid("mv"),
          itemId: m.itemId,
          qtyIn: m.qtyIn ?? 0,
          qtyOut: m.qtyOut ?? 0,
          rate: m.rate,
        })),
      };
      setState((s) => ({ ...s, vouchers: [...s.vouchers, voucher] }));
      return { ok: true as const, id: voucher.id };
    },
    []
  );

  const reverseVoucher = useCallback((id: string) => {
    let result: { ok: true; id: string } | { ok: false; error: string } = {
      ok: false,
      error: "Not found",
    };
    setState((s) => {
      const original = s.vouchers.find((v) => v.id === id);
      if (!original) return s;
      if (original.isReversal) {
        result = { ok: false, error: "Cannot reverse a reversal" };
        return s;
      }
      if (s.vouchers.some((v) => v.reversesId === id)) {
        result = { ok: false, error: "Already reversed" };
        return s;
      }
      const rev: Voucher = {
        id: uid("vch"),
        date: new Date().toISOString().slice(0, 10),
        type: original.type,
        narration: `Reversal of ${original.id}: ${original.narration}`,
        partyId: original.partyId,
        project: original.project,
        postRef: original.postRef,
        head: original.head,
        sno: original.sno,
        isReversal: true,
        reversesId: original.id,
        createdAt: new Date().toISOString(),
        lines: original.lines.map((l) => ({
          id: uid("ln"),
          accountId: l.accountId,
          debit: l.credit,
          credit: l.debit,
        })),
        stockMoves: original.stockMoves.map((m) => ({
          id: uid("mv"),
          itemId: m.itemId,
          qtyIn: m.qtyOut,
          qtyOut: m.qtyIn,
          rate: m.rate,
        })),
      };
      result = { ok: true, id: rev.id };
      return { ...s, vouchers: [...s.vouchers, rev] };
    });
    return result;
  }, []);

  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state]);

  const importJson = useCallback((raw: string) => {
    try {
      const parsed = JSON.parse(raw) as DemoState;
      if (!parsed.accounts?.length) {
        return { ok: false as const, error: "Invalid backup" };
      }
      if (!parsed.projects) parsed.projects = [];
      parsed.vouchers = (parsed.vouchers ?? []).map((v) => ({
        ...v,
        project: v.project ?? null,
        postRef: v.postRef ?? null,
        head: v.head ?? null,
        sno: v.sno ?? null,
      }));
      setState(parsed);
      persist(parsed);
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Invalid JSON" };
    }
  }, []);

  const api = useMemo<DemoApi>(
    () => ({
      ready,
      state,
      resetDemo,
      addParty,
      addStock,
      addVoucher,
      reverseVoucher,
      exportJson,
      importJson,
    }),
    [
      ready,
      state,
      resetDemo,
      addParty,
      addStock,
      addVoucher,
      reverseVoucher,
      exportJson,
      importJson,
    ]
  );

  return <DemoContext.Provider value={api}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoApi {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}

export function useAccount(code: string) {
  const { state } = useDemo();
  return accountByCode(state.accounts, code);
}
