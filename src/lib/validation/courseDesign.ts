import { z } from "zod";
import { FIELD_SLUGS } from "@/lib/fields";

// 공략 설계기 입력 검증 (클라이언트 표시용 메시지와 서버 저장 검증에 함께 쓴다)
export const courseDesignInputSchema = z.object({
  field: z.enum(FIELD_SLUGS, { error: "분야를 골라 주세요." }),
  experience: z.string().trim().min(10, "내 경험을 10자 이상 적어 주세요.").max(2000, "2,000자 이내로 줄여 주세요."),
  who: z.string().trim().min(5, "누구를 돕고 싶은지 적어 주세요.").max(500, "500자 이내로 줄여 주세요."),
  finalOutput: z.string().trim().min(2, "최종 결과물을 적어 주세요.").max(200, "200자 이내로 줄여 주세요."),
  sessionCount: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(6)]),
  minutes: z.union([z.literal(30), z.literal(60), z.literal(90)]),
  mode: z.enum(["online", "offline", "hybrid"]),
  desiredPrice: z.number().int().min(0).max(10_000_000, "희망 가격을 확인해 주세요.").nullable(),
  keywords: z.string().trim().max(300, "300자 이내로 줄여 주세요."),
});

export type CourseDesignFormInput = z.infer<typeof courseDesignInputSchema>;

/** 폼 문자열 상태 → 검증 대상 객체 */
export type DesignerFormState = {
  field: string;
  experience: string;
  who: string;
  finalOutput: string;
  sessionCount: string;
  minutes: string;
  mode: string;
  desiredPrice: string; // 원 단위 숫자 문자열, 빈 값 허용
  keywords: string;
};

export const EMPTY_DESIGNER_FORM: DesignerFormState = {
  field: "career",
  experience: "",
  who: "",
  finalOutput: "",
  sessionCount: "4",
  minutes: "60",
  mode: "online",
  desiredPrice: "",
  keywords: "",
};

export function parseDesignerForm(f: DesignerFormState) {
  const digits = f.desiredPrice.replace(/[^\d]/g, "");
  return courseDesignInputSchema.safeParse({
    ...f,
    sessionCount: Number(f.sessionCount),
    minutes: Number(f.minutes),
    desiredPrice: digits ? Number(digits) : null,
  });
}
