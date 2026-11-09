import { describe, expect, it } from "vitest";
import { joinSteps, recommendTrack } from "./mentorTracks";

describe("멘토 입구", () => {
  it("질문 2개로 입구를 추천한다", () => {
    expect(recommendTrack(true, true)).toBe("B");
    expect(recommendTrack(true, false)).toBe("B");
    expect(recommendTrack(false, true)).toBe("A");
    expect(recommendTrack(false, false)).toBe("C");
  });
  it("B만 경력 증빙·인터뷰 단계가 있다", () => {
    expect(joinSteps("A")).toEqual(["basic", "module", "design", "submit"]);
    expect(joinSteps("B")).toHaveLength(6);
  });
});
