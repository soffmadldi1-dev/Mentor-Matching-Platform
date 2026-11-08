import type { BookingStatus, CourseStatus } from "./types";

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", timeZone: "Asia/Seoul" });
}

export const BOOKING_STATUS: Record<BookingStatus, string> = {
  inquiry: "신청 접수",
  confirmed: "일정 확정",
  in_progress: "진행 중",
  done: "완료",
  cancelled: "취소",
};

export const COURSE_STATUS: Record<CourseStatus, string> = {
  draft: "초안",
  review: "검토 대기",
  published: "게시 중",
  hidden: "숨김",
};
