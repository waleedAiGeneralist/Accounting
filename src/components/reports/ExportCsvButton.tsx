"use client";

import { Button } from "@/components/ui/FormField";
import { L } from "@/lib/labels";

export function ExportCsvButton({
  filename,
  rows,
}: {
  filename: string;
  rows: string[][];
}) {
  function download() {
    const csv = rows
      .map((r) =>
        r
          .map((c) => {
            const s = String(c ?? "");
            return s.includes(",") || s.includes('"') || s.includes("\n")
              ? `"${s.replace(/"/g, '""')}"`
              : s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="secondary" className="no-print" onClick={download}>
      {L.exportCsv}
    </Button>
  );
}
