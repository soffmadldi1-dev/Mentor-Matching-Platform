import type { FieldSlug } from "@/lib/fields";

// 4회차·60분 기준 권장 가격 구간 (CLAUDE.md 9장 ②)
const BASE_RANGE: Record<FieldSlug, [number, number]> = {
  career: [150_000, 250_000],
  tourism: [150_000, 250_000],
  venture: [300_000, 400_000],
};

/** 회차 수·회당 시간에 비례해 조정한 권장 가격 구간 (5천 원 단위 반올림) */
export function recommendedPriceRange(
  field: FieldSlug,
  sessionCount: number,
  minutes: number,
): { min: number; max: number } {
  const [baseMin, baseMax] = BASE_RANGE[field];
  const ratio = (sessionCount / 4) * (minutes / 60);
  const round = (n: number) => Math.round(n / 5_000) * 5_000;
  return { min: round(baseMin * ratio), max: round(baseMax * ratio) };
}

/** 150000 → "15만 원", 75000 → "7.5만 원", 12345 → "12,345원" */
export function formatWon(amount: number): string {
  if (amount >= 10_000 && amount % 1_000 === 0) {
    const man = amount / 10_000;
    const text = Number.isInteger(man) ? String(man) : man.toFixed(1).replace(/\.0$/, "");
    return `${text}만 원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function formatRange(range: { min: number; max: number }): string {
  return `${formatWon(range.min)}~${formatWon(range.max)}`;
}
