import type { Metadata } from "next";
import { OpenAs } from "@/components/demo/OpenAs";
import type { DemoRole } from "@/lib/demo/types";

export const metadata: Metadata = {
  title: "기능 둘러보기",
  description: "먼저가본(인생공략집) 시연 안내: 5분 시연 순서, 역할별 기능, 차별점, 수익 구조, 로드맵",
};

type Step = { role: DemoRole; who: string; href: string; title: string; say: string };

// 5분 시연 순서: 멘티의 길과 멘토의 길이 한 플랫폼에서 만나는 흐름
const SCENARIO: Step[] = [
  { role: "guest", who: "방문자", href: "/#waitlist", title: "홈에서 대기자 등록", say: "오픈 전부터 분야·관심별 수요를 모읍니다. 목표는 대기자 300명입니다." },
  { role: "mentee", who: "멘티", href: "/find", title: "공략 찾기 — 요청서 작성", say: "다섯 가지 질문으로 고민을 정리합니다. 서술이 어려우면 내 AI로 정리하는 프롬프트를 씁니다." },
  { role: "admin", who: "운영자", href: "/admin/matching", title: "매칭 검수 — 추천 공개", say: "같은 분야 게시 과정을 나란히 보고 최대 3개를 골라 추천 이유 3줄을 씁니다." },
  { role: "mentee", who: "멘티", href: "/find", title: "추천 확인 → 상세페이지 → 신청 접수", say: "추천 이유와 주의점을 보고 과정을 고릅니다. 결제 없이 신청 접수만 받습니다." },
  { role: "mentor", who: "인증 멘토", href: "/studio/bookings", title: "신청 확정 → 회차 리포트 발송", say: "메모 3줄로 리포트 프롬프트를 만들고, 멘티용 요약·다음 과제를 확인해 보냅니다." },
  { role: "mentee", who: "멘티", href: "/me/notes", title: "내 공략 노트 — 결과물·후기", say: "회차마다 요약·과제·결과물이 쌓이고, 과정이 끝나면 후기를 남깁니다." },
  { role: "guest", who: "멘토 지원자", href: "/mentor/join", title: "멘토로 활동하기 — 입구 선택·지원", say: "셀프 등록·경력 인증·출시 캠프 중 입구를 고르고, 필수 모듈과 설계서 자동 검사를 거쳐 지원합니다." },
  { role: "admin", who: "운영자", href: "/admin/applications", title: "멘토 지원 심사 → 등급 부여", say: "자동 검사 결과·경력 증빙을 보고 승인합니다. 셀프 등록은 등록 멘토, 경력 인증은 바로 인증 멘토입니다." },
  { role: "admin", who: "운영자", href: "/admin/mentors", title: "멘토 등급 · 품질 지표", say: "판매·평점·리포트 실적으로 등급이 자동으로 오르고, 운영자는 사유를 남겨 조정합니다. 기관 보고용 성과 CSV도 봅니다." },
];

