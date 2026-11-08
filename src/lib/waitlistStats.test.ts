import { describe, expect, it } from "vitest";
import { aggregateWaitlist } from "./waitlistStats";

describe("대기자 집계", () => {
  it("분야·관심별로 센다", () => {
    const r = aggregateWaitlist([
      { role_interest: "mentee", field_slug: "career" },
      { role_interest: "mentor", field_slug: "career" },
      { role_interest: "mentee", field_slug: "tourism" },
      { role_interest: "mentee", field_slug: null },
    ]);
    expect(r.rows.find((x) => x.slug === "career")).toMatchObject({ mentee: 1, mentor: 1, total: 2 });
    expect(r.rows.find((x) => x.slug === "none")).toMatchObject({ total: 1 });
    expect(r.totals).toEqual({ mentee: 3, mentor: 1, total: 4 });
  });
});
