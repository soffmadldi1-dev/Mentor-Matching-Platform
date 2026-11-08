import { describe, expect, it } from "vitest";
import { parseDesignMarkdown, parseWon } from "./parseDesign";
import { DESIGNER_EXAMPLES } from "./examples";

describe("설계서 마크다운 가져오기", () => {
  it.each(DESIGNER_EXAMPLES.map((e) => [e.label, e] as const))("예시 [%s]를 빠짐없이 읽는다", (_, ex) => {
    const { data, missing } = parseDesignMarkdown(ex.sampleMarkdown);
    expect(missing).toEqual([]);
    expect(data.sessions).toHaveLength(ex.input.sessionCount);
    expect(data.sessions!.at(-1)!.output).toBe(ex.input.finalOutput);
    expect(data.headlines).toHaveLength(3);
    expect(data.title!.length).toBeLessThanOrEqual(30);
    expect(data.oneLiner!.length).toBeLessThanOrEqual(60);
  });

  it("굵은 글씨·다른 제목 수준도 읽고, 못 찾은 항목은 missing에 담는다", () => {
    const md = `## 1) 과정명\n**면접 공략**\n\n## 5. 회차별 공략\n| 회차 | 목표 | 진행 | 결과물 | 과제 |\n|:--|--|--|--|--|\n| **1** | 가 | 나 | 다 | 라 |\n`;
    const { data, missing } = parseDesignMarkdown(md);
    expect(data.title).toBe("면접 공략");
    expect(data.sessions).toEqual([{ n: 1, goal: "가", activities: "나", output: "다", homework: "라" }]);
    expect(missing).toContain("가격");
    expect(missing).not.toContain("과정명");
  });

  it("형식이 전혀 다르면 아무것도 채우지 않는다", () => {
    const { data, missing } = parseDesignMarkdown("그냥 문장입니다.");
    expect(data.title).toBeUndefined();
    expect(missing.length).toBe(11);
  });

  it("가격 표기를 숫자로 바꾼다", () => {
    expect(parseWon("추천 가격: 200,000원")).toBe(200_000);
    expect(parseWon("- 추천 가격: 25만 원")).toBe(250_000);
    expect(parseWon("12.5만원")).toBe(125_000);
    expect(parseWon("가격 미정")).toBeUndefined();
  });
});
