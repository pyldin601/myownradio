export function formatNumber(value: number | string | null | undefined) {
  if (value === null || typeof value === "undefined") {
    return "";
  }

  const numeric = typeof value === "number" ? value : Number(value);

  if (Number.isFinite(numeric)) {
    return numeric.toLocaleString("en-US");
  }

  return String(value);
}
