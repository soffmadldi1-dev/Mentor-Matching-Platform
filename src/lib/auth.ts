import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "mentee" | "candidate" | "mentor" | "admin";

export type Viewer = {
  id: string;
  email: string | null;
  role: Role;
  displayName: string | null;
};

export const ROLE_LABELS: Record<Role, string> = {
  mentee: "멘티",
  candidate: "예비 멘토",
  mentor: "인증 멘토",
  admin: "운영자",
};

/** 과정 설계 초안을 저장할 수 있는 역할 */
export const STUDIO_ROLES: Role[] = ["candidate", "mentor", "admin"];

/** 현재 로그인 사용자와 역할. 비로그인·미설정이면 null */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", data.user.id)
    .maybeSingle();

  return {
    id: data.user.id,
    email: data.user.email ?? null,
    role: (profile?.role as Role) ?? "mentee",
    displayName: profile?.display_name ?? null,
  };
}

/**
 * 역할이 필요한 페이지에서 호출. 비로그인이면 로그인으로 보내고,
 * 역할이 맞지 않으면 { viewer, allowed: false }를 돌려줘 화면에서 안내한다.
 */
export async function requireRole(roles: Role[], next: string) {
  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=${encodeURIComponent(next)}`);
  return { viewer, allowed: roles.includes(viewer.role) };
}
