import type { FieldSlug } from "@/lib/fields";
import { DESIGNER_EXAMPLES } from "@/lib/designer/examples";
import { parseDesignMarkdown, type SessionRow } from "@/lib/designer/parseDesign";
import type {
  DemoAssignment,
  DemoBooking,
  DemoCohort,
  DemoCourse,
  DemoEnrollment,
  DemoMatch,
  DemoMentor,
  DemoNeedRequest,
  DemoPerson,
  DemoReport,
  DemoReview,
  DemoState,
  DemoWaitlist,
} from "./types";

// 시연용 예시 데이터. 등장인물은 모두 가상 인물이며 이름에 "예시"를 붙인다.
// 데이터 구조를 바꾸면 SEED_VERSION을 올려 브라우저에 남은 옛 데이터를 초기화한다.
export const SEED_VERSION = 3;

/** 역할별 "나"의 id */
export const ME = {
  mentee: "me-mentee",
  candidate: "me-cand",
  mentor: "m-a",
  admin: "admin",
} as const;

const people: DemoPerson[] = [
  { id: "admin", name: "운영자", email: "admin@example.com", role: "admin", joinedAt: "2026-09-01" },
  { id: "m-a", name: "예시 멘토 A", email: "mentor.a@example.com", role: "mentor", joinedAt: "2026-09-10" },
  { id: "m-b", name: "예시 멘토 B", email: "mentor.b@example.com", role: "mentor", joinedAt: "2026-09-11" },
  { id: "m-c", name: "예시 멘토 C", email: "mentor.c@example.com", role: "mentor", joinedAt: "2026-09-12" },
  { id: "m-d", name: "예시 멘토 D", email: "mentor.d@example.com", role: "mentor", joinedAt: "2026-09-15" },
  { id: "m-e", name: "예시 멘토 E", email: "mentor.e@example.com", role: "mentor", joinedAt: "2026-09-20" },
  { id: "m-f", name: "예시 멘토 F", email: "mentor.f@example.com", role: "mentor", joinedAt: "2026-09-21" },
  { id: "me-cand", name: "예시 예비 멘토(나)", email: "candidate.me@example.com", role: "candidate", joinedAt: "2026-10-28" },
  { id: "c-g", name: "예시 예비 멘토 G", email: "candidate.g@example.com", role: "candidate", joinedAt: "2026-10-29" },
  { id: "c-h", name: "예시 예비 멘토 H", email: "candidate.h@example.com", role: "candidate", joinedAt: "2026-10-30" },
  { id: "me-mentee", name: "예시 멘티(나)", email: "mentee.me@example.com", role: "mentee", joinedAt: "2026-10-05" },
  { id: "t-k", name: "예시 멘티 K", email: "mentee.k@example.com", role: "mentee", joinedAt: "2026-10-12" },
  { id: "t-l", name: "예시 멘티 L", email: "mentee.l@example.com", role: "mentee", joinedAt: "2026-10-18" },
  { id: "t-m", name: "예시 멘티 M", email: "mentee.m@example.com", role: "mentee", joinedAt: "2026-10-22" },
  { id: "t-n", name: "예시 멘티 N", email: "mentee.n@example.com", role: "mentee", joinedAt: "2026-10-25" },
  { id: "t-o", name: "예시 멘티 O", email: "mentee.o@example.com", role: "mentee", joinedAt: "2026-11-01" },
];

