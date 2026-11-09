import { describe, expect, it } from "vitest";
import { gradeQuiz, MODULE_UNITS } from "./mentorModule";

describe("필수 모듈", () => {
  it("3개 단원, 단원별 3문항, 정답 번호가 보기 안에 있다", () => {
    expect(MODULE_UNITS).toHaveLength(3);
    for (const u of MODULE_UNITS) {
      expect(u.quiz).toHaveLength(3);
      for (const q of u.quiz) expect(q.answer).toBeLessThan(q.options.length);
    }
  });

  it("전부 맞혀야 통과하고, 틀린 문항을 알려 준다", () => {
    const u = MODULE_UNITS[0];
    expect(gradeQuiz(u, u.quiz.map((q) => q.answer)).passed).toBe(true);
    const r = gradeQuiz(u, [u.quiz[0].answer, null, (u.quiz[2].answer + 1) % 4]);
    expect(r.passed).toBe(false);
    expect(r.wrong).toEqual([1, 2]);
  });
});
