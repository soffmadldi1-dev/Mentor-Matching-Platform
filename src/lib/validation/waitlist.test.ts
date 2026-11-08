import { describe, expect, it } from "vitest";
import { waitlistFromForm, waitlistSchema } from "./waitlist";

function form(values: Record<string, string>) {
  const f = new FormData();
  Object.entries(values).forEach(([k, v]) => f.set(k, v));
  return f;
}

const ok = { name: "가나다", email: " Test@Example.com ", roleInterest: "mentee", fieldSlug: "tourism", privacyConsent: "on" };

describe("대기자 입력 검증", () => {
  it("정상 입력은 이메일을 소문자로 정리한다", () => {
    const r = waitlistSchema.safeParse(waitlistFromForm(form(ok)));
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("test@example.com");
  });

  it("개인정보 동의가 없으면 막는다", () => {
    const rest: Record<string, string> = { ...ok };
    delete rest.privacyConsent;
    const r = waitlistSchema.safeParse(waitlistFromForm(form(rest)));
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toContain("동의");
  });

  it("잘못된 이메일·분야를 막는다", () => {
    expect(waitlistSchema.safeParse(waitlistFromForm(form({ ...ok, email: "abc" }))).success).toBe(false);
    expect(waitlistSchema.safeParse(waitlistFromForm(form({ ...ok, fieldSlug: "love" }))).success).toBe(false);
  });
});
