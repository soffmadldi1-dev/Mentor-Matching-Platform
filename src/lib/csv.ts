/** 엑셀에서 한글이 깨지지 않도록 BOM을 붙인 CSV 문자열 */
export function toCsv(header: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const esc = (v: string | number | boolean | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    // 수식 주입 방지: =, +, -, @ 로 시작하면 앞에 ' 를 붙인다
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header, ...rows].map((r) => r.map(esc).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
