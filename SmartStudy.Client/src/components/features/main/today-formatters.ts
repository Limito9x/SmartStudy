export function asNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatDecimal(
  value: number | string | null | undefined,
  fractionDigits = 1,
): string {
  return asNumber(value).toLocaleString("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  });
}

export function formatPercent(
  value: number | string | null | undefined,
): string {
  return `${formatDecimal(value, 0)}%`;
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return "--:--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayMonth(value: string | null | undefined): {
  day: string;
  month: string;
} {
  if (!value) return { day: "--", month: "--" };

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { day: "--", month: "--" };

  return {
    day: date.toLocaleDateString("vi-VN", { day: "2-digit" }),
    month: date.toLocaleDateString("vi-VN", { month: "2-digit" }),
  };
}
