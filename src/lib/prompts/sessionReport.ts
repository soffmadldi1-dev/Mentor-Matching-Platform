import { clean, commonRulesBlock } from "./common";

// ⑤ 회차 리포트 — 멘토 메모 3줄로 멘티용 요약·다음 과제를 만든다
export type SessionReportInput = {
  courseTitle: string;
  sessionN: number;
  sessionCount: number;
  goal: string;
  output: string;
  memo: string;
};

export function buildSessionReportPrompt(i: SessionReportInput): string {
  return `당신은 멘토링 플랫폼 "먼저가본"의 회차 리포트 작성 도우미입니다.
멘토의 메모를 바탕으로 멘티에게 보낼 회차 리포트를 써 주세요.

## 과정 정보
- 과정: ${clean(i.courseTitle)}
- 회차: ${i.sessionN} / ${i.sessionCount}
- 이번 회차 목표: ${clean(i.goal)}
- 이번 회차 결과물: ${clean(i.output)}

## 멘토 메모
${clean(i.memo)}

${commonRulesBlock()}
4. 멘티 이름·연락처는 쓰지 않습니다. 메모에 없는 평가는 덧붙이지 않습니다.

## 출력 형식
### 1. 멘티용 요약
(3문장 이내, 멘티에게 직접 말하듯)
### 2. 다음 과제
(1~2개, 구체적으로)
### 3. 멘토 품질 점검
(이번 회차 목표·결과물이 달성됐는지, 보완할 점 1줄)
### 4. 기관 보고용 한 줄
(개인정보 없이 진행 사실과 결과물만)
`;
}
