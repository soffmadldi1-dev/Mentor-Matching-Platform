import type { FieldSlug } from "@/lib/fields";
import { computeGrade, effectiveGrade, GRADE_LABELS, gradeRank, type GradeResult, type MentorGrade } from "@/lib/mentorGrade";
import type { DemoCourse, DemoState } from "./types";

// 데모 데이터에서 화면용 값을 계산하는 순수 함수들

export function personName(s: DemoState, id: string): string {
  return s.people.find((p) => p.id === id)?.name ?? "알 수 없음";
}

export function mentorOf(s: DemoState, id: string) {
  return s.mentors.find((m) => m.id === id);
}

export function courseRating(s: DemoState, courseId: string): { avg: number | null; count: number } {
  const list = s.reviews.filter((r) => r.courseId === courseId);
  if (!list.length) return { avg: null, count: 0 };
  return { avg: list.reduce((a, r) => a + r.rating, 0) / list.length, count: list.length };
}

/** 판매 = 신청이 확정된 건(확정·진행 중·완료) */
export const SOLD = ["confirmed", "in_progress", "done"] as const;

export type MentorStats = {
  sales: number;
  avgRating: number | null;
  reviewCount: number;
  sessionsDone: number;
  reportsSubmitted: number;
  reportRate: number | null;
};

/** 멘토 실적 (시연용 실적 입력이 있으면 그 값이 우선) */
export function mentorStats(s: DemoState, mentorId: string): MentorStats {
  const courseIds = s.courses.filter((c) => c.mentorId === mentorId).map((c) => c.id);
  const bookings = s.bookings.filter((b) => courseIds.includes(b.courseId));
  const sessionsDone = bookings.reduce((a, b) => a + b.sessionsDone, 0);
  const reportsSubmitted = s.reports.filter((r) => bookings.some((b) => b.id === r.bookingId)).length;
  const reviews = s.reviews.filter((r) => courseIds.includes(r.courseId));
  const real: MentorStats = {
    sales: bookings.filter((b) => (SOLD as readonly string[]).includes(b.status)).length,
    avgRating: reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : null,
    reviewCount: reviews.length,
    sessionsDone,
    reportsSubmitted,
    reportRate: sessionsDone ? Math.min(1, reportsSubmitted / sessionsDone) : null,
  };
  const sim = mentorOf(s, mentorId)?.sim;
  if (!sim) return real;
  return {
    ...real,
    sales: sim.sales ?? real.sales,
    avgRating: sim.avgRating !== undefined ? sim.avgRating : real.avgRating,
    reportRate: sim.reportRate !== undefined ? sim.reportRate : real.reportRate,
  };
}

export type MentorGradeInfo = {
  approved: boolean; // 공통 관문 통과 여부
  stats: MentorStats;
  result: GradeResult | null;
  grade: MentorGrade | "suspended" | null; // 수동 조정 반영, 승인 전이면 null
  probation: boolean;
  boosted: boolean; // 출시 캠프 30일 상위 노출 중
};

export function mentorGradeInfo(s: DemoState, mentorId: string, now = new Date()): MentorGradeInfo {
  const m = mentorOf(s, mentorId);
  const stats = mentorStats(s, mentorId);
  if (!m || !m.approvedAt) return { approved: false, stats, result: null, grade: null, probation: false, boosted: false };
  const result = computeGrade({ track: m.track, sales: stats.sales, avgRating: stats.avgRating, reportRate: stats.reportRate });
  return {
    approved: true,
    stats,
    result,
    grade: effectiveGrade(result, m.override),
    probation: result.probation,
    boosted: !!m.boostUntil && new Date(m.boostUntil) >= now,
  };
}

export const gradeLabel = (g: MentorGrade | "suspended" | null) => (g === null ? "예비 멘토" : g === "suspended" ? "활동 정지" : GRADE_LABELS[g]);

