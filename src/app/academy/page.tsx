import Link from "next/link";
import type { Metadata } from "next";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = { title: "아카데미 · 4주 출시 캠프(선택)" };

import { CAMP_WEEKS } from "@/lib/academy";
import { DEMO_MODE } from "@/lib/demo/mode";
import { CohortApply } from "@/components/demo/CohortApply";

const WEEKS = CAMP_WEEKS.map((w) => ({ week: `${w.week}주차`, title: w.title, time: w.time, goal: w.goal, pass: w.pass.join(" + ") }));

export default function AcademyPage() {
  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/60 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-12 md:pt-16">
          <p className="eyebrow">멘토의 문 · 입구 C</p>
          <h1 className="mt-3 text-[30px] font-extrabold leading-tight tracking-tight md:text-5xl">
            처음 과정을 만드는 분을 위한
            <br />
            4주 출시 캠프 (선택)
          </h1>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-sub">
            경험은 있는데 상품으로 만드는 게 막막하다면, 4주 동안 함께 내 경험을 4회차 공략 과정으로 만들어 출시합니다. 캠프는 필수가 아닌 선택형 가속 과정입니다.
          </p>
          <div role="note" className="mt-5 flex max-w-2xl flex-col gap-2 rounded-lg border border-navy/20 bg-white p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p><b className="text-navy">경력자는 빠른 등록도 가능</b> · 강의·코칭 경험이 있거나 혼자 과정을 설계할 수 있다면 캠프 없이 바로 등록할 수 있습니다.</p>
            <Link href="/mentor/join" className="shrink-0 font-semibold text-accent underline underline-offset-2">멘토로 활동하기</Link>
          </div>
          <a href="#apply" className="btn-primary mt-6">파운딩 멘토 대기 등록하기</a>
        </div>
      </section>

      {/* 캠프 구성 */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <p className="eyebrow">공략집 출시 캠프 · 선택</p>
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
            <p className="font-bold text-navy">수료 혜택</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              과정 게시와 파일럿 후기 3건을 갖추면 운영자 검토를 거쳐 <b>인증 멘토</b>가 됩니다. 여기에 <b>첫 멘티 연결</b>과 <b>30일 상위 노출</b>을 더해 드립니다.
            </p>
          </div>
          <div className="rounded-xl bg-panel p-5">
            <p className="font-bold text-navy">같은 품질 기준, 실적으로 오르는 등급</p>
            <p className="mt-2 text-[15px] leading-relaxed text-ink">
              캠프 수료생도 다른 입구의 멘토와 같은 공통 관문(필수 모듈·설계서 기준)을 통과합니다. 이후 등급은 판매·평점·회차 리포트 실적으로 올라갑니다(판매 20건·평점 4.7 이상이면 마스터 멘토).
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
