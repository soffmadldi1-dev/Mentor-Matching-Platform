import { clean, commonRulesBlock } from "./common";

// ④ 매칭 추천 — 운영자용 "추천 이유 초안 만들기"
export type MatchCandidate = {
  title: string;
  target: string;
  finalOutput: string;
  sessionGoals: string[];
  mentorHeadline: string;
  avgRating: number | null;
};

export function buildMatchReasonPrompt(request: Record<string, string>, candidates: MatchCandidate[]): string {
  const req = Object.entries(request)
    .map(([k, v]) => `- ${k}: ${clean(v)}`)
    .join("\n");
  const list = candidates
    .map(
      (c, i) => `### 후보 ${i + 1}. ${c.title}
- 대상: ${clean(c.target)}
- 최종 결과물: ${clean(c.finalOutput)}
- 회차 목표: ${c.sessionGoals.join(" → ")}
- 멘토: ${clean(c.mentorHeadline)}
- 평균 평점: ${c.avgRating === null ? "후기 없음" : c.avgRating.toFixed(1)}`,
    )
    .join("\n\n");

  return `당신은 멘토링 플랫폼 "먼저가본"의 매칭 담당자입니다.
멘티의 공략 요청서와 후보 과정을 비교해, 멘티에게 보여 줄 추천 이유 초안을 써 주세요. 최종 선택은 운영자와 멘티가 합니다.

## 공략 요청서
${req}

## 후보 과정
${list}

${commonRulesBlock()}
4. 요청서와 과정 정보에 근거한 이유만 씁니다.

## 출력 형식
후보마다 아래 형식으로, 잘 맞는 순서대로 최대 3개만 답해 주세요.

### (과정명)
- 적합도: (0~100)
- 추천 이유 1:
- 추천 이유 2:
- 추천 이유 3:
- 주의할 점: (1문장)

마지막에 멘티에게 확인할 질문 1개를 덧붙여 주세요.
`;
}
