"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Tx } from "@/components/i18n/Tx";
import { NavPreferenceControls } from "@/components/prefs/PreferenceControls";
import { usePrefs } from "@/components/prefs/PreferencesProvider";
import type { LabelKey } from "@/lib/labels";

const LINKS: { href: string; key: LabelKey }[] = [
  { href: "/", key: "dashboard" },
  { href: "/reports/petty-cash", key: "pettyCash" },
  { href: "/vouchers", key: "vouchers" },
  { href: "/parties", key: "parties" },
  { href: "/accounts", key: "accounts" },
  { href: "/reports", key: "reports" },
  { href: "/settings", key: "settings" },
];

export function Nav() {
  const pathname = usePathname();
  const { t } = usePrefs();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  // Close drawer on route change / resize to desktop
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setOpen(false);
    window.location.href = `/search?q=${encodeURIComponent(q.trim())}`;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--nav-bg)]/95 pt-[env(safe-area-inset-top,0)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-[var(--page-pad-x)] py-2.5 sm:gap-3 sm:py-3">
        <Link href="/" className="group min-w-0 shrink">
          <div className="font-display truncate text-lg font-bold tracking-tight text-[var(--accent)] transition group-hover:opacity-90 sm:text-xl">
            <Tx k="appName" />
          </div>
          <div className="hidden text-[11px] text-[var(--muted)] sm:block">
            <Tx k="shop" />
          </div>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto lg:flex">
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded-md px-2 py-1.5 text-xs font-medium transition xl:px-2.5 ${
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

        {/* Tablet: compact icon links */}
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex lg:hidden">
          {LINKS.slice(0, 5).map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-md px-2 py-1.5 text-[11px] font-medium transition ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <Tx k={l.key} />
              </Link>
            );
          })}
        </nav>

        <form onSubmit={onSearch} className="ms-auto hidden md:block">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("search")}
            className="h-9 w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2.5 text-sm outline-none focus:border-[var(--accent)] lg:w-40 xl:w-52"
          />
        </form>

        <div className="no-print hidden shrink-0 items-center gap-2 md:flex">
          <NavPreferenceControls />
        </div>

        <button
          type="button"
          className="ms-auto inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-lg md:ms-0 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="mobile-nav-sheet md:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-0 top-[calc(env(safe-area-inset-top,0px)+3.25rem)] z-50 max-h-[calc(100dvh-3.5rem)] overflow-y-auto border-b border-[var(--border)] bg-[var(--nav-bg)] px-[var(--page-pad-x)] py-3 shadow-lg">
            <form onSubmit={onSearch} className="mb-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("search")}
                className="h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-base outline-none focus:border-[var(--accent)]"
              />
            </form>

            <div className="mb-3 grid grid-cols-2 gap-2">
              {LINKS.map((l) => {
                const active =
                  l.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(l.href);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-md px-3 py-3 text-center text-sm font-semibold transition ${
                      active
                        ? "bg-[var(--accent)] text-white"
                        : "bg-[var(--surface-2)] text-[var(--fg)]"
                    }`}
                  >
                    <Tx k={l.key} />
                  </Link>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-[var(--border)] pt-3">
              <NavPreferenceControls compact={false} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