const mentors: DemoMentor[] = [
  { id: "m-a", headline: "현직 관광통역안내사 · 면접 스터디 3년 운영", bio: "인바운드 여행사에서 6년간 안내했고, 면접 스터디를 운영하며 수험생 답변을 첨삭해 왔습니다.", fieldSlugs: ["tourism"], keywords: ["관광통역안내사", "면접", "모의면접"], isFounding: true, status: "certified", certifiedAt: "2026-10-20" },
  { id: "m-b", headline: "중견기업 인사팀 서류 검토 8년", bio: "신입·경력 채용 서류를 검토하며 통과하는 서류와 떨어지는 서류의 차이를 봐 왔습니다.", fieldSlugs: ["career"], keywords: ["이력서", "경력기술서", "직무 키워드"], isFounding: true, status: "certified", certifiedAt: "2026-10-20" },
  { id: "m-c", headline: "기업 교육 담당 20년 · 사내 강사 양성", bio: "사내 강사 양성 과정을 운영했고, 퇴직 후 소규모 특강을 직접 열어 봤습니다.", fieldSlugs: ["venture"], keywords: ["강의 기획", "경험 상품화", "4050"], isFounding: true, status: "certified", certifiedAt: "2026-10-21" },
  { id: "m-d", headline: "특급호텔 프론트 7년 → 관광 공공기관 이직", bio: "호텔 현장 경험을 공공기관 자기소개서 언어로 바꿔 이직했습니다.", fieldSlugs: ["tourism", "career"], keywords: ["호텔", "관광공기업", "자기소개서"], isFounding: true, status: "certified", certifiedAt: "2026-10-22" },
  { id: "m-e", headline: "공공기관 채용 면접 위원 참여 경험", bio: "NCS 기반 채용의 구조화 면접 진행 방식을 수험생 눈높이로 풀어 드립니다.", fieldSlugs: ["career"], keywords: ["NCS", "구조화 면접", "공공기관"], isFounding: false, status: "certified", certifiedAt: "2026-11-02" },
  { id: "m-f", headline: "1인 브랜드 인스타그램 3년 운영", bio: "강의·상담 상품을 인스타그램으로 알리고 첫 고객을 모은 경험을 나눕니다.", fieldSlugs: ["venture"], keywords: ["인스타그램", "콘텐츠", "첫 판매"], isFounding: false, status: "certified", certifiedAt: "2026-11-03" },
  { id: "me-cand", headline: "MICE 기획사 PM 5년", bio: "국제회의·전시 프로젝트를 맡아 왔고, 업계 신입 채용 면접에 참여했습니다.", fieldSlugs: ["tourism"], keywords: ["MICE", "포트폴리오"], isFounding: true, status: "candidate" },
  { id: "c-g", headline: "여행사 상품기획 6년", bio: "패키지 상품을 기획해 온 경험으로 여행업 취업 준비생을 돕고 싶습니다.", fieldSlugs: ["tourism"], keywords: ["여행사", "상품기획"], isFounding: true, status: "candidate" },
  { id: "c-h", headline: "스타트업 회계 담당 4년", bio: "1인 창업자가 놓치기 쉬운 세무·회계 기초를 정리해 드리고 싶습니다.", fieldSlugs: ["venture"], keywords: ["세무 기초", "장부"], isFounding: true, status: "candidate" },
];

const S = (goal: string, activities: string, output: string, homework: string): Omit<SessionRow, "n"> => ({ goal, activities, output, homework });
const rows = (list: Omit<SessionRow, "n">[]): SessionRow[] => list.map((r, i) => ({ n: i + 1, ...r }));

function fromExample(idx: number, id: string, mentorId: string, publishedAt: string): DemoCourse {
  const ex = DESIGNER_EXAMPLES[idx];
  const d = parseDesignMarkdown(ex.sampleMarkdown).data;
  return {
    id,
    mentorId,
    field: ex.input.field,
    title: d.title ?? "",
    oneLiner: d.oneLiner ?? "",
    target: d.target ?? "",
    before: d.before ?? "",
    after: d.after ?? "",
    sessions: d.sessions ?? [],
    prep: d.prep ?? [],
    notice: d.notice ?? "",
    price: d.price ?? null,
    headlines: d.headlines ?? [],
    checks: d.checks ?? [],
    sessionCount: ex.input.sessionCount,
    minutes: ex.input.minutes,
    mode: ex.input.mode,
    status: "published",
    designMarkdown: ex.sampleMarkdown,
    createdAt: "2026-10-15",
    publishedAt,
  };
}

