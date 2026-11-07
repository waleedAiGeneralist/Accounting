"use client";

import { Button } from "@/components/ui/FormField";
import { Tx } from "@/components/i18n/Tx";

export function PrintButton() {
  return (
    <Button type="button" variant="secondary" className="no-print" onClick={() => window.print()}>
      <Tx k="print" />
    </Button>
  );
}
