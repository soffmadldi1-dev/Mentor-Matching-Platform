"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer, STUDIO_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { courseEditSchema } from "@/lib/validation/courseEdit";

export type UpdateResult = { ok: boolean; message: string };

// 과정 초안 저장. 소유자 확인은 RLS(courses_update_own)가 한 번 더 한다.
export async function updateCourseDraft(courseId: string, payload: unknown): Promise<UpdateResult> {
  const viewer = await getViewer();
  if (!viewer || !STUDIO_ROLES.includes(viewer.role)) return { ok: false, message: "저장 권한이 없습니다." };
  if (!z.uuid().safeParse(courseId).success) return { ok: false, message: "과정을 찾을 수 없습니다." };

  const parsed = courseEditSchema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${issue.path.join(" > ")}: ${issue.message}` };
  }
  const v = parsed.data;

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase가 설정되지 않았습니다." };
  const { data, error } = await supabase
    .from("courses")
    .update({
      title: v.title || null,
      one_liner: v.oneLiner || null,
      target: v.target || null,
      before: v.before || null,
      after: v.after || null,
      sessions: v.sessions,
      prep: v.prep.filter(Boolean),
      notice: v.notice || null,
      price: v.price,
      headlines: v.headlines.filter(Boolean),
      checks: v.checks.filter(Boolean),
    })
    .eq("id", courseId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[course edit] 저장 실패", error.code, error.message);
    return { ok: false, message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (!data) return { ok: false, message: "이 과정을 수정할 권한이 없습니다." };

  revalidatePath("/studio");
  return { ok: true, message: "저장했습니다." };
}