const courses: DemoCourse[] = [
  fromExample(0, "c-guide", "m-a", "2026-10-25"),
  fromExample(1, "c-resume", "m-b", "2026-10-26"),
  fromExample(2, "c-debut", "m-c", "2026-10-27"),
  {
    id: "c-hotel",
    mentorId: "m-d",
    field: "tourism",
    title: "호텔 경력으로 관광공기업 자소서 쓰기",
    oneLiner: "현장 경험을 공공기관이 읽는 언어로 바꿔 자기소개서 4문항을 완성합니다.",
    target: "호텔·여행업 경력을 살려 관광 공공기관으로 옮기고 싶은 3~7년 차 실무자께 맞습니다.",
    before: "현장 경험은 많은데 자기소개서에서는 평범한 서비스 경험처럼 읽힙니다.",
    after: "기관의 사업과 내 경험을 연결한 자기소개서 4문항 완성본이 있습니다.",
    sessions: rows([
      S("기관 분석", "목표 기관 사업·인재상 분석, 내 경험 목록 정리", "기관 분석표 1장", "경험 사례 8개 적기"),
      S("경험 번역", "현장 경험을 공공 가치(공정·안전·고객) 문장으로 바꾸기", "경험 번역 문장 8개", "지원 동기 초안"),
      S("문항별 초안", "지원 동기·직무 역량·협업·갈등 문항 구조 잡기", "자소서 4문항 초안", "초안 소리 내어 읽고 고치기"),
      S("완성과 점검", "첨삭, 글자 수·중복 표현 점검", "자기소개서 4문항 완성본", "면접 예상 질문 5개 뽑기"),
    ]),
    prep: ["목표 기관 채용 공고 1개", "경력 요약 메모"],
    notice: "호텔에서 관광 공공기관으로 옮긴 멘토와 4회에 걸쳐 자기소개서를 완성합니다. 회차마다 분석표·번역 문장·초안·완성본이 남습니다. 서류 결과는 공고와 지원자 상황에 따라 달라집니다.",
    price: 200_000,
    headlines: ["호텔 7년, 공공기관 자소서 언어로 바꿔 드립니다", "현장 경험이 평범하게 읽힌다면", "4번 만나 자소서 4문항 완성"],
    checks: ["기관 내부 정보를 사례로 쓰지 않기", "채용 일정은 공고 원문으로 다시 확인하기"],
    sessionCount: 4,
    minutes: 60,
    mode: "online",
    status: "published",
    createdAt: "2026-10-18",
    publishedAt: "2026-10-28",
  },
  {
    id: "c-ncs",
    mentorId: "m-e",
    field: "career",
    title: "공공기관 구조화 면접 4회 공략",
    oneLiner: "경험 면접·상황 면접 구조를 익히고 내 답변 노트를 완성합니다.",
    target: "필기 이후 면접을 앞둔 공공기관 지원자, 답변이 길어지고 흐려지는 분께 맞습니다.",
    before: "경험을 길게 말하다 질문 의도를 놓칩니다.",
    after: "질문 유형별로 2분 안에 답하는 답변 노트를 갖고 있습니다.",
    sessions: rows([
      S("면접 구조 이해", "경험·상황·발표 면접 유형 분석, 진단 모의면접", "면접 유형 지도", "핵심 경험 6개 고르기"),
      S("경험 면접", "STAR 구조로 경험 답변 다듬기", "경험 답변 6개", "답변 녹음 3개"),
      S("상황 면접", "상황 제시형 질문 롤플레이", "상황 답변 체크리스트", "기관 이슈 3개 정리"),
      S("실전 리허설", "실전형 모의면접, 최종 피드백", "면접 답변 노트 완성본", "최종 리허설 1회"),
    ]),
    prep: ["지원 기관 공고", "자기소개서 사본"],
    notice: "공공기관 채용 면접 위원 경험이 있는 멘토와 4회 동안 면접을 준비합니다. 회차마다 답변과 노트가 쌓입니다. 면접 결과를 약속하지는 않습니다.",
    price: 220_000,
    headlines: ["면접관이 듣는 구조로 답하세요", "경험은 짧게, 근거는 분명하게", "4회 만에 답변 노트 완성"],
    checks: ["면접 위원 활동 중 알게 된 비공개 정보 언급 금지"],
    sessionCount: 4,
    minutes: 60,
    mode: "online",
    status: "published",
    createdAt: "2026-10-30",
    publishedAt: "2026-11-04",
  },
  {
    id: "c-insta",
    mentorId: "m-f",
    field: "venture",
    title: "인스타그램으로 첫 수강생 모으기",
    oneLiner: "내 강의·상담 상품을 알리는 계정 설계부터 첫 모집 게시물까지 만듭니다.",
    target: "강의·상담 상품은 있는데 알릴 방법을 모르는 1인 창업자께 맞습니다.",
    before: "계정은 있지만 무엇을 올려야 할지 몰라 멈춰 있습니다.",
    after: "4주 콘텐츠 계획표와 첫 모집 게시물 3개가 준비되어 있습니다.",
    sessions: rows([
      S("계정 설계", "타깃·프로필·하이라이트 구성", "계정 설계 시트", "경쟁 계정 5개 분석"),
      S("콘텐츠 기둥", "정보·사례·모집 콘텐츠 비율 정하기", "콘텐츠 기둥 3개", "게시물 초안 2개"),
      S("모집 게시물", "카드뉴스·릴스 대본 작성 실습", "모집 게시물 3개", "1개 실제 게시해 보기"),
      S("운영 계획", "반응 점검, 4주 일정표 만들기", "4주 콘텐츠 계획표와 첫 모집 게시물 3개", "계획표대로 1주 운영"),
    ]),
    prep: ["운영 중인 계정(없으면 새로 만들기)", "판매하려는 상품 설명 메모"],
    notice: "1인 브랜드 계정을 3년간 운영한 멘토와 4회 동안 모집 콘텐츠를 만듭니다. 매 회차 바로 올릴 수 있는 결과물이 남습니다. 모집 결과와 매출은 상품과 운영 상황에 따라 다릅니다.",
    price: 330_000,
    headlines: ["올릴 게 없어서 멈춘 계정이라면", "첫 모집 게시물까지 함께 만듭니다", "4주 운영 계획표를 손에 쥐세요"],
    checks: ["다른 계정 콘텐츠를 그대로 가져다 쓰지 않도록 안내하기"],
    sessionCount: 4,
    minutes: 60,
    mode: "online",
    status: "published",
    createdAt: "2026-10-31",
    publishedAt: "2026-11-05",
  },
  // 운영자 승인 대기 — 보장 표현이 들어 있어 경고가 뜨는 예시
  {
    id: "c-trip",
    mentorId: "c-g",
    field: "tourism",
    title: "여행사 신입 포트폴리오 4회 완성",
    oneLiner: "상품기획 과제로 여행사 서류 합격 보장 포트폴리오를 만듭니다.",
    target: "여행사 상품기획·OP 직무를 준비하는 취업 준비생",
    before: "여행을 좋아한다는 말 말고는 보여 줄 것이 없습니다.",
    after: "직접 기획한 여행상품 기획서 1부가 담긴 포트폴리오가 있습니다.",
    sessions: rows([
      S("직무 이해", "상품기획·OP 업무 흐름 소개", "직무 지도", "관심 지역 3곳 조사"),
      S("상품 기획", "타깃·일정·원가 구조 잡기", "상품 기획 초안", "일정표 완성"),
      S("원가와 가격", "원가 계산과 판매가 설정", "원가표", "상품 소개문 작성"),
      S("포트폴리오", "기획서 정리, 발표 연습", "여행상품 기획서 1부가 담긴 포트폴리오", "발표 2분 연습"),
    ]),
    prep: ["노트북", "관심 여행지 메모"],
    notice: "여행사 상품기획 6년 차 멘토와 포트폴리오를 만듭니다. 문의는 010-1234-5678로 주세요.",
    price: 180_000,
    headlines: ["여행 좋아한다는 말 대신 기획서를", "4번 만에 포트폴리오 완성", "여행사 신입, 무엇을 보여 줄까"],
    checks: ["원가 자료는 공개 자료만 쓰기"],
    sessionCount: 4,
    minutes: 60,
    mode: "online",
    status: "review",
    createdAt: "2026-11-05",
    reviewWarnings: ["\"합격 보장\" 같은 보장 표현이 있습니다 (한 줄 소개)", "전화번호·이메일로 보이는 내용이 있습니다 (교육 안내문)"],
  },
  // 예비 멘토(나)의 초안
  {
    id: "c-mice-draft",
    mentorId: "me-cand",
    field: "tourism",
    title: "MICE 기획사 신입 지원서 공략",
    oneLiner: "",
    target: "",
    before: "",
    after: "",
    sessions: [],
    prep: [],
    notice: "",
    price: 200_000,
    headlines: [],
    checks: [],
    sessionCount: 4,
    minutes: 60,
    mode: "online",
    status: "draft",
    createdAt: "2026-11-06",
  },
];

