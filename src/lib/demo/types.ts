import type { CourseMode, FieldSlug } from "@/lib/fields";
import type { SessionRow } from "@/lib/designer/parseDesign";
import type { GradeOverride, MentorTrack } from "@/lib/mentorGrade";

// 데모 데이터 타입 — DB 스키마(CLAUDE.md 8장)를 화면에 필요한 만큼 단순화한 것
// mentor = 인증 멘토. registered(등록 멘토)·master(마스터 멘토)는 멘토 입구 개편 v1에서 추가
export type DemoRole = "guest" | "mentee" | "candidate" | "registered" | "mentor" | "master" | "admin";

export type DemoPerson = {
  id: string;
  name: string;
  email: string;
  role: Exclude<DemoRole, "guest">;
  joinedAt: string;
};

export type DemoMentor = {
  id: string; // DemoPerson.id
  headline: string;
  bio: string;
  fieldSlugs: FieldSlug[];
  keywords: string[];
  isFounding: boolean; // 파운딩 멘토(1기) 배지 — 등급과 별개
  track: MentorTrack; // 들어온 입구 A 셀프 등록 · B 경력 인증 · C 출시 캠프
  approvedAt?: string; // 공통 관문 통과(승인)일. 없으면 아직 멘토 활동 전(예비 멘토·지원자)
  override?: GradeOverride; // 운영자 수동 등급 조정(정지 포함)
  sim?: { sales?: number; avgRating?: number | null; reportRate?: number | null }; // 시연용 실적 입력
  boostUntil?: string; // 출시 캠프 수료 혜택: 30일 상위 노출
};

export type ApplicationStatus = "draft" | "submitted" | "revision" | "approved" | "rejected";

export type CareerEvidence = { org: string; topic: string; year: string; people: string };

/** 멘토 지원서 (A 셀프 등록 · B 경력 인증) */
export type DemoApplication = {
  id: string;
  userId: string;
  track: "A" | "B";
  status: ApplicationStatus;
  identityChecked: boolean;
  basic: { name: string; field: FieldSlug | ""; oneLiner: string; career: string };
  evidence: { items: CareerEvidence[]; certs: string; reviewLinks: string; lectureUrl: string };
  modulePassed: number[]; // 통과한 단원 번호 1~3
  design: { markdown: string; finalOutput: string; sessionCount: number };
  interviewSlots: string[]; // B: 희망 일정 3개
  createdAt: string;
  submittedAt?: string;
  decidedAt?: string;
  reason?: string; // 보완 요청·반려 사유
};

export type CourseStatus = "draft" | "review" | "published" | "hidden";

export type DemoCourse = {
  id: string;
  mentorId: string;
  field: FieldSlug;
  title: string;
  oneLiner: string;
  target: string;
  before: string;
  after: string;
  sessions: SessionRow[];
  prep: string[];
  notice: string;
  price: number | null;
  headlines: string[];
  checks: string[];
  sessionCount: number;
  minutes: number;
  mode: CourseMode;
  status: CourseStatus;
  designMarkdown?: string;
  createdAt: string;
  publishedAt?: string;
  rejectReason?: string;
  reviewWarnings?: string[];
};

export type BookingStatus = "inquiry" | "confirmed" | "in_progress" | "done" | "cancelled";

export type DemoBooking = {
  id: string;
  courseId: string;
  menteeId: string;
  status: BookingStatus;
  preferredSchedule: string;
  message: string;
  sessionsDone: number; // 진행한 회차 수
  createdAt: string;
};

export type DemoReport = {
  id: string;
  bookingId: string;
  sessionN: number;
  memo: string;
  menteeSummary: string;
  nextHomework: string;
  output: string; // 이 회차 결과물
  sentAt: string;
};

export type DemoReview = {
  id: string;
  bookingId: string;
  courseId: string;
  rating: number;
  body: string;
  authorLabel: string;
  createdAt: string;
};

export type NeedAnswers = {
  current: string;
  goal: string;
  blocker: string;
  output: string;
  timeline: string;
};

export type DemoNeedRequest = {
  id: string;
  menteeId: string;
  field: FieldSlug;
  answers: NeedAnswers;
  aiSummary?: string;
  createdAt: string;
  status: "waiting" | "matched";
};

export type DemoMatch = {
  id: string;
  requestId: string;
  courseId: string;
  reasons: string[]; // 3줄
  caution: string;
};

export type DemoCohort = {
  id: string;
  name: string;
  kind: "workshop" | "camp";
  startsOn: string;
  endsOn: string;
  price: number;
  status: "draft" | "open" | "running" | "closed";
};

export type DemoEnrollment = {
  id: string;
  cohortId: string;
  userId: string;
  status: "applied" | "accepted" | "completed" | "dropped";
  passedWeeks: number[]; // 통과한 주차 (0~4)
  graduatedAt?: string;
};

export type DemoAssignment = {
  id: string;
  enrollmentId: string;
  week: number;
  content: string;
  submittedAt: string;
  reviewed: boolean;
};

export type DemoWaitlist = {
  id: string;
  name: string;
  email: string;
  roleInterest: "mentee" | "mentor";
  field: FieldSlug;
  note: string;
  createdAt: string;
};

export type DemoState = {
  v: number;
  role: DemoRole;
  people: DemoPerson[];
  mentors: DemoMentor[];
  courses: DemoCourse[];
  bookings: DemoBooking[];
  reports: DemoReport[];
  reviews: DemoReview[];
  needRequests: DemoNeedRequest[];
  matches: DemoMatch[];
  cohorts: DemoCohort[];
  enrollments: DemoEnrollment[];
  assignments: DemoAssignment[];
  waitlist: DemoWaitlist[];
  applications: DemoApplication[];
};
