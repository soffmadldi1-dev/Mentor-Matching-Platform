import { describe, expect, it } from "vitest";
import { createSeed } from "./seed";
import { courseRating, fieldOutcomes, isMatchEligible, mentorBadges, mentorGradeInfo, mentorQuality, publishedCourses } from "./selectors";

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

describe("멘토 입구·등급 예시 데이터", () => {
  const s = createSeed();
  const grade = (id: string) => mentorGradeInfo(s, id, new Date("2026-11-08"));

  it("A·B·C 입구 멘토가 각각 있다", () => {
    const tracks = s.mentors.filter((m) => m.approvedAt).map((m) => m.track);
    expect(tracks).toContain("A");
    expect(tracks).toContain("B");
    expect(tracks).toContain("C");
  });

  it("등급이 실적으로 계산된다", () => {
    expect(grade("m-r").grade).toBe("registered");
    expect(grade("m-r").probation).toBe(true);
    expect(grade("m-f").grade).toBe("registered");
    expect(grade("m-a").grade).toBe("certified");
    expect(grade("m-m").grade).toBe("master");
    expect(grade("me-cand").grade).toBeNull();
    expect(grade("m-d").boosted).toBe(true);
  });

  it("마스터 멘토 과정이 분야 목록 맨 위에 오고, 배지는 등급·파운딩·새로 온 멘토로 나뉜다", () => {
    expect(publishedCourses(s, "tourism")[0].mentorId).toBe("m-m");
    expect(mentorBadges(s, "m-a")).toEqual(["인증 멘토", "파운딩 멘토"]);
    expect(mentorBadges(s, "m-r")).toEqual(["등록 멘토", "새로 온 멘토"]);
  });

  it("추천 매칭 대상은 인증 멘토 이상", () => {
    expect(isMatchEligible(s, "m-a")).toBe(true);
    expect(isMatchEligible(s, "m-r")).toBe(false);
  });

  it("예시 지원서가 입구별로 있다", () => {
    expect(s.applications.map((a) => a.track).sort()).toEqual(["A", "A", "B"]);
  });
});
