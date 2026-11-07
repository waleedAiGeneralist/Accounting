/** Round to 2 decimal places (PKR paisa). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatPKR(value: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function nearlyEqual(a: number, b: number, epsilon = 0.005): boolean {
  return Math.abs(a - b) < epsilon;
}
