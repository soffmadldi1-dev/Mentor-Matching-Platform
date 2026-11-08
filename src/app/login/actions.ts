"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl, SUPABASE_NOT_CONFIGURED_MESSAGE } from "@/lib/supabase/env";
import { safeNext } from "@/lib/safeNext";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string }
  | { status: "error"; message: string };

const schema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("이메일 형식을 확인해 주세요.")),
  displayName: z.string().trim().max(30, "이름은 30자 이내로 입력해 주세요."),
  privacyConsent: z.literal(true, { error: "개인정보 수집·이용에 동의해 주세요." }),
  marketingConsent: z.boolean(),
  next: z.string(),
});

// 이메일 매직링크 발송. 처음 쓰는 이메일이면 가입까지 함께 된다.
export async function sendMagicLink(_prev: LoginState, form: FormData): Promise<LoginState> {
  const parsed = schema.safeParse({
    email: String(form.get("email") ?? ""),
    displayName: String(form.get("displayName") ?? ""),
    privacyConsent: form.get("privacyConsent") === "on",
    marketingConsent: form.get("marketingConsent") === "on",
    next: String(form.get("next") ?? "/"),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createClient();
  if (!supabase) return { status: "error", message: SUPABASE_NOT_CONFIGURED_MESSAGE };

  const v = parsed.data;
  const redirect = `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext(v.next))}`;
  const { error } = await supabase.auth.signInWithOtp({
    email: v.email,
    options: {
      emailRedirectTo: redirect,
      shouldCreateUser: true,
      // 처음 가입할 때만 프로필 트리거가 이 값을 읽는다
      data: {
        display_name: v.displayName,
        privacy_consent: true,
        marketing_consent: v.marketingConsent,
      },
    },
  });

  if (error) {
    console.error("[login] 매직링크 발송 실패", error.status, error.message);
    const message =
      error.status === 429
        ? "잠시 후 다시 시도해 주세요. 짧은 시간에 요청이 많았습니다."
        : "로그인 링크를 보내지 못했습니다. 이메일 주소를 확인하고 다시 시도해 주세요.";
    return { status: "error", message };
  }
  return { status: "sent", email: v.email };
}
