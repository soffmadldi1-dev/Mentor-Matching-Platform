"use client";

import { useState } from "react";
import { demo, useDemo } from "@/lib/demo/store";
import { gradeLabel, mentorGradeInfo, personName } from "@/lib/demo/selectors";
import { GRADE_RULES, TRACK_LABELS, type GradeOverride } from "@/lib/mentorGrade";

// 운영자: 멘토 목록 — 등급·수습·판매·평점·리포트 제출률, 수동 등급 조정, 시연용 실적 입력
export function DemoAdminMentors() {
  const s = useDemo();
  const [open, setOpen] = useState<string | null>(null);
  const list = s.mentors.filter((m) => m.approvedAt);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">멘토 목록 · 등급</h1>
      <p className="mt-1 text-sm text-sub">
        등급은 실적으로 자동 계산됩니다. 인증: 판매 {GRADE_RULES.certified.sales}건·평점 {GRADE_RULES.certified.avgRating}·리포트 {GRADE_RULES.certified.reportRate * 100}% 이상 / 마스터: 판매 {GRADE_RULES.master.sales}건·평점 {GRADE_RULES.master.avgRating} 이상. 운영자는 사유를 남기고 수동으로 올리거나 내릴(정지 포함) 수 있습니다.
      </p>

      <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
        <li className="hidden grid-cols-[1.3fr_90px_100px_70px_80px_90px_110px] gap-3 bg-panel px-4 py-2 text-[13px] font-bold text-sub lg:grid">
          <span>멘토</span><span>입구</span><span>등급</span><span>판매</span><span>평점</span><span>리포트</span><span></span>
        </li>
        {list.map((m) => {
          const g = mentorGradeInfo(s, m.id);
          return (
            <li key={m.id} className="px-4 py-3 text-sm">
              <div className="grid gap-1 lg:grid-cols-[1.3fr_90px_100px_70px_80px_90px_110px] lg:items-center lg:gap-3">
                <span className="font-semibold">
                  {personName(s, m.id)}
                  {m.isFounding && <span className="ml-1 text-[12px] font-bold text-accent">파운딩</span>}
                  {g.probation && <span className="ml-1 rounded bg-panel px-1 text-[12px] font-bold text-navy">수습 {g.stats.sales}/3</span>}
                  {g.boosted && <span className="ml-1 rounded bg-panel px-1 text-[12px] font-bold text-navy">상위 노출</span>}
                  {m.sim && <span className="ml-1 rounded bg-accent-soft px-1 text-[12px] font-bold text-accent">시연 실적</span>}
                </span>
                <span><span className="text-sub lg:hidden">입구 </span>{m.track} {TRACK_LABELS[m.track]}</span>
                <span className={`font-bold ${g.grade === "suspended" ? "text-danger" : "text-navy"}`}><span className="font-normal text-sub lg:hidden">등급 </span>{gradeLabel(g.grade)}{m.override ? "*" : ""}</span>
                <span><span className="text-sub lg:hidden">판매 </span>{g.stats.sales}건</span>
                <span><span className="text-sub lg:hidden">평점 </span>{g.stats.avgRating === null ? "-" : `★ ${g.stats.avgRating.toFixed(1)}`}</span>
                <span><span className="text-sub lg:hidden">리포트 </span>{g.stats.reportRate === null ? "-" : `${Math.round(g.stats.reportRate * 100)}%`}</span>
                <button type="button" className="btn-outline min-h-9 w-fit px-3 text-sm" onClick={() => setOpen(open === m.id ? null : m.id)} aria-expanded={open === m.id}>
                  {open === m.id ? "닫기" : "등급 관리"}
                </button>
              </div>
              {g.result?.next && <p className="mt-1 text-[13px] text-sub">다음 등급까지: {g.result.next.remaining.join(" · ") || "조건 충족"}</p>}
              {m.override && <p className="mt-1 text-[13px]"><b>* 수동 조정</b> {m.override.reason}</p>}
              {open === m.id && <MentorTools mentorId={m.id} />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MentorTools({ mentorId }: { mentorId: string }) {
  const s = useDemo();
  const m = s.mentors.find((x) => x.id === mentorId)!;
  const g = mentorGradeInfo(s, mentorId);
  const [grade, setGrade] = useState<GradeOverride["grade"] | "">(m.override?.grade ?? "");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [sales, setSales] = useState(String(g.stats.sales));
  const [rating, setRating] = useState(g.stats.avgRating === null ? "" : g.stats.avgRating.toFixed(1));
  const [rate, setRate] = useState(g.stats.reportRate === null ? "100" : String(Math.round(g.stats.reportRate * 100)));

  function applyOverride() {
    if (!grade) {
      demo.setMentorOverride(mentorId, null, "");
      return;
    }
    if (!reason.trim()) {
      setErr("등급 조정 사유를 적어 주세요.");
      return;
    }
    setErr(null);
    demo.setMentorOverride(mentorId, grade, reason.trim());
    setReason("");
  }

  return (
    <div className="mt-3 grid gap-4 rounded-lg bg-panel p-4 md:grid-cols-2">
      <div>
        <p className="font-bold">수동 등급 조정</p>
        <label htmlFor={`ov-${mentorId}`} className="sr-only">조정할 등급</label>
        <select id={`ov-${mentorId}`} className="input mt-2" value={grade} onChange={(e) => setGrade(e.target.value as typeof grade)}>
          <option value="">자동 계산 따르기</option>
          <option value="registered">등록 멘토로</option>
          <option value="certified">인증 멘토로</option>
          <option value="master">마스터 멘토로</option>
          <option value="suspended">활동 정지</option>
        </select>
        <input className="input mt-2" aria-label="조정 사유" placeholder="사유 (예: 외부 직거래 유도 신고 확인)" value={reason} onChange={(e) => setReason(e.target.value)} />
        <button type="button" className="btn-navy mt-2" onClick={applyOverride}>등급 적용하기</button>
        {err && <p role="alert" className="mt-1 text-sm text-danger">{err}</p>}
      </div>
      <div>
        <p className="font-bold">시연: 실적 입력</p>
        <p className="text-[12px] text-sub">입력하면 자동 등급이 바로 다시 계산됩니다.</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <label className="text-[12px] text-sub">판매(건)<input className="input mt-0.5" inputMode="numeric" value={sales} onChange={(e) => setSales(e.target.value)} /></label>
          <label className="text-[12px] text-sub">평균 평점<input className="input mt-0.5" inputMode="decimal" value={rating} onChange={(e) => setRating(e.target.value)} /></label>
          <label className="text-[12px] text-sub">리포트(%)<input className="input mt-0.5" inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" className="btn-primary" onClick={() => demo.setMentorSim(mentorId, {
            sales: Math.max(0, Number(sales) || 0),
            avgRating: rating.trim() ? Math.min(5, Number(rating)) : null,
            reportRate: rate.trim() ? Math.min(100, Number(rate)) / 100 : null,
          })}>실적 적용하기</button>
          {m.sim && <button type="button" className="btn-outline" onClick={() => demo.setMentorSim(mentorId, null)}>실제 데이터로 되돌리기</button>}
        </div>
      </div>
    </div>
  );
}
