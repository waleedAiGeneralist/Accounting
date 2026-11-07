import { format, parseISO, startOfDay, endOfDay } from "date-fns";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function toDateOnly(value: string | Date): Date {
  if (typeof value === "string") {
    return startOfDay(parseISO(value.length === 10 ? value : value.slice(0, 10)));
  }
  return startOfDay(value);
}

export function rangeBounds(from?: string, to?: string) {
  const fromDate = from ? startOfDay(parseISO(from)) : undefined;
  const toDate = to ? endOfDay(parseISO(to)) : undefined;
  return { fromDate, toDate };
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? parseISO(d) : d;
  return format(date, "dd-MMM-yyyy");
}
