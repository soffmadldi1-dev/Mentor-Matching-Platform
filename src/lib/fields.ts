// 핵심 분야 3개 (CLAUDE.md 3장). DB fields 테이블과 slug를 맞춘다.
export type FieldSlug = "career" | "tourism" | "venture";

export type FieldInfo = {
  slug: FieldSlug;
  no: string; // 분야 번호 (실제 의미가 있는 번호)
  name: string;
  short: string;
  description: string;
  topics: string[];
  outputs: string[]; // 대표 결과물
};

export const FIELDS: FieldInfo[] = [
  {
    slug: "career",
    no: "01",
    name: "취업·이직 공략",
    short: "취업·이직",
    description: "서류부터 면접, 직무 선택과 진로 탐색까지. 먼저 붙어 본 사람이 지금 막힌 지점을 함께 풉니다.",
    topics: ["서류", "면접", "직무 분석", "진로 탐색"],
    outputs: ["지원 직무에 맞춘 이력서 1부", "예상 질문별 면접 답변 노트"],
  },
  {
    slug: "tourism",
    no: "02",
    name: "관광 커리어 공략",
    short: "관광 커리어",
    description: "관광통역안내사, 여행사, MICE, 호텔, 관광공기업. 현장을 지나온 사람이 들어가는 길을 보여 줍니다.",
    topics: ["관광통역안내사", "여행사", "MICE", "호텔", "관광공기업"],
    outputs: ["관광통역안내사 면접 답변 스크립트", "관광 분야 지원 전략표"],
  },
  {
    slug: "venture",
    no: "03",
    name: "경험 수익화·1인 창업 공략",
    short: "경험 수익화·창업",
    description: "내 경험을 상품으로 만들고, 알리고, 첫 판매까지. 세무·회계 기초도 함께 챙깁니다.",
    topics: ["경험 상품화", "SNS 운영", "세무·회계 기초"],
    outputs: ["내 경험 상품 기획서 1장", "첫 강의·상담 상세페이지 초안"],
  },
];

export const FIELD_SLUGS = FIELDS.map((f) => f.slug) as [FieldSlug, ...FieldSlug[]];

export function getField(slug: string): FieldInfo | undefined {
  return FIELDS.find((f) => f.slug === slug);
}

export const MODE_LABELS = {
  online: "온라인",
  offline: "오프라인",
  hybrid: "온·오프라인 병행",
} as const;
export type CourseMode = keyof typeof MODE_LABELS;
