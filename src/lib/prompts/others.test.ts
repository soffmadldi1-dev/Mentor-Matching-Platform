import { describe, expect, it } from "vitest";
import { buildExperiencePrompt } from "./experience";
import { buildNeedSummaryPrompt } from "./needSummary";
import { buildMatchReasonPrompt } from "./matchReason";
import { buildSessionReportPrompt } from "./sessionReport";

describe("프롬프트 생성기 ①③④⑤", () => {
  it("모든 프롬프트에 공통 규칙이 들어가고 연락처가 지워진다", () => {
    const prompts = [
      buildExperiencePrompt("PM 5년, 연락처 010-2222-3333"),
      buildNeedSummaryPrompt("메일 me@example.com 으로 주세요"),
      buildMatchReasonPrompt({ 목표: "이직, 010-2222-3333" }, []),
      buildSessionReportPrompt({ courseTitle: "과정", sessionN: 2, sessionCount: 4, goal: "목표", output: "결과물", memo: "메모 010-2222-3333" }),
    ];
    for (const p of prompts) {
      expect(p).toContain("보장하는 표현");
      expect(p).not.toMatch(/010-2222-3333|me@example\.com/);
    }
  });

  it("경험 진단은 자산 3개 표와 한 문장 정의 형식을 요구한다", () => {
    const p = buildExperiencePrompt("PM 5년");
    expect(p.split("\n").filter((l) => l.startsWith("| … |"))).toHaveLength(3);
    expect(p).toContain("나는 ○○한 사람이 ○○하도록 돕는다");
  });

  it("매칭 프롬프트는 후보 정보와 평점을 넣는다", () => {
    const p = buildMatchReasonPrompt({ 목표: "면접" }, [
      { title: "면접 공략", target: "수험생", finalOutput: "스크립트", sessionGoals: ["구조", "리허설"], mentorHeadline: "현직", avgRating: 4.75 },
      { title: "자소서", target: "이직", finalOutput: "자소서", sessionGoals: ["분석"], mentorHeadline: "인사", avgRating: null },
    ]);
    expect(p).toContain("후보 1. 면접 공략");
    expect(p).toContain("평균 평점: 4.8");
    expect(p).toContain("후기 없음");
    expect(p).toContain("구조 → 리허설");
  });

  it("회차 리포트는 회차와 결과물을 넣는다", () => {
    const p = buildSessionReportPrompt({ courseTitle: "면접 공략", sessionN: 3, sessionCount: 4, goal: "돌발 질문", output: "대응 노트", memo: "잘함" });
    expect(p).toContain("회차: 3 / 4");
    expect(p).toContain("대응 노트");
  });
});