const bookings: DemoBooking[] = [
  { id: "b-1", courseId: "c-guide", menteeId: "me-mentee", status: "in_progress", preferredSchedule: "평일 저녁 8시", message: "필기 합격 후 면접이 처음입니다.", sessionsDone: 2, createdAt: "2026-10-27" },
  { id: "b-2", courseId: "c-resume", menteeId: "me-mentee", status: "done", preferredSchedule: "주말 오전", message: "서류에서 계속 떨어집니다.", sessionsDone: 3, createdAt: "2026-10-10" },
  { id: "b-3", courseId: "c-guide", menteeId: "t-m", status: "inquiry", preferredSchedule: "화·목 저녁", message: "중국어 안내사 면접도 도움을 받을 수 있을까요?", sessionsDone: 0, createdAt: "2026-11-06" },
  { id: "b-4", courseId: "c-guide", menteeId: "t-n", status: "confirmed", preferredSchedule: "토요일 오후 2시", message: "다음 달 면접 예정입니다.", sessionsDone: 0, createdAt: "2026-11-02" },
  { id: "b-5", courseId: "c-guide", menteeId: "t-k", status: "done", preferredSchedule: "평일 오전", message: "", sessionsDone: 4, createdAt: "2026-10-01" },
  { id: "b-6", courseId: "c-resume", menteeId: "t-l", status: "done", preferredSchedule: "평일 저녁", message: "", sessionsDone: 3, createdAt: "2026-10-05" },
  { id: "b-7", courseId: "c-debut", menteeId: "t-o", status: "done", preferredSchedule: "주말", message: "", sessionsDone: 4, createdAt: "2026-10-03" },
  { id: "b-8", courseId: "c-hotel", menteeId: "t-k", status: "done", preferredSchedule: "평일 저녁", message: "", sessionsDone: 4, createdAt: "2026-10-04" },
  { id: "b-9", courseId: "c-ncs", menteeId: "t-l", status: "done", preferredSchedule: "평일 저녁", message: "", sessionsDone: 4, createdAt: "2026-10-06" },
  { id: "b-10", courseId: "c-ncs", menteeId: "t-m", status: "in_progress", preferredSchedule: "주말", message: "", sessionsDone: 4, createdAt: "2026-10-20" },
  { id: "b-11", courseId: "c-insta", menteeId: "t-n", status: "done", preferredSchedule: "평일", message: "", sessionsDone: 4, createdAt: "2026-10-08" },
  { id: "b-12", courseId: "c-insta", menteeId: "t-o", status: "done", preferredSchedule: "평일", message: "", sessionsDone: 4, createdAt: "2026-10-09" },
];

