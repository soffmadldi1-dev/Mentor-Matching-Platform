import type { FieldSlug } from "@/lib/fields";
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

export function publishedCourses(s: DemoState, field?: FieldSlug): DemoCourse[] {
  return s.courses.filter((c) => c.status === "published" && (!field || c.field === field));
}

export function mentorBadges(s: DemoState, mentorId: string): string[] {
  const m = mentorOf(s, mentorId);
  if (!m) return [];
  const out: string[] = [];
  if (m.isFounding) out.push("파운딩 멘토");
  if (m.status === "certified") out.push("인증 멘토");
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

/** 인증 유지 기준(CLAUDE.md 10장): 리포트 제출률 90%+, 평균 후기 4.5+ */
export const QUALITY_RULES = { reportRate: 0.9, avgRating: 4.5 };

export function mentorQuality(s: DemoState): MentorQuality[] {
  return s.mentors
    .filter((m) => m.status === "certified")
    .map((m) => {
      const courseIds = s.courses.filter((c) => c.mentorId === m.id).map((c) => c.id);
      const bookings = s.bookings.filter((b) => courseIds.includes(b.courseId));
      const sessionsDone = bookings.reduce((a, b) => a + b.sessionsDone, 0);
      const reportsSubmitted = s.reports.filter((r) => bookings.some((b) => b.id === r.bookingId)).length;
      const reviews = s.reviews.filter((r) => courseIds.includes(r.courseId));
      const avgRating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : null;
      const reportRate = sessionsDone ? Math.min(1, reportsSubmitted / sessionsDone) : null;
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