type Feature = { title: string; body: string; href: string; role: DemoRole; tag?: string };
const PERSONAS: { name: string; desc: string; features: Feature[] }[] = [
  {
    name: "멘티 · 공략 찾기",
    desc: "길 앞에서 막힌 사람이 먼저 가 본 사람을 만나는 문",
    features: [
      { title: "분야별 공략집", body: "취업·이직, 관광 커리어, 경험 수익화 3개 분야의 게시 과정과 평점", href: "/fields/tourism", role: "guest" },
      { title: "과정 상세페이지", body: "헤드카피, 멘토 배지, Before/After, 회차별 결과물, 후기, 신청 접수", href: "/courses/c-guide", role: "mentee", tag: "회차별 결과물" },
      { title: "공략 요청서 + 추천", body: "5개 질문 요청서 → 운영자 추천 3개(이유 3줄·주의점)", href: "/find", role: "mentee" },
      { title: "내 공략 노트", body: "회차 요약, 다음 과제, 결과물 보관함, 후기", href: "/me/notes", role: "mentee", tag: "회차별 결과물" },
    ],
  },
  {
    name: "멘토 · 공략 만들기",
    desc: "경험을 4회차 상품으로 출시하는 문 — 입구는 셋, 기준은 하나",
    features: [
      { title: "멘토로 활동하기", body: "입구 3개 비교(셀프 등록·경력 인증·출시 캠프)와 나에게 맞는 입구 찾기", href: "/mentor/join", role: "guest", tag: "멘토 양성" },
      { title: "멘토 지원서", body: "기본 정보 → 경력 증빙 → 필수 모듈 퀴즈 → 설계서 자동 검사 → 인터뷰 일정 → 제출", href: "/mentor/join/B", role: "guest", tag: "멘토 양성" },
      { title: "멘토 등급 · 스튜디오", body: "등급 배지, 수습 진행, 다음 등급까지 남은 조건", href: "/studio", role: "registered" },
      { title: "아카데미 · 기수 신청 (선택)", body: "처음 과정을 만드는 분을 위한 진입 워크숍 + 4주 출시 캠프", href: "/academy#cohorts", role: "candidate", tag: "멘토 양성" },
      { title: "내 캠프", body: "0~4주차 진도, 통과 기준, 과제 제출, 경험 진단 프롬프트", href: "/academy/camp", role: "candidate", tag: "멘토 양성" },
      { title: "AI 공략 설계기", body: "경험 → 회차별 목표·진행·결과물·과제 설계 프롬프트, 상세페이지 미리보기", href: "/studio/designer", role: "candidate", tag: "AI 과정 설계" },
      { title: "과정 편집 · 게시 요청", body: "설계서 가져오기, 보장 표현·외부 연락처 자동 검사", href: "/studio/courses", role: "mentor" },
      { title: "신청 관리 · 회차 리포트", body: "신청 확정, 메모 → 리포트 프롬프트 → 멘티에게 발송", href: "/studio/bookings", role: "mentor", tag: "회차별 결과물" },
    ],
  },
  {
    name: "운영자",
    desc: "품질을 지키고 성과를 증명하는 관리 화면",
    features: [
      { title: "운영 대시보드", body: "대기자·게시 과정·신청·인증 멘토 지표와 처리할 일", href: "/admin", role: "admin" },
      { title: "대기자 관리", body: "분야·관심별 집계, 목표 대비 진행률, CSV 내보내기", href: "/admin/waitlist", role: "admin" },
      { title: "멘토 지원 심사", body: "입구별 필터, 자동 검사 결과, 경력 증빙·인터뷰 일정, 승인·보완 요청·반려", href: "/admin/applications", role: "admin", tag: "멘토 양성" },
      { title: "멘토 목록 · 등급", body: "등급·수습·판매·평점·리포트 제출률, 사유를 남기는 수동 조정", href: "/admin/mentors", role: "admin" },
      { title: "과정 게시 승인", body: "자동 검사 경고와 함께 승인·반려(사유)", href: "/admin/courses", role: "admin" },
      { title: "매칭 검수", body: "요청서와 후보 과정을 나란히, 추천 이유 초안 프롬프트", href: "/admin/matching", role: "admin" },
      { title: "기수·수료 승인", body: "수강생 주차 진도, 과제 검토, 수료 → 인증 멘토 + 30일 상위 노출", href: "/admin/cohorts/co-camp1", role: "admin", tag: "멘토 양성" },
      { title: "품질 지표 · 성과 보고", body: "리포트 제출률·평균 후기 경고, 분야별 성과 CSV", href: "/admin/quality", role: "admin", tag: "회차별 결과물" },
    ],
  },
];

const ROADMAP = [
  { step: "지금", title: "시연용 데모", body: "모든 화면과 흐름을 예시 데이터로 체험 (브라우저 저장)" },
  { step: "다음", title: "DB 연동 · 회원가입", body: "Supabase 연결, 이메일 로그인, 데이터 수집 (스키마·보안 규칙 준비 완료)" },
  { step: "사업자등록 후", title: "결제", body: "토스페이먼츠 결제, 멘토 정산(수수료 20%, 파운딩 첫 3건 40%), 캠프 수강료" },
  { step: "선택", title: "AI 직접 연동", body: "버튼 한 번으로 AI 결과 생성 (지금은 사용자 AI 활용으로 API 비용 0원)" },
];

