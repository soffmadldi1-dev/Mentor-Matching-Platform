// AI가 돌려준 설계서 마크다운을 과정 편집 폼 값으로 옮긴다("가져오기" 버튼).
// 형식이 조금 달라도 찾을 수 있는 것만 채우고, 못 찾은 항목은 missing에 담아 수동 입력을 안내한다.

export type SessionRow = {
  n: number;
  goal: string;
  activities: string;
  output: string;
  homework: string;
};

export type ParsedDesign = {
  title?: string;
  oneLiner?: string;
  target?: string;
  before?: string;
  after?: string;
  sessions?: SessionRow[];
  prep?: string[];
  notice?: string;
  price?: number;
  headlines?: string[];
  checks?: string[];
};

export type ParseResult = { data: ParsedDesign; missing: string[] };

const stripMd = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<br\s*\/?>/gi, " ")
    .trim();

/** "### 1. 과정명" 같은 제목으로 구획을 나눈다. 키는 제목 앞 번호 */
function splitSections(md: string): Map<number, string[]> {
  const sections = new Map<number, string[]>();
  let current: number | null = null;
  for (const raw of md.replace(/\r\n/g, "\n").split("\n")) {
    const heading = raw.match(/^\s*#{1,6}\s*(\d{1,2})\s*[.)]?\s*(.*)$/);
    if (heading) {
      current = Number(heading[1]);
      sections.set(current, []);
      continue;
    }
    if (current !== null) sections.get(current)!.push(raw);
  }
  return sections;
}

const nonEmpty = (lines: string[]) => lines.map((l) => l.trim()).filter(Boolean);

function firstText(lines: string[] | undefined): string | undefined {
  if (!lines) return undefined;
  const text = nonEmpty(lines)
    .map((l) => stripMd(l.replace(/^[-*]\s+/, "")))
    .join(" ")
    .trim();
  return text || undefined;
}

function listItems(lines: string[] | undefined): string[] | undefined {
  if (!lines) return undefined;
  const items = nonEmpty(lines)
    .map((l) => l.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/)?.[1])
    .filter((v): v is string => !!v)
    .map(stripMd)
    .filter(Boolean);
  return items.length ? items : undefined;
}

/** "20만 원", "200,000원", "25만원" → 숫자 */
export function parseWon(text: string): number | undefined {
  const man = text.match(/(\d+(?:\.\d+)?)\s*만\s*원?/);
  if (man) return Math.round(Number(man[1]) * 10_000);
  const won = text.match(/(\d{1,3}(?:,\d{3})+|\d{4,})\s*원/);
  if (won) return Number(won[1].replace(/,/g, ""));
  return undefined;
}

function parseTable(lines: string[] | undefined): SessionRow[] | undefined {
  if (!lines) return undefined;
  const rows = nonEmpty(lines)
    .filter((l) => l.startsWith("|"))
    .map((l) =>
      l
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => stripMd(c)),
    )
    // 머리글과 구분선 제외
    .filter((cells) => !cells.every((c) => /^:?-{2,}:?$/.test(c)))
    .filter((cells) => !cells[0]?.includes("회차") || /\d/.test(cells[0]));

  const sessions = rows
    .filter((cells) => cells.length >= 5)
    .map((cells, i) => {
      const num = cells[0].match(/\d+/);
      return {
        n: num ? Number(num[0]) : i + 1,
        goal: cells[1],
        activities: cells[2],
        output: cells[3],
        homework: cells[4],
      };
    });
  return sessions.length ? sessions : undefined;
}

export function parseDesignMarkdown(md: string): ParseResult {
  const s = splitSections(md);
  const data: ParsedDesign = {};

  data.title = firstText(s.get(1));
  data.oneLiner = firstText(s.get(2));
  data.target = firstText(s.get(3));

  const ba = s.get(4) ?? [];
  for (const line of ba) {
    const m = line.match(/(Before|After|비포|애프터)\s*[:：]\s*(.+)$/i);
    if (!m) continue;
    const key = /before|비포/i.test(m[1]) ? "before" : "after";
    data[key] = stripMd(m[2]);
  }

  data.sessions = parseTable(s.get(5));
  data.prep = listItems(s.get(6));
  data.notice = firstText(s.get(7));

  const priceLines = s.get(8) ?? [];
  const priceLine = priceLines.find((l) => /추천\s*가격/.test(l)) ?? priceLines.join(" ");
  data.price = parseWon(priceLine);

  data.headlines = listItems(s.get(9));
  data.checks = listItems(s.get(10));

  const labels: Record<keyof ParsedDesign, string> = {
    title: "과정명",
    oneLiner: "한 줄 소개",
    target: "대상",
    before: "Before",
    after: "After",
    sessions: "회차표",
    prep: "준비물",
    notice: "교육 안내문",
    price: "가격",
    headlines: "헤드카피",
    checks: "확인 사항",
  };
  const missing = (Object.keys(labels) as (keyof ParsedDesign)[])
    .filter((k) => data[k] === undefined)
    .map((k) => labels[k]);

  return { data, missing };
}
