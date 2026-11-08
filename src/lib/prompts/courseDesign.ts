import { getField, MODE_LABELS, type CourseMode, type FieldSlug } from "@/lib/fields";
import { clean, commonRulesBlock } from "./common";
import { formatRange, formatWon, recommendedPriceRange } from "./pricing";

// ② 공략 설계기 입력 (CLAUDE.md 9장)
export type CourseDesignInput = {
  field: FieldSlug;
  experience: string;
  who: string;
  finalOutput: string;
  sessionCount: 2 | 3 | 4 | 6;
  minutes: 30 | 60 | 90;
  mode: CourseMode;
  desiredPrice?: number | null;
  keywords: string;
};

export const SESSION_COUNT_OPTIONS = [2, 3, 4, 6] as const;
export const MINUTES_OPTIONS = [30, 60, 90] as const;

/** 출력 형식 11개 항목 제목 — 프롬프트와 "가져오기" 파서가 같은 제목을 쓴다 */
export const DESIGN_SECTIONS = [
  "과정명",
  "한 줄 소개",
  "대상",
  "Before → After",
  "회차별 공략",
  "준비물",
  "교육 안내문",
  "추천 가격과 근거",
  "헤드카피 3안",
  "출시 전 멘토 확인 사항",
  "멘토에게 묻고 싶은 질문",
] as const;

/** 공략 설계 프롬프트를 만든다. 입력 → 문자열 (순수 함수) */
export function buildCourseDesignPrompt(input: CourseDesignInput): string {
  const field = getField(input.field);
  const range = recommendedPriceRange(input.field, input.sessionCount, input.minutes);
  const n = input.sessionCount;
  const finalOutput = clean(input.finalOutput);

  const priceLine =
    input.desiredPrice && input.desiredPrice > 0
      ? `- 희망 가격: ${formatWon(input.desiredPrice)} (권장 구간과 비교해 그대로 둘지, 조정할지 의견을 주세요)`
      : `- 희망 가격: 없음 (권장 구간 안에서 제안해 주세요)`;

  const rows = Array.from({ length: n }, (_, i) =>
    i === n - 1
      ? `| ${i + 1}회차 | … | … | ${finalOutput} | … |`
      : `| ${i + 1}회차 | … | … | … | … |`,
  ).join("\n");

  return `당신은 경험 기반 멘토링 플랫폼 "먼저가본(인생공략집)"의 교육과정 설계 코치입니다.
아래 멘토의 경험을 바탕으로, 멘티가 매 회차 결과물을 손에 쥐고 가는 ${n}회차 "공략 과정"을 설계해 주세요.

## 멘토 입력
- 분야: ${field?.name ?? input.field}
- 내 경험: ${clean(input.experience)}
- 돕고 싶은 사람: ${clean(input.who)}
- 최종 결과물: ${finalOutput}
- 구성: ${n}회차, 회당 ${input.minutes}분, ${MODE_LABELS[input.mode]}
${priceLine}
- 강점 키워드: ${clean(input.keywords)}

## 설계 조건
1. 회차는 정확히 ${n}개입니다. 더 늘리거나 줄이지 않습니다.
2. 매 회차에 멘티가 가져가는 결과물을 명사로 구체적으로 씁니다(예: "지원 동기 문단 초안 1개").
3. 마지막 ${n}회차의 결과물은 반드시 "${finalOutput}"입니다.
4. 회당 ${input.minutes}분 안에 끝낼 수 있는 분량으로 진행 내용을 잡습니다.
5. 가격 권장 구간은 ${formatRange(range)}입니다(이 분야 4회·60분 기준 구간을 회차·시간에 비례해 조정한 값). 구간 밖을 제안하면 이유를 씁니다.
6. "출시 전 멘토 확인 사항"에는 사실 확인, 관련 법규·자격 요건, 개인정보, 과장 표현처럼 멘토가 게시 전에 직접 확인할 것을 2~3개 씁니다.

${commonRulesBlock()}

## 출력 형식
아래 제목과 순서를 그대로 지켜 마크다운으로 답해 주세요. 앞뒤 인사말은 쓰지 않습니다.

### 1. ${DESIGN_SECTIONS[0]}
(30자 이내 한 줄)

### 2. ${DESIGN_SECTIONS[1]}
(60자 이내 한 줄)

### 3. ${DESIGN_SECTIONS[2]}
(누가, 어떤 상황에서 들으면 좋은지 1~2문장)

### 4. ${DESIGN_SECTIONS[3]}
- Before: (지금 멘티의 상태)
- After: (과정을 마친 뒤 멘티의 상태)

### 5. ${DESIGN_SECTIONS[4]}
| 회차 | 목표 | 진행 내용 | 멘티가 가져가는 결과물 | 과제 |
|---|---|---|---|---|
${rows}

### 6. ${DESIGN_SECTIONS[5]}
- (멘티가 미리 준비할 것, 항목별 한 줄)

### 7. ${DESIGN_SECTIONS[6]}
(정확히 3문장)

### 8. ${DESIGN_SECTIONS[7]}
- 추천 가격: (숫자)원
- 근거: (1~2문장)

### 9. ${DESIGN_SECTIONS[8]}
1. 
2. 
3. 

### 10. ${DESIGN_SECTIONS[9]}
- (2~3개)

### 11. ${DESIGN_SECTIONS[10]}
1. 
2. 
`;
}

/** AI 답을 받은 뒤 확인할 것 (설계기 결과 영역 체크리스트) */
export function courseDesignChecklist(input: Pick<CourseDesignInput, "sessionCount" | "finalOutput">): string[] {
  const out = input.finalOutput.trim() || "입력한 최종 결과물";
  return [
    `회차표가 정확히 ${input.sessionCount}행인가요?`,
    `마지막 ${input.sessionCount}회차 결과물이 "${out}"인가요?`,
    "내가 쓰지 않은 경력·자격·수치가 지어내져 들어가지 않았나요?",
    "\"합격 보장\", \"수익 보장\" 같은 보장 표현이 없나요?",
  ];
}
