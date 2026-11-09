import { parseDesignMarkdown, type SessionRow } from "@/lib/designer/parseDesign";
import { hasGuaranteeExpression } from "@/lib/moderation";
import { hasContactPattern } from "@/lib/prompts/common";

// 설계서 기준 자동 검사 (멘토 지원 공통 관문 3) — 제출 시 자동 검사 + 운영자 확인

export type DesignCheckItem = { key: "outputs" | "final" | "guarantee" | "contact"; label: string; ok: boolean; detail: string };

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

export function checkDesignSessions(input: { sessionCount: number; finalOutput: string; sessions: SessionRow[]; text: string }): DesignCheckItem[] {
  const { sessionCount, finalOutput, sessions, text } = input;
  const missing = Array.from({ length: sessionCount }, (_, i) => i + 1).filter(
    (n) => !sessions.find((s) => s.n === n && s.output.trim() && s.output.trim() !== "…"),
  );
  const rowsOk = sessions.length === sessionCount && missing.length === 0;
  const last = sessions.find((s) => s.n === sessionCount)?.output ?? "";
  const finalOk = !!finalOutput.trim() && norm(last) === norm(finalOutput);

  return [
    {
      key: "outputs",
      label: `회차 수(${sessionCount})만큼 회차별 결과물이 모두 채워졌나요`,
      ok: rowsOk,
      detail: rowsOk
        ? "모든 회차에 결과물이 있습니다."
        : sessions.length !== sessionCount
          ? `회차표가 ${sessions.length}행입니다. ${sessionCount}행이어야 합니다.`
          : `${missing.join(", ")}회차 결과물이 비어 있습니다.`,
    },
    {
      key: "final",
      label: "마지막 회차 결과물이 최종 결과물과 같나요",
      ok: finalOk,
      detail: finalOk ? "같습니다." : `마지막 회차 결과물 "${last || "(없음)"}" ≠ 최종 결과물 "${finalOutput || "(미입력)"}"`,
    },
    {
      key: "guarantee",
      label: "\"합격 보장\", \"수익 보장\", \"100%\" 같은 표현이 없나요",
      ok: !hasGuaranteeExpression(text),
      detail: hasGuaranteeExpression(text) ? "보장 표현이 있습니다. 결과를 약속하지 않는 문장으로 고쳐 주세요." : "없습니다.",
    },
    {
      key: "contact",
      label: "전화번호·이메일이 없나요",
      ok: !hasContactPattern(text),
      detail: hasContactPattern(text) ? "연락처로 보이는 내용이 있습니다. 외부 직거래로 이어질 수 있어 지워 주세요." : "없습니다.",
    },
  ];
}

/**
 * 멘티에게 보이지 않는 10번(출시 전 멘토 확인 사항)·11번(멘토에게 묻는 질문)은 표현 검사에서 뺀다.
 * 이 칸에는 "'수익 보장' 같은 표현이 없는지 확인하기"처럼 검사 대상 단어가 설명으로 들어가기 때문이다.
 */
export function publicDesignText(markdown: string): string {
  const out: string[] = [];
  let skip = false;
  for (const line of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const h = line.match(/^\s*#{1,6}\s*(\d{1,2})\s*[.)]?/);
    if (h) skip = Number(h[1]) >= 10;
    if (!skip) out.push(line);
  }
  return out.join("\n");
}

/** 설계서 마크다운을 읽어 검사한다 */
export function checkDesignMarkdown(markdown: string, sessionCount: number, finalOutput: string): DesignCheckItem[] {
  const { data } = parseDesignMarkdown(markdown);
  return checkDesignSessions({ sessionCount, finalOutput, sessions: data.sessions ?? [], text: publicDesignText(markdown) });
}

export const allPassed = (items: DesignCheckItem[]) => items.every((i) => i.ok);
