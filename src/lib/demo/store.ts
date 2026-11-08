"use client";

import { useSyncExternalStore } from "react";
import { checkPublishText } from "@/lib/moderation";
import { createSeed, ME, SEED_VERSION } from "./seed";
import type {
  BookingStatus,
  DemoCourse,
  DemoMatch,
  DemoNeedRequest,
  DemoRole,
  DemoState,
  DemoWaitlist,
  NeedAnswers,
} from "./types";

// 시연용 데이터 저장소: 예시 데이터 + 이 브라우저에서 바꾼 내용(localStorage)
const KEY = "meonjeo.demo";
const SERVER_SNAPSHOT = createSeed();
let state: DemoState | null = null;
const listeners = new Set<() => void>();

function load(): DemoState {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      if (parsed.v === SEED_VERSION) return parsed;
    }
  } catch {
    // 저장소가 막혀 있으면 예시 데이터로 시작
  }
  return createSeed();
}

function get(): DemoState {
  if (state === null) state = typeof window === "undefined" ? SERVER_SNAPSHOT : load();
  return state;
}

function set(updater: (s: DemoState) => DemoState) {
  state = updater(get());
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 실패해도 이번 화면에서는 계속 동작
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** 데모 상태 전체를 구독한다 */
export function useDemo(): DemoState {
  return useSyncExternalStore(subscribe, get, () => SERVER_SNAPSHOT);
}

const uid = (p: string) =>
  `${p}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)}`;
const now = () => new Date().toISOString();

/** 현재 역할의 "나" id (방문자는 null) */
export function meId(role: DemoRole): string | null {
  return role === "guest" ? null : ME[role];
}

// ───────────── 동작(액션) ─────────────
export const demo = {
  reset() {
    const role = get().role;
    state = createSeed();
    set((s) => ({ ...s, role }));
  },
  setRole(role: DemoRole) {
    set((s) => ({ ...s, role }));
    try {
      document.cookie = `demo_role=${role}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // 무시
    }
  },

  addWaitlist(entry: Omit<DemoWaitlist, "id" | "createdAt">): "ok" | "duplicate" {
    const exists = get().waitlist.some((w) => w.email.toLowerCase() === entry.email.toLowerCase());
    if (exists) return "duplicate";
    set((s) => ({ ...s, waitlist: [{ ...entry, id: uid("w"), createdAt: now() }, ...s.waitlist] }));
    return "ok";
  },

  addBooking(courseId: string, menteeId: string, preferredSchedule: string, message: string) {
    const id = uid("b");
    set((s) => ({
      ...s,
      bookings: [{ id, courseId, menteeId, status: "inquiry", preferredSchedule, message, sessionsDone: 0, createdAt: now() }, ...s.bookings],
    }));
    return id;
  },
  setBookingStatus(id: string, status: BookingStatus) {
    set((s) => ({ ...s, bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)) }));
  },

  addNeedRequest(menteeId: string, field: DemoNeedRequest["field"], answers: NeedAnswers, aiSummary?: string) {
    const id = uid("nr");
    set((s) => ({
      ...s,
      needRequests: [{ id, menteeId, field, answers, aiSummary, createdAt: now(), status: "waiting" }, ...s.needRequests],
    }));
    return id;
  },
  publishMatches(requestId: string, picks: Omit<DemoMatch, "id" | "requestId">[]) {
    set((s) => ({
      ...s,
      matches: [...s.matches.filter((m) => m.requestId !== requestId), ...picks.map((p) => ({ ...p, id: uid("mt"), requestId }))],
      needRequests: s.needRequests.map((r) => (r.id === requestId ? { ...r, status: "matched" } : r)),
    }));
  },

  addCourseDraft(course: Omit<DemoCourse, "id" | "createdAt" | "status">) {
    const id = uid("c");
    set((s) => ({ ...s, courses: [{ ...course, id, status: "draft", createdAt: now() }, ...s.courses] }));
    return id;
  },
  updateCourse(id: string, patch: Partial<DemoCourse>) {
    set((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  },
  /** 게시 요청: 금지 표현·연락처 검사 결과를 함께 저장하고 돌려준다 */
  requestReview(id: string): string[] {
    const c = get().courses.find((x) => x.id === id);
    if (!c) return [];
    const warnings = checkPublishText({
      과정명: c.title,
      "한 줄 소개": c.oneLiner,
      대상: c.target,
      "Before/After": [c.before, c.after],
      회차표: c.sessions.map((s) => `${s.goal} ${s.activities} ${s.output} ${s.homework}`),
      "교육 안내문": c.notice,
      헤드카피: c.headlines,
    });
    set((s) => ({
      ...s,
      courses: s.courses.map((x) => (x.id === id ? { ...x, status: "review", reviewWarnings: warnings, rejectReason: undefined } : x)),
    }));
    return warnings;
  },
  approveCourse(id: string) {
    set((s) => ({
      ...s,
      courses: s.courses.map((c) => (c.id === id ? { ...c, status: "published", publishedAt: now(), rejectReason: undefined } : c)),
    }));
  },
  rejectCourse(id: string, reason: string) {
    set((s) => ({ ...s, courses: s.courses.map((c) => (c.id === id ? { ...c, status: "draft", rejectReason: reason } : c)) }));
  },

  applyCohort(cohortId: string, userId: string): boolean {
    if (get().enrollments.some((e) => e.cohortId === cohortId && e.userId === userId)) return false;
    set((s) => ({ ...s, enrollments: [...s.enrollments, { id: uid("en"), cohortId, userId, status: "applied", passedWeeks: [] }] }));
    return true;
  },
  setEnrollmentStatus(id: string, status: "accepted" | "dropped") {
    set((s) => ({ ...s, enrollments: s.enrollments.map((e) => (e.id === id ? { ...e, status } : e)) }));
  },
  submitAssignment(enrollmentId: string, week: number, content: string) {
    set((s) => ({
      ...s,
      assignments: [
        ...s.assignments.filter((a) => !(a.enrollmentId === enrollmentId && a.week === week)),
        { id: uid("as"), enrollmentId, week, content, submittedAt: now(), reviewed: false },
      ],
    }));
  },
  /** 과제 검토 완료 + 해당 주차 통과 처리 */
  passWeek(enrollmentId: string, week: number) {
    set((s) => ({
      ...s,
      assignments: s.assignments.map((a) => (a.enrollmentId === enrollmentId && a.week === week ? { ...a, reviewed: true } : a)),
      enrollments: s.enrollments.map((e) =>
        e.id === enrollmentId && !e.passedWeeks.includes(week) ? { ...e, passedWeeks: [...e.passedWeeks, week].sort() } : e,
      ),
    }));
  },
  /** 수료 승인 → 멘토 인증 */
  graduate(enrollmentId: string) {
    const e = get().enrollments.find((x) => x.id === enrollmentId);
    if (!e) return;
    const t = now();
    set((s) => ({
      ...s,
      enrollments: s.enrollments.map((x) => (x.id === enrollmentId ? { ...x, status: "completed", graduatedAt: t, passedWeeks: [0, 1, 2, 3, 4] } : x)),
      mentors: s.mentors.map((m) => (m.id === e.userId ? { ...m, status: "certified", certifiedAt: t } : m)),
      people: s.people.map((p) => (p.id === e.userId ? { ...p, role: "mentor" } : p)),
    }));
  },

  addReport(bookingId: string, sessionN: number, data: { memo: string; menteeSummary: string; nextHomework: string; output: string }) {
    set((s) => {
      const reports = [
        ...s.reports.filter((r) => !(r.bookingId === bookingId && r.sessionN === sessionN)),
        { id: uid("r"), bookingId, sessionN, ...data, sentAt: now() },
      ];
      const bookings = s.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const course = s.courses.find((c) => c.id === b.courseId);
        const sessionsDone = Math.max(b.sessionsDone, sessionN);
        const status: BookingStatus = course && sessionsDone >= course.sessionCount ? "done" : "in_progress";
        return { ...b, sessionsDone, status };
      });
      return { ...s, reports, bookings };
    });
  },
  addReview(bookingId: string, courseId: string, rating: number, body: string) {
    set((s) => ({
      ...s,
      reviews: [
        ...s.reviews.filter((r) => r.bookingId !== bookingId),
        { id: uid("rv"), bookingId, courseId, rating, body, authorLabel: "예시 멘티(나)", createdAt: now() },
      ],
    }));
  },
};

const noopSubscribe = () => () => {};
/** 브라우저 저장소를 읽은 뒤인지 (첫 화면에서 "없음"이 깜빡이지 않게) */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
