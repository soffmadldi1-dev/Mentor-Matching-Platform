"use client";

import { useState } from "react";
import Link from "next/link";
import { recommendTrack, TRACKS } from "@/lib/mentorTracks";
import { GRADE_RULES } from "@/lib/mentorGrade";

// /mentor/join "멘토로 활동하기": 입구 3개 비교 + 나에게 맞는 입구 찾기
export function MentorJoin() {
  const [paid, setPaid] = useState<boolean | null>(null);
  const [design, setDesign] = useState<boolean | null>(null);
  const rec = paid === null || (paid === false && design === null) ? null : recommendTrack(paid, design ?? true);

  return (
    <>
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/60 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 md:pt-14">
          <p className="eyebrow">멘토의 문 · 공략 만들기</p>
          <h1 className="mt-2 text-[30px] font-extrabold leading-tight tracking-tight md:text-5xl">멘토로 활동하기</h1>
          <p className="mt-3 text-[18px] font-bold text-navy">이미 가르쳐 본 분은 바로, 처음인 분은 캠프와 함께</p>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-sub">
            입구는 세 개지만 품질 기준은 하나입니다. 모든 멘토가 본인 확인·필수 모듈·설계서 기준을 통과하고, 등급은 판매·평점·회차 리포트 실적으로 올라갑니다.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        {/* 나에게 맞는 입구 찾기 */}
        <div className="rounded-xl bg-panel p-5">
          <p className="font-bold">나에게 맞는 입구 찾기</p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <Question label="강의·코칭으로 돈을 받아 본 적이 있나요?" value={paid} onChange={(v) => { setPaid(v); if (v) setDesign(null); }} />
            {paid === false && <Question label="회차별 과정을 혼자 설계할 수 있나요?" value={design} onChange={setDesign} />}
          </div>
          {rec && (
            <p role="status" className="mt-4 rounded-lg border border-accent/40 bg-white p-3 text-[15px]">
              추천 입구: <b className="text-accent">{TRACKS.find((t) => t.track === rec)!.name}</b> — 아래 카드에서 시작하세요.
            </p>
          )}
        </div>

        {/* 입구 3개 비교 */}
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {TRACKS.map((t) => (
            <article key={t.track} className={`card flex flex-col p-5 ${rec === t.track ? "border-accent ring-2 ring-accent/30" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-accent">입구 {t.track}</p>
                {rec === t.track && <span className="rounded-full bg-accent px-2 py-0.5 text-[12px] font-bold text-white">추천</span>}
              </div>
              <h2 className="mt-1 text-xl font-bold">{t.name}</h2>
              <dl className="mt-3 space-y-2 text-sm">
                <div><dt className="font-bold text-sub">대상</dt><dd>{t.who}</dd></div>
                <div><dt className="font-bold text-sub">걸리는 시간</dt><dd>{t.time}</dd></div>
                <div><dt className="font-bold text-sub">결과 등급</dt><dd className="font-semibold text-navy">{t.result}</dd></div>
              </dl>
              <ol className="mt-3 flex flex-wrap gap-1 text-[12px]">
                {t.steps.map((st, i) => <li key={st} className="rounded bg-panel px-1.5 py-0.5 text-sub">{i + 1}. {st}</li>)}
              </ol>
              <div className="mt-auto pt-5">
                <Link href={t.cta.href} className={rec === t.track || (!rec && t.track === "A") ? "btn-primary w-full" : "btn-outline w-full"}>{t.cta.label}</Link>
              </div>
            </article>
          ))}
        </div>

        {/* 공통 관문과 등급 */}
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="font-bold">모든 입구의 공통 관문</p>
            <ol className="mt-2 space-y-1.5 text-[15px]">
              <li>1. 본인 확인 (이름·연락처)</li>
              <li>2. 필수 모듈 3단원 + 확인 퀴즈 (윤리와 경계 · 플랫폼 규칙 · 공략 설계 기준)</li>
              <li>3. 설계서 기준 검사 (회차별 결과물 · 마지막 결과물 일치 · 보장 표현·연락처 없음)</li>
              <li>4. 수습 기간: 첫 {GRADE_RULES.probationSales}건 판매 동안 운영자 모니터링</li>
            </ol>
          </div>
          <div className="card p-5">
            <p className="font-bold">등급은 실적으로 오릅니다</p>
            <ul className="mt-2 space-y-2 text-[15px]">
              <li><b>등록 멘토</b> · 공통 관문 통과(셀프 등록) — 과정 게시, 기본 노출</li>
              <li><b>인증 멘토</b> · 판매 {GRADE_RULES.certified.sales}건 + 평점 {GRADE_RULES.certified.avgRating} 이상 + 리포트 제출률 {GRADE_RULES.certified.reportRate * 100}% 이상 (경력 인증·출시 캠프는 승인 즉시) — 인증 배지, 추천 매칭 대상</li>
              <li><b>마스터 멘토</b> · 판매 {GRADE_RULES.master.sales}건 + 평점 {GRADE_RULES.master.avgRating} 이상 — 상단 노출, 캠프 보조 강사·기관 사업 우선 배정</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}

function Question({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) {
  return (
    <fieldset>
      <legend className="text-[15px] font-semibold">{label}</legend>
      <div className="mt-2 flex gap-2">
        {[true, false].map((v) => (
          <button key={String(v)} type="button" aria-pressed={value === v} onClick={() => onChange(v)}
            className={`min-h-10 flex-1 rounded-lg border px-3 text-sm font-semibold ${value === v ? "border-navy bg-navy text-white" : "border-line bg-white"}`}>
            {v ? "예" : "아니요"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
