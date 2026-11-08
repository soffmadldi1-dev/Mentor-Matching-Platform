"use server";

import { z } from "zod";
import { getViewer, STUDIO_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { courseDesignInputSchema } from "@/lib/validation/courseDesign";

export type SaveDraftResult = { ok: true; courseId: string } | { ok: false; message: string };

const schema = z.object({
  input: courseDesignInputSchema,
  markdown: z.string().trim().min(20, "AI 답을 붙여넣어 주세요.").max(30_000, "AI 답이 너무 깁니다. 30,000자 이내로 줄여 주세요."),
});

// AI 답(마크다운)을 과정 초안(courses.draft)으로 저장한다
export async function saveDesignDraft(payload: unknown): Promise<SaveDraftResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, message: "로그인 후 저장할 수 있습니다." };
  if (!STUDIO_ROLES.includes(viewer.role)) {
    return { ok: false, message: "예비 멘토·인증 멘토만 저장할 수 있습니다. 아카데미 참여 후 운영자가 역할을 바꿔 드립니다." };
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };

  const supabase = await createClient();
  if (!supabase) return { ok: false, message: "Supabase가 설정되지 않았습니다." };

  const { input, markdown } = parsed.data;
  const { data, error } = await supabase
    .from("courses")
    .insert({
      mentor_id: viewer.id,
      field_slug: input.field,
      design_markdown: markdown,
      session_count: input.sessionCount,
      minutes: input.minutes,
      mode: input.mode,
      price: input.desiredPrice,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[designer] 초안 저장 실패", error?.code, error?.message);
    return { ok: false, message: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  return { ok: true, courseId: data.id as string };
}
