"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reverseVoucherAction } from "@/app/actions/vouchers";
import { Button } from "@/components/ui/FormField";
import { Flash } from "./Flash";
import { L } from "@/lib/labels";

export function VoucherActions({
  id,
  canReverse,
}: {
  id: string;
  canReverse: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canReverse) return null;

  return (
    <div className="flex flex-col gap-2">
      <Flash error={error} />
      <Button
        variant="danger"
        disabled={pending}
        onClick={() => {
          if (!confirm("Reverse this voucher? A reversing entry will be posted.")) return;
          setError(null);
          start(async () => {
            const res = await reverseVoucherAction(id);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.push(`/vouchers/${res.id}`);
            router.refresh();
          });
        }}
      >
        {pending ? "…" : L.delete}
      </Button>
    </div>
  );
}
