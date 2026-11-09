import type { DemoRole } from "@/lib/demo/types";

export const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  guest: "방문자",
  mentee: "멘티",
  candidate: "예비 멘토",
  registered: "등록 멘토",
  mentor: "인증 멘토",
  master: "마스터 멘토",
  admin: "운영자",
};

export const DEMO_ROLES: DemoRole[] = ["guest", "mentee", "candidate", "registered", "mentor", "master", "admin"];

/** 멘토 스튜디오를 쓰는 역할 */
export const MENTOR_ROLES: DemoRole[] = ["registered", "mentor", "master"];

/** 역할별 상단 메뉴 */
export const ROLE_NAV: Record<DemoRole, { href: string; label: string }[]> = {
  guest: [],
  mentee: [{ href: "/me/notes", label: "내 공략 노트" }],
  candidate: [
    { href: "/academy/camp", label: "내 캠프" },
    { href: "/studio", label: "스튜디오" },
  ],
  registered: [
    { href: "/studio", label: "스튜디오" },
    { href: "/studio/bookings", label: "신청 관리" },
  ],
  mentor: [
    { href: "/studio", label: "스튜디오" },
    { href: "/studio/bookings", label: "신청 관리" },
  ],
  master: [
    { href: "/studio", label: "스튜디오" },
    { href: "/studio/bookings", label: "신청 관리" },
  ],
  admin: [{ href: "/admin", label: "운영" }],
};
