import type { ReactNode } from "react";

/** Wraps wide tables so they scroll horizontally on phones/tablets. */
export function TableScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`table-scroll ${className}`.trim()}>{children}</div>;
}
