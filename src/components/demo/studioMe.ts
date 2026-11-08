import { ME } from "@/lib/demo/seed";
import type { DemoRole } from "@/lib/demo/types";

/** 스튜디오에서 "나"로 볼 멘토 id: 예비 멘토면 예비 멘토(나), 그 밖에는 예시 멘토 A */
export function studioMe(role: DemoRole): string {
  return role === "candidate" ? ME.candidate : ME.mentor;
}
