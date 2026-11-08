import { describe, expect, it } from "vitest";
import { buildCourseDesignPrompt, courseDesignChecklist, type CourseDesignInput } from "./courseDesign";
import { formatRange, formatWon, recommendedPriceRange } from "./pricing";
import { hasContactPattern, maskContacts } from "./common";

const base: CourseDesignInput = {
  field: "career",
  experience: "인사팀 8년",
  who: "서류 탈락이 반복되는 취업 준비생",
  finalOutput: "직무 맞춤 이력서 1부",
  sessionCount: 4,
  minutes: 60,
  mode: "online",
  desiredPrice: null,
  keywords: "채용 담당자 시선",
};

const tableRows = (prompt: string) =>
  prompt.split("\n").filter((l) => /^\| \d+회차 \|/.test(l));

describe("공략 설계 프롬프트", () => {
  it.each([2, 3, 4, 6] as const)("회차 수 %i가 조건과 표 행 수에 반영된다", (n) => {
    const p = buildCourseDesignPrompt({ ...base, sessionCount: n });
    expect(p).toContain(`${n}회차 "공략 과정"`);
    expect(p).toContain(`회차는 정확히 ${n}개입니다`);
    expect(tableRows(p)).toHaveLength(n);
  });

  it("최종 결과물이 마지막 회차 행과 조건에 들어간다", () => {
    const p = buildCourseDesignPrompt({ ...base, sessionCount: 3 });
    const rows = tableRows(p);
    expect(rows[2]).toContain("직무 맞춤 이력서 1부");
    expect(rows[0]).not.toContain("직무 맞춤 이력서 1부");
    expect(p).toContain(`마지막 3회차의 결과물은 반드시 "직무 맞춤 이력서 1부"`);
  });

  it("희망 가격이 없으면 권장 구간 안에서 제안하도록 한다", () => {
    const p = buildCourseDesignPrompt({ ...base, desiredPrice: null });
    expect(p).toContain("희망 가격: 없음");
    const p0 = buildCourseDesignPrompt({ ...base, desiredPrice: 0 });
    expect(p0).toContain("희망 가격: 없음");
  });

  it("희망 가격이 있으면 금액과 비교 요청이 들어간다", () => {
    const p = buildCourseDesignPrompt({ ...base, desiredPrice: 200_000 });
    expect(p).toContain("희망 가격: 20만 원");
    expect(p).not.toContain("희망 가격: 없음");
  });

  it("분야별 가격 구간이 들어간다", () => {
    expect(buildCourseDesignPrompt({ ...base, field: "career" })).toContain("15만 원~25만 원");
    expect(buildCourseDesignPrompt({ ...base, field: "tourism" })).toContain("15만 원~25만 원");
    expect(buildCourseDesignPrompt({ ...base, field: "venture" })).toContain("30만 원~40만 원");
  });

  it("공통 규칙(보장 표현 금지, 지어내기 금지)과 출력 형식 11항목이 들어간다", () => {
    const p = buildCourseDesignPrompt(base);
    expect(p).toContain("보장하는 표현");
    expect(p).toContain("지어내지 않습니다");
    for (let i = 1; i <= 11; i++) expect(p).toMatch(new RegExp(`^### ${i}\\. `, "m"));
  });

  it("빈 입력은 (입력 없음)으로, 연락처는 지워서 넣는다", () => {
    const p = buildCourseDesignPrompt({
      ...base,
      keywords: "",
      experience: "문의 010-1234-5678, hong@example.com",
    });
    expect(p).toContain("강점 키워드: (입력 없음)");
    expect(p).not.toContain("010-1234-5678");
    expect(p).not.toContain("hong@example.com");
  });

  it("체크리스트에 회차 수와 최종 결과물이 들어간다", () => {
    const list = courseDesignChecklist({ sessionCount: 6, finalOutput: "강의안" });
    expect(list[0]).toContain("6행");
    expect(list[1]).toContain("강의안");
  });
});

describe("가격 구간", () => {
  it("회차·시간에 비례해 조정한다", () => {
    expect(recommendedPriceRange("career", 4, 60)).toEqual({ min: 150_000, max: 250_000 });
    expect(recommendedPriceRange("career", 2, 60)).toEqual({ min: 75_000, max: 125_000 });
    expect(recommendedPriceRange("venture", 4, 90)).toEqual({ min: 450_000, max: 600_000 });
    expect(recommendedPriceRange("tourism", 6, 30)).toEqual({ min: 115_000, max: 190_000 });
  });

  it("만 원 단위로 표시한다", () => {
    expect(formatWon(150_000)).toBe("15만 원");
    expect(formatWon(75_000)).toBe("7.5만 원");
    expect(formatWon(12_345)).toBe("12,345원");
    expect(formatRange({ min: 75_000, max: 125_000 })).toBe("7.5만 원~12.5만 원");
  });
});

describe("연락처 감지·삭제", () => {
  it("전화번호와 이메일을 찾아 지운다", () => {
    expect(hasContactPattern("연락 주세요 010 1234 5678")).toBe(true);
    expect(hasContactPattern("메일 a.b@c.co.kr")).toBe(true);
    expect(hasContactPattern("4회차 60분 20만 원")).toBe(false);
    expect(maskContacts("02-123-4567로")).toBe("[연락처 삭제]로");
  });
});
