import { FIELDS } from "@/lib/fields";
import { clean, commonRulesBlock } from "./common";

// ③ 니즈 정리 — 멘티가 고민을 자유롭게 쓰면 5개 질문 형식으로 정리받는다
export const NEED_QUESTIONS = [
  { key: "current", label: "지금 어디에 있나요?", placeholder: "예: 관광통역안내사 필기 합격, 여행사 아르바이트 1년" },
  { key: "goal", label: "어디로 가고 싶나요?", placeholder: "예: 올해 면접에 합격해 안내사로 일하고 싶어요" },
  { key: "blocker", label: "무엇이 막혔나요?", placeholder: "예: 혼자 준비하니 무엇이 부족한지 모르겠어요" },
  { key: "output", label: "어떤 결과물이 필요한가요?", placeholder: "예: 실제로 말할 수 있는 면접 답변 스크립트" },
  { key: "timeline", label: "언제까지, 예산은요?", placeholder: "예: 다음 달 면접 · 20만 원 안팎" },
] as const;

export function buildNeedSummaryPrompt(rawText: string): string {
  return `당신은 멘토링 플랫폼 "먼저가본"의 상담 코디네이터입니다.
아래 고민을 읽고, 멘토를 추천받기 위한 "공략 요청서"로 정리해 주세요.

## 내 고민
${clean(rawText)}

## 플랫폼 분야
${FIELDS.map((f) => `- ${f.name}`).join("\n")}

${commonRulesBlock()}
4. 고민에 없는 내용은 추측하지 말고 "(확인 필요)"라고 씁니다.

## 출력 형식
아래 제목과 순서를 지켜 답해 주세요. 각 항목은 1~2문장입니다.

### 1. 지금 어디에 있나요
### 2. 어디로 가고 싶나요
### 3. 무엇이 막혔나요
### 4. 어떤 결과물이 필요한가요
### 5. 언제까지·예산은
### 6. 맞는 분야
(위 분야 중 하나)
### 7. 멘토에게 먼저 확인할 질문
(1개)
`;
}

export const NEED_SUMMARY_CHECKLIST = [
  "내가 쓰지 않은 내용이 사실처럼 들어가지 않았나요?",
  "\"(확인 필요)\" 항목은 직접 채웠나요?",
  "이름·연락처 같은 개인정보는 빼고 붙여넣으세요.",
];
