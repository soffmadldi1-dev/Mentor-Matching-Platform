import type { Metadata } from "next";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = { title: "멘토 아카데미 · 공략집 출시 캠프" };

import { CAMP_WEEKS } from "@/lib/academy";
import { DEMO_MODE } from "@/lib/demo/mode";
import { CohortApply } from "@/components/demo/CohortApply";

const WEEKS = CAMP_WEEKS.map((w) => ({ week: `${w.week}주차`, title: w.title, time: w.time, goal: w.goal, pass: w.pass.join(" + ") }));

export default function AcademyPage() {
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/60 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 md:pt-16">
          <p className="eyebrow">멘토의 문 · 공략 만들기</p>
          <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight md:text-5xl">
            내 경험을 4회차
            <br />
            공략 과정으로 출시합니다
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-sub">
            먼저가본은 멘토를 먼저 길러 낸 뒤 마켓을 엽니다. 공략집 출시 캠프를 수료한 멘토만 과정을 게시할 수 있습니다.
          </p>
          <a href="#apply" className="btn-primary mt-6">파운딩 멘토 대기 등록하기</a>
        </div>
      </section>

      {/* 캠프 구성 */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="eyebrow">공략집 출시 캠프</p>
        <h2 className="section-title mt-2">진입 워크숍 + 4주 캠프</h2>
        <ol className="mt-8 grid gap-3 md:grid-cols-5">
          {WEEKS.map((w) => (
            <li key={w.week} className="card flex flex-col p-4">
              <p className="text-sm font-bold text-accent">{w.week}</p>
              <p className="mt-1 font-bold leading-snug text-ink">{w.title}</p>
              <p className="mt-0.5 text-[13px] text-sub">{w.time}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink">{w.goal}</p>
              <div className="mt-auto pt-4">
                <p className="text-[12px] font-bold text-navy">통과 기준</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-sub">{w.pass}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-panel p-5">
            <p className="font-bold text-navy">수료와 인증</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              과정 게시와 파일럿 후기 3건을 갖추면 운영자 검토를 거쳐 <b>인증 멘토</b>가 되고 인증 배지가 붙습니다.
            </p>
          </div>
          <div className="rounded-xl bg-panel p-5">
            <p className="font-bold text-navy">인증 유지 기준</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              회차 리포트 제출률 90% 이상, 평균 후기 4.5점 이상을 유지합니다. 멘티가 받는 품질을 지키기 위한 약속입니다.
            </p>
          </div>
        </div>
      </section>

      {/* 파운딩 멘토 1기 */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow">모집 안내</p>
          <h2 className="section-title mt-2">파운딩 멘토 1기</h2>
          <p className="mt-2 max-w-2xl text-[15px] text-sub">
            1기 멘토에게는 프로필에 &ldquo;파운딩 멘토&rdquo; 배지가 계속 표시됩니다.
          </p>
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="card p-5">
              <dt className="text-sm font-bold text-sub">캠프 수강료</dt>
              <dd className="mt-1 text-2xl font-extrabold text-ink">0원</dd>
            </div>
            <div className="card p-5">
              <dt className="text-sm font-bold text-sub">플랫폼 수수료</dt>
              <dd className="mt-1 text-lg font-bold text-ink">첫 3건 40% · 이후 20%</dd>
            </div>
            <div className="card p-5">
              <dt className="text-sm font-bold text-sub">일정</dt>
              <dd className="mt-1 text-lg font-bold text-ink">추후 공지</dd>
            </div>
          </dl>
          <p className="mt-4 text-[13px] text-sub">
            현재 시범 운영 단계로 결제 기능은 없습니다. 일정과 세부 조건은 대기 등록하신 분께 먼저 안내합니다.
          </p>
        </div>
      </section>

      {DEMO_MODE && (
        <section id="cohorts" className="mx-auto max-w-6xl scroll-mt-32 px-4 pt-14">
          <p className="eyebrow">기수 신청</p>
          <h2 className="section-title mt-2">열린 기수</h2>
          <div className="mt-6"><CohortApply /></div>
        </section>
      )}

      <section id="apply" className="mx-auto max-w-3xl scroll-mt-32 px-4 py-14">
        <p className="eyebrow">대기 등록</p>
        <h2 className="section-title mt-2">1기 일정 안내를 먼저 받아 보세요</h2>
        <div className="card mt-6 p-5 md:p-6">
          <WaitlistForm id="academy-waitlist" defaultRole="mentor" />
        </div>
      </section>
    </>
  );
}
