// 멘토 등급 (성과 기반) — 멘토 입구 개편 v1, CLAUDE.md 10장
// 입력: 입구, 판매 수, 평균 평점, 리포트 제출률 → 출력: 등급, 수습 여부, 다음 등급까지 남은 조건

export type MentorTrack = "A" | "B" | "C"; // A 셀프 등록 · B 경력 인증 · C 출시 캠프
export type MentorGrade = "registered" | "certified" | "master";

export const TRACK_LABELS: Record<MentorTrack, string> = {
  A: "셀프 등록",
  B: "경력 인증",
  C: "출시 캠프",
};

export const GRADE_LABELS: Record<MentorGrade, string> = {
  registered: "등록 멘토",
  certified: "인증 멘토",
  master: "마스터 멘토",
};

export const GRADE_RULES = {
  probationSales: 3, // 첫 3건 판매(신청 확정) 동안 수습
  certified: { sales: 3, avgRating: 4.5, reportRate: 0.9 },
  master: { sales: 20, avgRating: 4.7 },
} as const;

const ORDER: MentorGrade[] = ["registered", "certified", "master"];
export const gradeRank = (g: MentorGrade) => ORDER.indexOf(g);

export type GradeInput = {
  track: MentorTrack;
  sales: number;
  avgRating: number | null; // 후기 없으면 null
  reportRate: number | null; // 0~1, 제출할 리포트가 없으면 null(조건 충족으로 본다)
};

export type GradeResult = {
  grade: MentorGrade;
  base: MentorGrade; // 입구 승인 시 받은 등급
  probation: boolean;
  next: { grade: MentorGrade; remaining: string[]; progress: number } | null;
};

/** 입구별 승인 등급: A → 등록, B·C → 인증 */
export function baseGrade(track: MentorTrack): MentorGrade {
  return track === "A" ? "registered" : "certified";
}

const pct = (n: number) => `${Math.round(n * 100)}%`;

function certifiedGap(i: GradeInput) {
  const r = GRADE_RULES.certified;
  const remaining: string[] = [];
  const parts: number[] = [];
  if (i.sales < r.sales) remaining.push(`판매 ${r.sales - i.sales}건 더 (현재 ${i.sales}/${r.sales}건)`);
  parts.push(Math.min(1, i.sales / r.sales));
  if (i.avgRating === null || i.avgRating < r.avgRating)
    remaining.push(`평균 평점 ${r.avgRating} 이상 (현재 ${i.avgRating === null ? "후기 없음" : i.avgRating.toFixed(1)})`);
  parts.push(i.avgRating === null ? 0 : Math.min(1, i.avgRating / r.avgRating));
  if (i.reportRate !== null && i.reportRate < r.reportRate)
    remaining.push(`회차 리포트 제출률 ${pct(r.reportRate)} 이상 (현재 ${pct(i.reportRate)})`);
  parts.push(i.reportRate === null ? 1 : Math.min(1, i.reportRate / r.reportRate));
  return { remaining, progress: parts.reduce((a, b) => a + b, 0) / parts.length };
}

function masterGap(i: GradeInput) {
  const r = GRADE_RULES.master;
  const remaining: string[] = [];
  const parts: number[] = [];
  if (i.sales < r.sales) remaining.push(`판매 ${r.sales - i.sales}건 더 (현재 ${i.sales}/${r.sales}건)`);
  parts.push(Math.min(1, i.sales / r.sales));
  if (i.avgRating === null || i.avgRating < r.avgRating)
    remaining.push(`평균 평점 ${r.avgRating} 이상 (현재 ${i.avgRating === null ? "후기 없음" : i.avgRating.toFixed(1)})`);
  parts.push(i.avgRating === null ? 0 : Math.min(1, i.avgRating / r.avgRating));
  return { remaining, progress: parts.reduce((a, b) => a + b, 0) / parts.length };
}

/** 등급 자동 계산. 실적은 등급을 올리기만 하고, 내리는 것은 운영자 수동 조정으로만 한다. */
export function computeGrade(i: GradeInput): GradeResult {
  const base = baseGrade(i.track);
  const cert = certifiedGap(i);
  let grade: MentorGrade = base;
  if (gradeRank(grade) < gradeRank("certified") && cert.remaining.length === 0) grade = "certified";
  const mas = masterGap(i);
  if (grade === "certified" && mas.remaining.length === 0) grade = "master";

  const next =
    grade === "registered"
      ? { grade: "certified" as const, ...cert }
      : grade === "certified"
        ? { grade: "master" as const, ...mas }
        : null;

  return { grade, base, probation: i.sales < GRADE_RULES.probationSales, next };
}

/** 운영자 수동 조정(정지 포함)을 반영한 최종 등급 */
export type GradeOverride = { grade: MentorGrade | "suspended"; reason: string; at: string };

export function effectiveGrade(result: GradeResult, override?: GradeOverride): MentorGrade | "suspended" {
  return override ? override.grade : result.grade;
}
