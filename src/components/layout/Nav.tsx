"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { L } from "@/lib/labels";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "/", label: L.dashboard },
  { href: "/vouchers", label: L.vouchers },
  { href: "/parties", label: L.parties },
  { href: "/stock", label: L.stock },
  { href: "/accounts", label: L.accounts },
  { href: "/reports", label: L.reports },
  { href: "/settings", label: L.settings },
];

export function Nav() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const preferDark = stored === "dark";
    setDark(preferDark);
    document.documentElement.classList.toggle("dark", preferDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="group shrink-0">
          <div className="font-display text-xl font-bold tracking-tight text-[var(--accent)] transition group-hover:opacity-90">
            {L.appName}
          </div>
          <div className="text-[11px] text-[var(--muted)] urdu">{L.shop}</div>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {LINKS.map((l) => {
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
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
                {l.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={onSearch} className="hidden sm:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={L.search}
            className="w-40 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--accent)] lg:w-56"
          />
        </form>

        <button
          type="button"
          onClick={toggleDark}
          className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--surface-2)]"
          aria-label={L.darkMode}
        >
          {dark ? "☀" : "☾"}
        </button>

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
              {l.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
