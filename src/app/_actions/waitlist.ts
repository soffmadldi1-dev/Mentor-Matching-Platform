"use server";

import { createClient } from "@/lib/supabase/server";
import { SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/env";
import { waitlistFromForm, waitlistSchema } from "@/lib/validation/waitlist";

export type WaitlistState =
  | { status: "idle" }
  | { status: "ok"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> };

export async function joinWaitlist(_prev: WaitlistState, formData: FormData): Promise<WaitlistState> {
  const parsed = waitlistSchema.safeParse(waitlistFromForm(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "입력 내용을 확인해 주세요.", fieldErrors };
  }

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: SUPABASE_NOT_CONFIGURED_MESSAGE };

  const v = parsed.data;
  const { error } = await supabase.from("waitlist").insert({
    name: v.name,
    email: v.email,
    role_interest: v.roleInterest,
    field_slug: v.fieldSlug,
    note: v.note || null,
    privacy_consent: true,
  });

  if (error) {
    // 23505 = unique 위반 → 이미 등록된 이메일
    if (error.code === "23505") {
      return { status: "ok", message: "이미 대기자로 등록된 이메일입니다. 오픈 소식을 이 이메일로 보내 드릴게요." };
    }
    console.error("[waitlist] insert 실패", error.code, error.message);
    return { status: "error", message: "등록 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요." };
  }

  return {
    status: "ok",
    message:
      v.roleInterest === "mentor"
        ? "등록되었습니다. 파운딩 멘토 1기 일정이 정해지면 가장 먼저 알려 드릴게요."
        : "등록되었습니다. 이 분야 공략 과정이 열리면 가장 먼저 알려 드릴게요.",
  };
}
