import { describe, expect, it } from "vitest";
import { allPassed, checkDesignMarkdown } from "./designCheck";
import { DESIGNER_EXAMPLES } from "./designer/examples";

const ex = DESIGNER_EXAMPLES[0];

describe("설계서 기준 자동 검사", () => {
  it("예시 설계서는 모두 통과한다", () => {
    for (const e of DESIGNER_EXAMPLES) {
      expect(allPassed(checkDesignMarkdown(e.sampleMarkdown, e.input.sessionCount, e.input.finalOutput))).toBe(true);
    }
  });

  it("\"합격 보장\"이 있으면 보장 표현 항목이 실패한다", () => {
    const md = ex.sampleMarkdown.replace("### 2. 한 줄 소개\n", "### 2. 한 줄 소개\n면접 합격 보장! ");
    const r = checkDesignMarkdown(md, 4, ex.input.finalOutput);
    expect(r.find((i) => i.key === "guarantee")!.ok).toBe(false);
    expect(allPassed(r)).toBe(false);
  });

  it("멘토용 확인 사항(10번) 안의 설명 문구는 검사에서 뺀다", () => {
    const md = DESIGNER_EXAMPLES[2].sampleMarkdown;
    expect(md).toContain("수익 보장");
    expect(checkDesignMarkdown(md, 4, DESIGNER_EXAMPLES[2].input.finalOutput).find((i) => i.key === "guarantee")!.ok).toBe(true);
  });

  it("연락처가 있으면 실패한다", () => {
    const r = checkDesignMarkdown(ex.sampleMarkdown.replace("### 3. 대상\n", "### 3. 대상\n문의 010-1234-5678 "), 4, ex.input.finalOutput);
    expect(r.find((i) => i.key === "contact")!.ok).toBe(false);
  });

  it("회차 수가 다르거나 결과물이 비면 실패한다", () => {
    expect(checkDesignMarkdown(ex.sampleMarkdown, 6, ex.input.finalOutput).find((i) => i.key === "outputs")!.ok).toBe(false);
    const blank = ex.sampleMarkdown.replace("| 질문 유형 지도와 진단표 |", "|  |");
    const r = checkDesignMarkdown(blank, 4, ex.input.finalOutput).find((i) => i.key === "outputs")!;
    expect(r.ok).toBe(false);
    expect(r.detail).toContain("1회차");
  });

  it("마지막 결과물이 최종 결과물과 다르면 실패한다", () => {
    expect(checkDesignMarkdown(ex.sampleMarkdown, 4, "다른 결과물").find((i) => i.key === "final")!.ok).toBe(false);
    expect(checkDesignMarkdown(ex.sampleMarkdown, 4, ` ${ex.input.finalOutput}  `).find((i) => i.key === "final")!.ok).toBe(true);
  });
});
