import { describe, expect, it } from "vitest";
import { EMPTY_DESIGNER_FORM, parseDesignerForm } from "./courseDesign";

const filled = {
  ...EMPTY_DESIGNER_FORM,
  experience: "인사팀에서 8년간 채용을 담당했습니다.",
  who: "서류 탈락이 반복되는 취업 준비생",
  finalOutput: "이력서 1부",
};

describe("설계기 입력 검증", () => {
  it("희망 가격은 숫자만 남기고, 비우면 null", () => {
    const a = parseDesignerForm({ ...filled, desiredPrice: "200,000원" });
    expect(a.success && a.data.desiredPrice).toBe(200_000);
    const b = parseDesignerForm({ ...filled, desiredPrice: "" });
    expect(b.success && b.data.desiredPrice).toBe(null);
  });

  it("필수 입력이 비면 막고, 허용되지 않은 회차 수를 막는다", () => {
    expect(parseDesignerForm(EMPTY_DESIGNER_FORM).success).toBe(false);
    expect(parseDesignerForm({ ...filled, sessionCount: "5" }).success).toBe(false);
  });
});
