"use client";

import { Button } from "@/components/ui/FormField";
import { L } from "@/lib/labels";

export function PrintButton() {
  return (
    <Button type="button" variant="secondary" className="no-print" onClick={() => window.print()}>
      {L.print}
    </Button>
  );
}
