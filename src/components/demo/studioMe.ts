import { APPLICANT_ID, ME } from "@/lib/demo/seed";
import type { DemoState } from "@/lib/demo/types";

/**
 * 스튜디오에서 "나"로 볼 멘토 id
 * - 예비 멘토: 예비 멘토(나) / 등록·인증·마스터: 각 등급의 예시 멘토
 * - 그 밖의 역할: 멘토 지원서를 쓴 적이 있으면 예시 지원자(나), 없으면 예시 멘토 A
 */
export function studioMe(s: Pick<DemoState, "role" | "applications">): string {
  switch (s.role) {
    case "candidate":
      return ME.candidate;
    case "registered":
      return ME.registered;
    case "mentor":
      return ME.mentor;
    case "master":
      return ME.master;
    default:
      return s.applications.some((a) => a.userId === APPLICANT_ID) ? APPLICANT_ID : ME.mentor;
  }
}
