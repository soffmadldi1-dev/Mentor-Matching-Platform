import type { MentorTrack } from "@/lib/mentorGrade";

// 멘토 입구 3개 (멘토 입구 개편 v1)
export type TrackInfo = {
  track: MentorTrack;
  name: string;
  who: string;
  time: string;
  result: string;
  steps: string[];
  cta: { label: string; href: string };
};

export const TRACKS: TrackInfo[] = [
  {
    track: "A",
    name: "셀프 등록",
    who: "경험이 있고 혼자 과정을 만들 수 있는 분",
    time: "약 1~2시간 + 심사 3일 이내",
    result: "등록 멘토 (실적이 쌓이면 인증 멘토로 자동 승급)",
    steps: ["기본 정보", "필수 모듈", "설계서 제출", "운영자 심사"],
    cta: { label: "셀프 등록 시작", href: "/mentor/join/A" },
  },
  {
    track: "B",
    name: "경력 인증 (빠른 등록)",
    who: "강사·코치·컨설턴트 경력이 있는 분",
    time: "약 1시간 + 20분 화상 인터뷰 + 심사 3일 이내",
    result: "인증 멘토 (승인 즉시)",
    steps: ["기본 정보", "경력 증빙", "필수 모듈", "설계서 제출", "인터뷰 일정", "운영자 심사"],
    cta: { label: "경력 인증 신청", href: "/mentor/join/B" },
  },
  {
    track: "C",
    name: "출시 캠프",
    who: "경험은 있는데 상품화가 막막한 분",
    time: "4주",
    result: "인증 멘토 + 첫 멘티 연결 + 30일 상위 노출",
    steps: ["진입 워크숍", "4주 캠프", "파일럿", "출시"],
    cta: { label: "출시 캠프 알아보기", href: "/academy" },
  },
];

/** "나에게 맞는 입구 찾기": 강의·코칭으로 돈을 받아 봤나요? / 회차별 과정을 혼자 설계할 수 있나요? */
export function recommendTrack(paidTeaching: boolean, canDesign: boolean): MentorTrack {
  if (paidTeaching) return "B";
  return canDesign ? "A" : "C";
}

/** 지원 흐름 단계 (A·B 공용) */
export type JoinStep = "basic" | "evidence" | "module" | "design" | "interview" | "submit";
export const JOIN_STEP_LABELS: Record<JoinStep, string> = {
  basic: "기본 정보",
  evidence: "경력 증빙",
  module: "필수 모듈",
  design: "설계서",
  interview: "인터뷰 일정",
  submit: "확인·제출",
};
export function joinSteps(track: "A" | "B"): JoinStep[] {
  return track === "B" ? ["basic", "evidence", "module", "design", "interview", "submit"] : ["basic", "module", "design", "submit"];
}
