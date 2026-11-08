"use client";

import { useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";

export function LogoutButton({ label = "Logout" }: { label?: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => logoutAction())}
      className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
    >
      {pending ? "…" : label}
    </button>
  );
}
