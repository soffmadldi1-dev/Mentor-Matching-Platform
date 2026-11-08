import { Fragment, type ReactNode } from "react";

// AI 답(마크다운)을 안전하게 보여 주는 작은 렌더러.
// 제목·목록·표·굵은 글씨만 처리하고 HTML은 그대로 문자로 보여 준다(dangerouslySetInnerHTML 사용 안 함).

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <Fragment key={i}>{p}</Fragment>,
  );
}

const cells = (line: string) => line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
const isSep = (line: string) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());

export function MarkdownView({ markdown, className = "" }: { markdown: string; className?: string }) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();
    if (!t) { i++; continue; }

    const h = t.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const cls = level <= 2 ? "mt-6 text-lg font-bold text-navy" : "mt-5 text-[16px] font-bold text-navy";
      out.push(<p key={key++} className={cls}>{inline(h[2])}</p>);
      i++;
      continue;
    }

    // 표: 모바일에서는 카드형으로 세로 적층
    if (t.startsWith("|") && i + 1 < lines.length && isSep(lines[i + 1])) {
      const head = cells(t);
      const body: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith("|")) body.push(cells(lines[i++]));
      out.push(
        <div key={key++} className="mt-3">
          <table className="hidden w-full border-collapse text-sm md:table">
            <thead>
              <tr>{head.map((c, j) => <th key={j} className="border border-line bg-panel px-2 py-1.5 text-left font-bold">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>{head.map((_, j) => <td key={j} className="border border-line px-2 py-1.5 align-top">{inline(r[j] ?? "")}</td>)}</tr>
              ))}
            </tbody>
          </table>
          <div className="space-y-2 md:hidden">
            {body.map((r, ri) => (
              <dl key={ri} className="rounded-lg border border-line p-3 text-sm">
                {head.map((hcell, j) => (
                  <div key={j} className="flex gap-2 py-0.5">
                    <dt className="w-24 shrink-0 font-bold text-sub">{hcell}</dt>
                    <dd className="min-w-0 flex-1">{inline(r[j] ?? "")}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
        </div>,
      );
      continue;
    }

    const ul = t.match(/^[-*•]\s+(.*)$/);
    const ol = t.match(/^(\d+)[.)]\s+(.*)$/);
    if (ul || ol) {
      const ordered = !!ol;
      const items: string[] = [];
      while (i < lines.length) {
        const m = ordered ? lines[i].trim().match(/^\d+[.)]\s+(.*)$/) : lines[i].trim().match(/^[-*•]\s+(.*)$/);
        if (!m) break;
        items.push(m[1]);
        i++;
      }
      const Tag = ordered ? "ol" : "ul";
      out.push(
        <Tag key={key++} className={`mt-2 space-y-1 pl-5 text-[15px] ${ordered ? "list-decimal" : "list-disc"}`}>
          {items.map((it, j) => <li key={j}>{inline(it)}</li>)}
        </Tag>,
      );
      continue;
    }

    // 문단: 빈 줄이나 다른 블록이 나올 때까지
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|[-*•]\s|\d+[.)]\s|\|)/.test(lines[i].trim())) para.push(lines[i++].trim());
    if (!para.length) { para.push(t); i++; }
    out.push(<p key={key++} className="mt-2 text-[15px] leading-relaxed">{inline(para.join(" "))}</p>);
  }

  return <div className={`text-ink ${className}`}>{out}</div>;
}