/** 게시 과정 (정지된 멘토 제외). 마스터 멘토 → 캠프 상위 노출 → 나머지 순 */
export function publishedCourses(s: DemoState, field?: FieldSlug): DemoCourse[] {
  const score = (c: DemoCourse) => {
    const g = mentorGradeInfo(s, c.mentorId);
    return (g.grade === "master" ? 2 : 0) + (g.boosted ? 1 : 0);
  };
  return s.courses
    .filter((c) => c.status === "published" && (!field || c.field === field) && mentorGradeInfo(s, c.mentorId).grade !== "suspended")
    .map((c, i) => ({ c, i, k: score(c) }))
    .sort((a, b) => b.k - a.k || a.i - b.i)
    .map((x) => x.c);
}

/** 추천 매칭 대상: 인증 멘토 이상 */
export function isMatchEligible(s: DemoState, mentorId: string): boolean {
  const g = mentorGradeInfo(s, mentorId).grade;
  return g !== null && g !== "suspended" && gradeRank(g) >= gradeRank("certified");
}

/** 멘티에게 보이는 배지: 등급(등록/인증/마스터), 파운딩은 별도, 수습 중이면 "새로 온 멘토" */
export function mentorBadges(s: DemoState, mentorId: string): string[] {
  const m = mentorOf(s, mentorId);
  if (!m) return [];
  const g = mentorGradeInfo(s, mentorId);
  const out: string[] = [];
  if (g.grade && g.grade !== "suspended") out.push(GRADE_LABELS[g.grade]);
  if (m.isFounding) out.push("파운딩 멘토");
  if (g.probation && g.grade !== "suspended") out.push("새로 온 멘토");
  return out;
}

export type MentorQuality = {
  mentorId: string;
  name: string;
  courses: number;
  bookings: number;
  sessionsDone: number;
  reportsSubmitted: number;
  reportRate: number | null; // 0~1
  avgRating: number | null;
  reviewCount: number;
  warnings: string[];
};

/** 품질 기준(CLAUDE.md 10장): 리포트 제출률 90%+, 평균 후기 4.5+ — 인증 등급 조건과 같다 */
export const QUALITY_RULES = { reportRate: 0.9, avgRating: 4.5 };

export function mentorQuality(s: DemoState): MentorQuality[] {
  return s.mentors
    .filter((m) => !!m.approvedAt)
    .map((m) => {
      const courseIds = s.courses.filter((c) => c.mentorId === m.id).map((c) => c.id);
      const bookings = s.bookings.filter((b) => courseIds.includes(b.courseId));
      const { sessionsDone, reportsSubmitted, avgRating, reportRate } = mentorStats(s, m.id);
      const reviews = s.reviews.filter((r) => courseIds.includes(r.courseId));
      const warnings: string[] = [];
      if (reportRate !== null && reportRate < QUALITY_RULES.reportRate) warnings.push(`리포트 제출률 ${Math.round(reportRate * 100)}% (기준 90%)`);
      if (avgRating !== null && avgRating < QUALITY_RULES.avgRating) warnings.push(`평균 후기 ${avgRating.toFixed(1)}점 (기준 4.5점)`);
      return {
        mentorId: m.id,
        name: personName(s, m.id),
        courses: courseIds.length,
        bookings: bookings.length,
        sessionsDone,
        reportsSubmitted,
        reportRate,
        avgRating,
        reviewCount: reviews.length,
        warnings,
      };
    });
}

/** 기관 보고용 분야별 성과 요약 */
export function fieldOutcomes(s: DemoState) {
  const fields: FieldSlug[] = ["career", "tourism", "venture"];
  return fields.map((f) => {
    const courseIds = s.courses.filter((c) => c.field === f).map((c) => c.id);
    const bookings = s.bookings.filter((b) => courseIds.includes(b.courseId) && b.status !== "cancelled");
    const reviews = s.reviews.filter((r) => courseIds.includes(r.courseId));
    const outputs = s.reports.filter((r) => bookings.some((b) => b.id === r.bookingId) && r.output).length;
    return {
      field: f,
      enrollments: bookings.length,
      completed: bookings.filter((b) => b.status === "done").length,
      avgRating: reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : null,
      outputs,
    };
  });
}