// 회차 리포트: 각 예약의 진행 회차만큼 쓰되, 일부 멘토는 일부러 빠뜨려 품질 경고 예시를 만든다
function makeReports(): DemoReport[] {
  const out: DemoReport[] = [];
  const skip: Record<string, number[]> = { "b-9": [3, 4], "b-10": [4] }; // 멘토 E 리포트 누락
  const courseById = Object.fromEntries(courses.map((c) => [c.id, c]));
  for (const b of bookings) {
    const c = courseById[b.courseId];
    for (let n = 1; n <= b.sessionsDone; n++) {
      if (skip[b.id]?.includes(n)) continue;
      const s = c.sessions[n - 1];
      out.push({
        id: `r-${b.id}-${n}`,
        bookingId: b.id,
        sessionN: n,
        memo: `${n}회차 진행. ${s?.goal ?? ""} 중심으로 실습.`,
        menteeSummary: `${s?.goal ?? "이번 회차"}를 함께 다뤘습니다. ${s?.activities ?? ""}를 진행했고, 스스로 정리하는 힘이 좋아지고 있습니다.`,
        nextHomework: s?.homework ?? "",
        output: s?.output ?? "",
        sentAt: b.createdAt,
      });
    }
  }
  return out;
}

const reviews: DemoReview[] = [
  { id: "rv-1", bookingId: "b-5", courseId: "c-guide", rating: 5, body: "관광지 설명을 외우지 않고 구조로 말하는 법을 알게 됐습니다. 모의면접 피드백이 구체적이었어요.", authorLabel: "예시 멘티 K", createdAt: "2026-10-30" },
  { id: "rv-2", bookingId: "b-6", courseId: "c-resume", rating: 5, body: "공고에서 키워드를 뽑는 방법이 가장 도움이 됐습니다.", authorLabel: "예시 멘티 L", createdAt: "2026-10-28" },
  { id: "rv-3", bookingId: "b-7", courseId: "c-debut", rating: 5, body: "막연했던 강의 주제가 한 문장으로 정리됐습니다.", authorLabel: "예시 멘티 O", createdAt: "2026-11-01" },
  { id: "rv-4", bookingId: "b-8", courseId: "c-hotel", rating: 4, body: "현장 경험을 기관 언어로 바꾸는 연습이 좋았습니다. 회차가 조금 더 있었으면 합니다.", authorLabel: "예시 멘티 K", createdAt: "2026-11-02" },
  { id: "rv-5", bookingId: "b-9", courseId: "c-ncs", rating: 5, body: "상황 면접을 처음으로 구조 있게 준비했습니다.", authorLabel: "예시 멘티 L", createdAt: "2026-11-05" },
  { id: "rv-6", bookingId: "b-11", courseId: "c-insta", rating: 4, body: "게시물 대본까지 써 주셔서 바로 올릴 수 있었습니다.", authorLabel: "예시 멘티 N", createdAt: "2026-11-04" },
  { id: "rv-7", bookingId: "b-12", courseId: "c-insta", rating: 4, body: "계획표는 좋았지만 피드백이 조금 늦었어요.", authorLabel: "예시 멘티 O", createdAt: "2026-11-06" },
];

