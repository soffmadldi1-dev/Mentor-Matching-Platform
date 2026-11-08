import { describe, expect, it } from "vitest";
import { checkPublishText, hasGuaranteeExpression } from "./moderation";

describe("게시 문구 검사", () => {
  it("보장 표현을 찾는다", () => {
    expect(hasGuaranteeExpression("서류 합격 보장 포트폴리오")).toBe(true);
    expect(hasGuaranteeExpression("수익을 보장합니다")).toBe(true);
    expect(hasGuaranteeExpression("만족도 100%")).toBe(true);
    expect(hasGuaranteeExpression("합격을 약속하지는 않습니다")).toBe(false);
  });

  it("항목 이름과 함께 경고를 돌려준다", () => {
    const w = checkPublishText({ "한 줄 소개": "합격 보장", "안내문": "문의 010-1234-5678", "과정명": "면접 공략" });
    expect(w).toHaveLength(2);
    expect(w[0]).toContain("한 줄 소개");
    expect(w[1]).toContain("안내문");
  });
});
