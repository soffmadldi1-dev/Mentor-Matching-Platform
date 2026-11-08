import { describe, expect, it } from "vitest";
import { createSeed } from "./seed";
import { courseRating, fieldOutcomes, mentorQuality, publishedCourses } from "./selectors";

describe("데모 데이터 계산", () => {
  const s = createSeed();

  it("예시 데이터의 등장인물은 모두 '예시' 또는 운영자다", () => {
    for (const p of s.people) expect(p.name === "운영자" || p.name.startsWith("예시")).toBe(true);
    for (const w of s.waitlist) expect(w.name.startsWith("예시")).toBe(true);
  });

  it("게시 과정은 회차표가 회차 수와 같다", () => {
    for (const c of publishedCourses(s)) expect(c.sessions).toHaveLength(c.sessionCount);
  });

  it("평점을 계산한다", () => {
    expect(courseRating(s, "c-insta")).toEqual({ avg: 4, count: 2 });
    expect(courseRating(s, "없음")).toEqual({ avg: null, count: 0 });
  });

  it("인증 유지 기준 미달 멘토에게 경고를 붙인다", () => {
    const q = mentorQuality(s);
    expect(q.find((m) => m.mentorId === "m-e")!.warnings.join()).toContain("리포트 제출률");
    expect(q.find((m) => m.mentorId === "m-f")!.warnings.join()).toContain("평균 후기");
    expect(q.find((m) => m.mentorId === "m-a")!.warnings).toEqual([]);
  });

  it("분야별 성과를 센다", () => {
    const o = fieldOutcomes(s);
    expect(o).toHaveLength(3);
    expect(o.reduce((a, x) => a + x.enrollments, 0)).toBe(s.bookings.length);
  });
});
