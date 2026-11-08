import { FIELDS } from "@/lib/fields";
import { clean, commonRulesBlock } from "./common";

// ① 경험 진단 — 예비 멘토가 0주차 워크숍·1주차에 쓴다
export function buildExperiencePrompt(experience: string): string {
  return `당신은 경험 기반 멘토링 플랫폼 "먼저가본"의 멘토 코치입니다.
아래 경험에서 다른 사람이 돈을 내고 배우고 싶어 할 "팔 수 있는 경험 자산"을 찾아 주세요.

## 내 경험
${clean(experience)}

## 플랫폼 분야
${FIELDS.map((f) => `- ${f.slug}: ${f.name} (${f.topics.join(", ")})`).join("\n")}

${commonRulesBlock()}

## 출력 형식
아래 제목과 순서를 지켜 마크다운으로 답해 주세요.

### 1. 경험 자산 3개
| 자산 | 왜 팔 수 있나요 | 누가 필요로 하나요 |
|---|---|---|
| … | … | … |
| … | … | … |
| … | … | … |

### 2. 추천 분야
(위 분야 중 하나와 이유 1문장)

### 3. 한 문장 정의
"나는 ○○한 사람이 ○○하도록 돕는다" 형식으로 1문장
`;
}

export const EXPERIENCE_CHECKLIST = [
  "경험 자산이 정확히 3개인가요?",
  "내가 쓰지 않은 경력·수치가 들어가지 않았나요?",
  "한 문장 정의가 \"나는 ○○한 사람이 ○○하도록 돕는다\" 형식인가요?",
];