const needRequests: DemoNeedRequest[] = [
  {
    id: "nr-1",
    menteeId: "me-mentee",
    field: "tourism",
    answers: {
      current: "관광통역안내사(영어) 필기에 합격했고, 여행사 아르바이트 경험이 있습니다.",
      goal: "올해 면접에 합격해 프리랜서 안내사로 일을 시작하고 싶습니다.",
      blocker: "면접 준비를 혼자 하다 보니 무엇이 부족한지 모르겠습니다.",
      output: "실제로 말할 수 있는 면접 답변 스크립트",
      timeline: "다음 달 면접 · 예산 20만 원 안팎",
    },
    createdAt: "2026-10-24",
    status: "matched",
  },
  {
    id: "nr-2",
    menteeId: "t-k",
    field: "career",
    answers: {
      current: "마케팅 3년 차, 이직 준비 중입니다.",
      goal: "브랜드 마케팅 직무로 이직하고 싶습니다.",
      blocker: "경력기술서에 성과를 어떻게 써야 할지 모르겠습니다.",
      output: "경력기술서와 포트폴리오 요약",
      timeline: "2개월 안 · 예산 미정",
    },
    createdAt: "2026-11-06",
    status: "waiting",
  },
  {
    id: "nr-3",
    menteeId: "t-o",
    field: "venture",
    answers: {
      current: "요가 강사 8년 차, 개인 수업을 하고 있습니다.",
      goal: "온라인 클래스를 열어 수입을 넓히고 싶습니다.",
      blocker: "어떤 상품으로, 얼마에 팔아야 할지 모르겠습니다.",
      output: "온라인 클래스 기획안과 모집 페이지",
      timeline: "3개월 · 예산 30만 원",
    },
    createdAt: "2026-11-07",
    status: "waiting",
  },
];

const matches: DemoMatch[] = [
  {
    id: "mt-1",
    requestId: "nr-1",
    courseId: "c-guide",
    reasons: [
      "필기 합격 후 첫 면접을 준비하는 상황과 과정 대상이 정확히 맞습니다.",
      "원하시는 결과물(면접 답변 스크립트)이 마지막 회차 결과물과 같습니다.",
      "매 회차 모의면접으로 무엇이 부족한지 바로 확인할 수 있습니다.",
    ],
    caution: "면접 일정이 다음 달이라 첫 회차를 빨리 잡는 것이 좋습니다.",
  },
  {
    id: "mt-2",
    requestId: "nr-1",
    courseId: "c-hotel",
    reasons: [
      "여행사 경험을 관광 분야 언어로 정리하는 데 도움이 됩니다.",
      "안내사 이후 관광 공공기관 진로까지 함께 그려 볼 수 있습니다.",
      "글로 정리한 경험이 면접 답변의 재료가 됩니다.",
    ],
    caution: "면접보다 자기소개서 중심 과정이라 우선순위는 두 번째입니다.",
  },
];

