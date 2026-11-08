import { z } from "zod";
import { FIELD_SLUGS } from "@/lib/fields";

// 대기자 등록 입력 검증
export const waitlistSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(40, "이름은 40자 이내로 입력해 주세요."),
  email: z.string().trim().toLowerCase().pipe(z.email("이메일 형식을 확인해 주세요.")),
  roleInterest: z.enum(["mentee", "mentor"], { error: "관심을 골라 주세요." }),
  fieldSlug: z.enum(FIELD_SLUGS, { error: "분야를 골라 주세요." }),
  note: z.string().trim().max(200, "메모는 200자 이내로 입력해 주세요.").optional().default(""),
  privacyConsent: z.literal(true, { error: "개인정보 수집·이용에 동의해 주세요." }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

/** FormData → 검증 대상 객체 */
export function waitlistFromForm(form: FormData) {
  return {
    name: String(form.get("name") ?? ""),
    email: String(form.get("email") ?? ""),
    roleInterest: form.get("roleInterest") ?? undefined,
    fieldSlug: form.get("fieldSlug") ?? undefined,
    note: String(form.get("note") ?? ""),
    privacyConsent: form.get("privacyConsent") === "on",
  };
}
