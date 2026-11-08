import { z } from "zod";

// 과정 편집 폼 저장 검증 (초안 저장이라 대부분 선택 입력, 길이만 제한)
const text = (max: number) => z.string().trim().max(max, `${max}자 이내로 입력해 주세요.`);

export const sessionRowSchema = z.object({
  n: z.number().int().min(1).max(6),
  goal: text(200),
  activities: text(500),
  output: text(200),
  homework: text(300),
});

export const courseEditSchema = z.object({
  title: text(30).describe("과정명은 30자 이내"),
  oneLiner: text(60),
  target: text(500),
  before: text(300),
  after: text(300),
  sessions: z.array(sessionRowSchema).max(6),
  prep: z.array(text(200)).max(20),
  notice: text(1000),
  price: z.number().int().min(0).max(10_000_000).nullable(),
  headlines: z.array(text(80)).max(3),
  checks: z.array(text(300)).max(5),
});

export type CourseEditInput = z.infer<typeof courseEditSchema>;
