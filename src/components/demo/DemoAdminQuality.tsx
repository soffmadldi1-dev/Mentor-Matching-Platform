"use client";

import { getField } from "@/lib/fields";
import { useDemo } from "@/lib/demo/store";
import { fieldOutcomes, mentorQuality, QUALITY_RULES } from "@/lib/demo/selectors";
import { toCsv } from "@/lib/csv";
import { downloadText } from "./download";

// 품질 지표: 멘토별 리포트 제출률·평균 평점·경고, 기관 보고용 성과 요약
export function DemoAdminQuality() {
  const s = useDemo();
  const q = mentorQuality(s);
  const outcomes = fieldOutcomes(s);

  function exportCsv() {
    const csv = toCsv(
      ["분야", "수강 신청", "완료", "평균 평점", "결과물 수"],
      outcomes.map((o) => [getField(o.field)?.name ?? o.field, o.enrollments, o.completed, o.avgRating?.toFixed(2) ?? "", o.outputs]),
    );
    downloadText(`outcomes-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">품질 지표</h1>
      <p className="mt-1 text-sm text-sub">
        인증 유지 기준: 회차 리포트 제출률 {QUALITY_RULES.reportRate * 100}% 이상, 평균 후기 {QUALITY_RULES.avgRating}점 이상. 미달이면 경고가 표시됩니다.
      </p>

      <ul className="mt-6 divide-y divide-line rounded-xl border border-line">
        <li className="hidden grid-cols-[1.2fr_70px_70px_110px_100px_1.6fr] gap-3 bg-panel px-4 py-2 text-[13px] font-bold text-sub md:grid">
          <span>멘토</span><span>과정</span><span>신청</span><span>리포트 제출률</span><span>평균 후기</span><span>상태</span>
        </li>
        {q.map((m) => (
          <li key={m.mentorId} className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[1.2fr_70px_70px_110px_100px_1.6fr] md:items-center md:gap-3">
            <span className="font-semibold">{m.name}</span>
            <span><span className="text-sub md:hidden">과정 </span>{m.courses}개</span>
            <span><span className="text-sub md:hidden">신청 </span>{m.bookings}건</span>
            <span className={m.reportRate !== null && m.reportRate < QUALITY_RULES.reportRate ? "font-bold text-danger" : ""}>
              <span className="font-normal text-sub md:hidden">리포트 제출률 </span>{m.reportRate === null ? "-" : `${Math.round(m.reportRate * 100)}%`} <span className="text-[12px] font-normal text-sub">({m.reportsSubmitted}/{m.sessionsDone})</span>
            </span>
            <span className={m.avgRating !== null && m.avgRating < QUALITY_RULES.avgRating ? "font-bold text-danger" : ""}>
              <span className="font-normal text-sub md:hidden">평균 후기 </span>{m.avgRating === null ? "-" : `★ ${m.avgRating.toFixed(1)}`} <span className="text-[12px] font-normal text-sub">({m.reviewCount})</span>
            </span>
            <span>{m.warnings.length ? <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[13px] font-semibold text-danger">경고: {m.warnings.join(" · ")}</span> : <span className="text-ok">기준 충족</span>}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">기관 보고용 성과 요약</h2>
          <p className="text-sm text-sub">정부지원·기관 협력 사업 보고에 쓰는 분야별 수강·평점·결과물 집계입니다.</p>
        </div>
        <button type="button" className="btn-navy" onClick={exportCsv}>성과 요약 CSV 내보내기</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {outcomes.map((o) => (
          <div key={o.field} className="card p-4">
            <p className="font-bold text-navy">{getField(o.field)?.name}</p>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-sub">수강 신청</dt><dd className="text-lg font-extrabold">{o.enrollments}건</dd></div>
              <div><dt className="text-sub">완료</dt><dd className="text-lg font-extrabold">{o.completed}건</dd></div>
              <div><dt className="text-sub">평균 평점</dt><dd className="text-lg font-extrabold">{o.avgRating ? `★ ${o.avgRating.toFixed(1)}` : "-"}</dd></div>
              <div><dt className="text-sub">결과물</dt><dd className="text-lg font-extrabold">{o.outputs}개</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
