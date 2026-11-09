"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { useDemo } from "@/lib/demo/store";

function SearchInner() {
  const sp = useSearchParams();
  const q = (sp.get("q") || "").trim().toLowerCase();
  const { state, ready } = useDemo();
  const hits = useMemo(() => {
    if (!q) return { parties: [], stock: [], vouchers: [] };
    return {
      parties: state.parties.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.phone || "").includes(q)
      ),
      stock: state.stockItems.filter((s) => s.name.toLowerCase().includes(q)),
      vouchers: state.vouchers.filter((v) => v.narration.toLowerCase().includes(q)),
    };
  }, [q, state]);

  if (!ready) return null;

  return (
    <div className="space-y-4">
      <PageHeader title="Search" subtitle={q ? `Results for “${q}”` : "Type in the nav search"} />
      <div className="card-panel">
        <h3 className="mb-2 font-semibold">Parties</h3>
        <ul className="space-y-1 text-sm">
          {hits.parties.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
          {!hits.parties.length ? <li className="text-[var(--muted)]">None</li> : null}
        </ul>
      </div>
      <div className="card-panel">
        <h3 className="mb-2 font-semibold">Stock</h3>
        <ul className="space-y-1 text-sm">
          {hits.stock.map((s) => (
            <li key={s.id}>{s.name}</li>
          ))}
          {!hits.stock.length ? <li className="text-[var(--muted)]">None</li> : null}
        </ul>
      </div>
      <div className="card-panel">
        <h3 className="mb-2 font-semibold">Vouchers</h3>
        <ul className="space-y-1 text-sm">
          {hits.vouchers.map((v) => (
            <li key={v.id}>
              <Link className="text-[var(--accent)] hover:underline" href={`/vouchers/${v.id}`}>
                {v.date} — {v.narration}
              </Link>
            </li>
          ))}
          {!hits.vouchers.length ? <li className="text-[var(--muted)]">None</li> : null}
        </ul>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-[var(--muted)]">Loading…</div>}>
      <SearchInner />
    </Suspense>
  );
}