export default function DemoTourPage() {
  return (
    <div>
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/70 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pt-14">
          <p className="eyebrow">시연 안내</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-tight md:text-5xl">먼저가본 기능 둘러보기</h1>
          <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-sub">
            경험자를 멘토로 길러 4회차 공략 과정을 출시하게 하고, 멘티에게 맞는 과정을 추천하는 경험 기반 멘토링 플랫폼입니다. 상단의 &ldquo;보는 역할&rdquo;을 바꾸면 같은 플랫폼을 멘티·멘토·운영자 시점으로 볼 수 있습니다.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <OpenAs role="guest" href="/" label="홈부터 시작하기" className="btn-primary" />
            <a href="#scenario" className="btn-outline">5분 시연 순서 보기</a>
          </div>
        </div>
      </section>

      {/* 차별점 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="eyebrow">차별점</p>
        <h2 className="section-title mt-2">매칭이 아니라, 검증된 결과물입니다</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { t: "멘토 양성·인증", b: "입구는 셋(셀프 등록·경력 인증·출시 캠프), 품질 기준은 하나입니다. 모든 멘토가 같은 관문을 통과하고, 등급은 판매·평점·리포트 실적으로 오릅니다." },
            { t: "AI 과정 설계", b: "멘토의 경험을 AI 공략 설계기로 회차별 목표·결과물·과제가 있는 4회차 상품으로 바꿉니다." },
            { t: "회차별 결과물 검증", b: "매 회차 멘티가 손에 쥐는 결과물과 회차 리포트가 남고, 기관 보고용 성과로 집계됩니다." },
          ].map((x) => (
            <div key={x.t} className="card border-t-4 border-t-accent p-5">
              <p className="text-lg font-bold">{x.t}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-sub">{x.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 시연 순서 */}
      <section id="scenario" className="scroll-mt-32 border-y border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="eyebrow">5분 시연 순서</p>
          <h2 className="section-title mt-2">한 사람의 고민이 결과물이 되기까지</h2>
          <p className="mt-2 text-[15px] text-sub">각 단계의 버튼을 누르면 역할이 바뀌고 해당 화면이 열립니다.</p>
          <ol className="mt-6 space-y-3">
            {SCENARIO.map((st, i) => (
              <li key={i} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold"><span className="mr-1.5 rounded bg-accent-soft px-1.5 py-0.5 text-[12px] font-bold text-accent">{st.who}</span>{st.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-sub">{st.say}</p>
                </div>
                <OpenAs role={st.role} href={st.href} label="이 화면 열기" className="btn-outline min-h-10 shrink-0 px-3 text-sm" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 기능 지도 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="eyebrow">기능 지도</p>
        <h2 className="section-title mt-2">한 플랫폼, 두 출입구, 하나의 관리 화면</h2>
        <div className="mt-6 space-y-8">
          {PERSONAS.map((p) => (
            <div key={p.name}>
              <p className="text-lg font-bold text-navy">{p.name}</p>
              <p className="text-sm text-sub">{p.desc}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {p.features.map((f) => (
                  <div key={f.title} className="card flex flex-col p-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-bold">{f.title}</p>
                      {f.tag && <span className="rounded border border-accent/40 bg-accent-soft px-1.5 py-0.5 text-[11px] font-bold text-accent">{f.tag}</span>}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-sub">{f.body}</p>
                    <div className="mt-auto pt-3"><OpenAs role={f.role} href={f.href} /></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 수익 구조 */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <p className="eyebrow">수익 구조</p>
          <h2 className="section-title mt-2">세 갈래 수입원</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="card p-5">
              <p className="font-bold">공략 과정 수수료</p>
              <p className="mt-2 text-sm leading-relaxed text-sub">과정 판매액의 20%. 파운딩 멘토는 첫 3건 40%, 이후 20%. 권장 가격은 4회 기준 취업·관광 15~25만 원, 창업 30~40만 원입니다.</p>
            </div>
            <div className="card p-5">
              <p className="font-bold">멘토 출시 캠프 수강료 (선택형)</p>
              <p className="mt-2 text-sm leading-relaxed text-sub">처음 과정을 만드는 분을 위한 가속 상품. 1기 0원(파운딩) → 2기 9.9만 원 → 3기부터 19.9만 원.</p>
            </div>
            <div className="card p-5">
              <p className="font-bold">기관 협력</p>
              <p className="mt-2 text-sm leading-relaxed text-sub">분야별 수강·평점·결과물 성과 보고 기능으로 정부지원·기관 협력 사업에 연결합니다.</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] text-sub">결제는 사업자등록 후 연결하며, 그 전에는 신청 접수만 받습니다.</p>
        </div>
      </section>

      {/* 로드맵 */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <p className="eyebrow">로드맵</p>
        <h2 className="section-title mt-2">데모에서 정식 서비스까지</h2>
        <ol className="mt-6 grid gap-3 md:grid-cols-4">
          {ROADMAP.map((r, i) => (
            <li key={r.title} className={`card p-5 ${i === 0 ? "border-accent bg-accent-soft" : ""}`}>
              <p className="text-[13px] font-bold text-accent">{r.step}</p>
              <p className="mt-1 font-bold">{r.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-sub">{r.body}</p>
            </li>
          ))}
        </ol>
        <p className="mt-6 text-[13px] text-sub">이 데모의 인물·후기·수치는 모두 가상 예시입니다. 입력한 내용은 보는 사람의 브라우저에만 저장되며, 상단 &ldquo;초기화&rdquo;로 처음 상태로 돌아갑니다.</p>
      </section>
    </div>
  );
}
