import { describe, expect, it } from "vitest";
import { safeNext } from "./safeNext";

describe("safeNext", () => {
  it("사이트 안 경로만 허용한다", () => {
    expect(safeNext("/studio/designer")).toBe("/studio/designer");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("/\\evil.com")).toBe("/");
    expect(safeNext(undefined, "/studio")).toBe("/studio");
  });
});
