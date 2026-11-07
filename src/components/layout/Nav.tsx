"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Tx } from "@/components/i18n/Tx";
import { NavPreferenceControls } from "@/components/prefs/PreferenceControls";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import type { LabelKey } from "@/lib/labels";

const LINKS: { href: string; key: LabelKey }[] = [
  { href: "/", key: "dashboard" },
  { href: "/vouchers", key: "vouchers" },
  { href: "/parties", key: "parties" },
  { href: "/stock", key: "stock" },
  { href: "/accounts", key: "accounts" },
  { href: "/reports", key: "reports" },
  { href: "/settings", key: "settings" },
];

export function Nav() {
  const pathname = usePathname();
  const { t } = usePrefs();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="group shrink-0">
          <div className="font-display text-xl font-bold tracking-tight text-[var(--accent)] transition group-hover:opacity-90">
            <Tx k="appName" />
          </div>
          <div className="text-[11px] text-[var(--muted)]">
            <Tx k="shop" />
          </div>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
                }`}
              >
                <Tx k={l.key} />
              </Link>
            );
          })}
        </nav>

        <form onSubmit={onSearch} className="hidden sm:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--accent)] lg:w-48"
          />
        </form>

        <div className="no-print ms-auto hidden sm:block">
          <NavPreferenceControls />
        </div>

        <button
          type="button"
          className="rounded-md border border-[var(--border)] px-2 py-1 text-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] px-4 py-2 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-2 py-2 text-sm text-[var(--fg)] hover:bg-[var(--surface-2)]"
            >
              <Tx k={l.key} />
            </Link>
          ))}
          <div className="mt-2 border-t border-[var(--border)] pt-2">
            <NavPreferenceControls />
          </div>
        </div>
      ) : null}
    </header>
  );
}
