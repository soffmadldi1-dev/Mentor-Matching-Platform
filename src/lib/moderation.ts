import { hasContactPattern } from "@/lib/prompts/common";

// 게시 요청 시 검사 (CLAUDE.md 11장): 보장 표현, 외부 연락처 패턴
const GUARANTEE_RE = /(합격|취업|수익|매출|성과|결과)\s*(을|를)?\s*보장|100\s*%|무조건\s*(합격|성공)/;

export function hasGuaranteeExpression(text: string): boolean {
  return GUARANTEE_RE.test(text);
}

/** 항목별 텍스트를 검사해 경고 목록을 돌려준다 */
export function checkPublishText(fields: Record<string, string | string[] | undefined>): string[] {
  const warnings: string[] = [];
  for (const [label, value] of Object.entries(fields)) {
    const text = Array.isArray(value) ? value.join("\n") : value ?? "";
    if (!text) continue;
    if (hasGuaranteeExpression(text)) warnings.push(`"합격 보장" 같은 보장 표현이 있습니다 (${label})`);
    if (hasContactPattern(text)) warnings.push(`전화번호·이메일로 보이는 내용이 있습니다 (${label})`);
  }
  return warnings;
}
