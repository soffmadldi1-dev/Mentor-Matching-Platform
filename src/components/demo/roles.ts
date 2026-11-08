import type { DemoRole } from "@/lib/demo/types";

export const DEMO_ROLE_LABELS: Record<DemoRole, string> = {
  guest: "방문자",
  mentee: "멘티",
  candidate: "예비 멘토",
  mentor: "인증 멘토",
  admin: "운영자",
};

export const DEMO_ROLES: DemoRole[] = ["guest", "mentee", "candidate", "mentor", "admin"];

/** 역할별 상단 메뉴 */
export const ROLE_NAV: Record<DemoRole, { href: string; label: string }[]> = {
  guest: [],
  mentee: [{ href: "/me/notes", label: "내 공략 노트" }],
  candidate: [
    { href: "/academy/camp", label: "내 캠프" },
    { href: "/studio", label: "스튜디오" },
  ],
  mentor: [
    { href: "/studio", label: "스튜디오" },
    { href: "/studio/bookings", label: "신청 관리" },
  ],
  admin: [{ href: "/admin", label: "운영" }],
};
