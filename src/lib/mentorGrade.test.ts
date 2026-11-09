import { describe, expect, it } from "vitest";
import { baseGrade, computeGrade, effectiveGrade } from "./mentorGrade";

describe("멘토 등급 계산", () => {
  it("입구별 승인 등급: A 등록, B·C 인증", () => {
    expect(baseGrade("A")).toBe("registered");
    expect(baseGrade("B")).toBe("certified");
    expect(baseGrade("C")).toBe("certified");
    expect(computeGrade({ track: "B", sales: 0, avgRating: null, reportRate: null }).grade).toBe("certified");
  });

  it("셀프 등록 멘토는 판매 3건·평점 4.6·리포트 90% 이상이면 인증 멘토로 자동 승급", () => {
    const r = computeGrade({ track: "A", sales: 3, avgRating: 4.6, reportRate: 1 });
    expect(r.grade).toBe("certified");
    expect(r.probation).toBe(false);
    expect(r.next?.grade).toBe("master");
  });

  it("제출할 리포트가 없으면(null) 제출률 조건은 충족으로 본다", () => {
    expect(computeGrade({ track: "A", sales: 3, avgRating: 4.6, reportRate: null }).grade).toBe("certified");
  });

  it("조건이 모자라면 등록 멘토에 머물고 남은 조건을 알려 준다", () => {
    const r = computeGrade({ track: "A", sales: 2, avgRating: 4.0, reportRate: 0.8 });
    expect(r.grade).toBe("registered");
    expect(r.probation).toBe(true);
    expect(r.next?.grade).toBe("certified");
    expect(r.next?.remaining).toHaveLength(3);
    expect(r.next?.remaining[0]).toContain("판매 1건 더");
    expect(r.next!.progress).toBeGreaterThan(0);
    expect(r.next!.progress).toBeLessThan(1);
  });

  it("판매 20건·평점 4.7 이상이면 마스터 멘토", () => {
    expect(computeGrade({ track: "B", sales: 20, avgRating: 4.7, reportRate: 1 }).grade).toBe("master");
    expect(computeGrade({ track: "B", sales: 19, avgRating: 4.9, reportRate: 1 }).grade).toBe("certified");
    expect(computeGrade({ track: "B", sales: 25, avgRating: 4.6, reportRate: 1 }).grade).toBe("certified");
    expect(computeGrade({ track: "C", sales: 22, avgRating: 4.8, reportRate: 1 }).next).toBeNull();
  });

  it("셀프 등록 멘토가 마스터가 되려면 인증 조건(리포트 제출률)도 채워야 한다", () => {
    expect(computeGrade({ track: "A", sales: 20, avgRating: 4.8, reportRate: 0.5 }).grade).toBe("registered");
    expect(computeGrade({ track: "A", sales: 20, avgRating: 4.8, reportRate: 0.95 }).grade).toBe("master");
  });

  it("운영자 수동 조정(정지 포함)이 자동 등급보다 우선한다", () => {
    const r = computeGrade({ track: "B", sales: 30, avgRating: 4.9, reportRate: 1 });
    expect(effectiveGrade(r)).toBe("master");
    expect(effectiveGrade(r, { grade: "suspended", reason: "외부 직거래 유도", at: "2026-11-01" })).toBe("suspended");
    expect(effectiveGrade(r, { grade: "registered", reason: "후기 조작 의심", at: "2026-11-01" })).toBe("registered");
  });
});
