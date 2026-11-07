import type { DictEntry, LabelKey } from "@/lib/labels";
import { D } from "@/lib/labels";

/**
 * Renders a bilingual label. Visibility is controlled by `html[data-lang]`:
 * - en → English only
 * - ur → Urdu only
 * - both → English (اردو)
 */
export function Tx({
  k,
  v,
  className = "",
}: {
  k?: LabelKey;
  v?: DictEntry;
  className?: string;
}) {
  const entry = v ?? (k ? D[k] : undefined);
  if (!entry) return null;

  return (
    <span className={`i18n ${className}`.trim()}>
      <span className="i18n-en">{entry.en}</span>
      <span className="i18n-both"> (</span>
      <span className="i18n-ur">{entry.ur}</span>
      <span className="i18n-both">)</span>
    </span>
  );
}