const cohorts: DemoCohort[] = [
  { id: "co-ws1", name: "진입 워크숍 1기 · 내 경험 값 매기기", kind: "workshop", startsOn: "2026-10-25", endsOn: "2026-10-25", price: 0, status: "closed" },
  { id: "co-camp1", name: "공략집 출시 캠프 1기 (파운딩)", kind: "camp", startsOn: "2026-11-01", endsOn: "2026-11-29", price: 0, status: "running" },
  { id: "co-ws2", name: "진입 워크숍 2기 · 내 경험 값 매기기", kind: "workshop", startsOn: "2026-12-13", endsOn: "2026-12-13", price: 0, status: "open" },
  { id: "co-camp2", name: "공략집 출시 캠프 2기", kind: "camp", startsOn: "2027-01-10", endsOn: "2027-02-07", price: 99_000, status: "open" },
];

const enrollments: DemoEnrollment[] = [
  { id: "en-me", cohortId: "co-camp1", userId: "me-cand", status: "accepted", passedWeeks: [0, 1] },
  { id: "en-g", cohortId: "co-camp1", userId: "c-g", status: "accepted", passedWeeks: [0, 1, 2, 3] },
  { id: "en-h", cohortId: "co-camp1", userId: "c-h", status: "accepted", passedWeeks: [0] },
  { id: "en-d", cohortId: "co-camp1", userId: "m-d", status: "completed", passedWeeks: [0, 1, 2, 3, 4], graduatedAt: "2026-10-22" },
];

const assignments: DemoAssignment[] = [
  { id: "as-1", enrollmentId: "en-me", week: 0, content: "경험 자산 3개: ① 국제회의 운영 PM ② 신입 면접 참여 ③ 협력사 관리\n한 문장: 나는 MICE 업계에 들어오려는 신입이 첫 포트폴리오를 완성하도록 돕는다.", submittedAt: "2026-11-01", reviewed: true },
  { id: "as-2", enrollmentId: "en-me", week: 1, content: "잠재 멘티 인터뷰 3명 완료(관광경영 전공 4학년 2명, 이직 준비 1명).\nBefore: 행사 아르바이트 경험만 나열 / After: 프로젝트 단위 포트폴리오 1부", submittedAt: "2026-11-08", reviewed: true },
  { id: "as-3", enrollmentId: "en-g", week: 3, content: "파일럿 3명 진행, 후기 3건 수집. 회차 리포트 4건 제출.", submittedAt: "2026-11-07", reviewed: false },
  { id: "as-4", enrollmentId: "en-h", week: 1, content: "인터뷰 2명 진행(1명 추가 예정).", submittedAt: "2026-11-07", reviewed: false },
];

// 대기자 46명: 분야·관심 분포를 보여 주기 위한 가상 데이터
function makeWaitlist(): DemoWaitlist[] {
  const fields: FieldSlug[] = ["career", "tourism", "tourism", "venture", "career", "tourism"];
  const notes = [
    "관광통역안내사 면접을 앞두고 있어요",
    "서류에서 계속 떨어져요",
    "퇴직 후 강의를 해 보고 싶어요",
    "호텔에서 공기업으로 옮기고 싶어요",
    "제 경험을 나누고 싶습니다",
    "",
    "MICE 업계 취업 준비 중",
    "",
  ];
  return Array.from({ length: 46 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    const day = 1 + Math.floor((i * 37) / 46);
    const month = day > 31 ? 11 : 10;
    const d = day > 31 ? day - 31 : day;
    return {
      id: `w-${n}`,
      name: `예시 대기자 ${n}`,
      email: `sample${n}@example.com`,
      roleInterest: i % 5 === 0 ? "mentor" : "mentee",
      field: fields[i % fields.length],
      note: notes[i % notes.length],
      createdAt: `2026-${month}-${String(Math.max(1, d)).padStart(2, "0")}T09:00:00+09:00`,
    } satisfies DemoWaitlist;
  });
}

export function createSeed(): DemoState {
  return {
    v: SEED_VERSION,
    role: "guest",
    people,
    mentors,
    courses,
    bookings,
    reports: makeReports(),
    reviews,
    needRequests,
    matches,
    cohorts,
    enrollments,
    assignments,
    waitlist: makeWaitlist(),
  };
}
