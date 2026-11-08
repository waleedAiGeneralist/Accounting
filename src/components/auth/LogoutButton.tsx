"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function LogoutButton({ label = "Logout" }: { label?: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="rounded-md border border-[var(--border)] px-2.5 py-1.5 text-xs font-medium text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--fg)] disabled:opacity-60"
      onClick={() => {
        start(() => {
          void (async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            router.replace("/login");
            router.refresh();
          })();
        });
      }}
    >
      {pending ? "…" : label}
    </button>
  );
}
