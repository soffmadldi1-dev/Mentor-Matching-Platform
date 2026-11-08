import type { CourseMode, FieldSlug } from "@/lib/fields";
import type { SessionRow } from "@/lib/designer/parseDesign";

// 데모 데이터 타입 — DB 스키마(CLAUDE.md 8장)를 화면에 필요한 만큼 단순화한 것
export type DemoRole = "guest" | "mentee" | "candidate" | "mentor" | "admin";

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
  isFounding: boolean;
  status: "candidate" | "certified" | "suspended";
  certifiedAt?: string;
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
};
