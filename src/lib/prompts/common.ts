// 모든 AI 프롬프트에 공통으로 들어가는 규칙 (CLAUDE.md 9장)
export const COMMON_RULES = [
  "한국어 경어체로, 짧고 구체적으로 씁니다.",
  "합격·취업·수익·성과를 보장하는 표현(예: \"합격 보장\", \"수익 보장\", \"100%\")은 쓰지 않습니다.",
  "입력에 없는 경력·자격·수치·실적을 지어내지 않습니다. 필요한 정보가 없으면 \"[멘토 확인 필요]\"라고 표시합니다.",
];

export function commonRulesBlock(): string {
  return ["## 지켜야 할 규칙", ...COMMON_RULES.map((r, i) => `${i + 1}. ${r}`)].join("\n");
}

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
// 휴대폰·일반 전화번호 (하이픈·공백·점 구분 허용)
const PHONE_RE = /(?:\+?82[-.\s]?)?0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}/g;

/** 프롬프트에 넣기 전에 이메일·전화번호를 지운다 (CLAUDE.md 11장) */
export function maskContacts(text: string): string {
  return text.replace(EMAIL_RE, "[연락처 삭제]").replace(PHONE_RE, "[연락처 삭제]");
}

/** 연락처 패턴이 들어 있는지 검사 (게시 요청·메시지 경고용) */
export function hasContactPattern(text: string): boolean {
  EMAIL_RE.lastIndex = 0;
  PHONE_RE.lastIndex = 0;
  const found = EMAIL_RE.test(text) || PHONE_RE.test(text);
  EMAIL_RE.lastIndex = 0;
  PHONE_RE.lastIndex = 0;
  return found;
}

/** 빈 입력은 "(입력 없음)"으로 표시하고 연락처는 지운다 */
export function clean(value: string | undefined | null): string {
  const v = (value ?? "").trim();
  return v ? maskContacts(v) : "(입력 없음)";
}
