import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("CSV 내보내기", () => {
  it("BOM, 따옴표·쉼표·줄바꿈 이스케이프, 수식 주입 방지", () => {
    const csv = toCsv(["이름", "메모"], [["가나", 'a,"b"\nc'], ["다", "=SUM(A1)"], ["라", null]]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain('가나,"a,""b""\nc"');
    expect(csv).toContain("다,'=SUM(A1)");
    expect(csv).toContain("라,\r\n");
  });
});
