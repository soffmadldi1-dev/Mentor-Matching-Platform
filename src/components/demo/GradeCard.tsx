"use client";

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { gradeLabel, mentorGradeInfo, mentorOf } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import { GRADE_LABELS, GRADE_RULES, TRACK_LABELS } from "@/lib/mentorGrade";
import type { ApplicationStatus } from "@/lib/demo/types";

export const APP_STATUS_LABELS: Record<ApplicationStatus, string> = {
  draft: "작성 중",
  submitted: "심사 중",
  revision: "보완 요청",
  approved: "승인",
  rejected: "반려",
};

// 멘토 스튜디오 상단: 등급 배지, 수습 진행, 다음 등급까지 진행 막대 + 지원 상태
export function GradeCard({ mentorId }: { mentorId: string }) {
  const s = useDemo();
  const m = mentorOf(s, mentorId);
  const g = mentorGradeInfo(s, mentorId);
  const apps = s.applications.filter((a) => a.userId === mentorId);

  return (
    <div className="space-y-3">
      {apps.map((a) => (
        <div key={a.id} className={`rounded-xl border p-4 ${a.status === "revision" || a.status === "rejected" ? "border-accent/40 bg-accent-soft" : "border-line bg-panel"}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-bold">멘토 지원 · 입구 {a.track} {TRACK_LABELS[a.track]}</p>
            <span className="rounded-full bg-white px-2.5 py-0.5 text-[13px] font-bold text-navy ring-1 ring-line">{APP_STATUS_LABELS[a.status]}</span>
          </div>
          {a.status === "submitted" && <p className="mt-1 text-sm text-sub">심사 중입니다 (보통 3일 이내){a.submittedAt ? ` · ${fmtDate(a.submittedAt)} 제출` : ""}</p>}
          {(a.status === "revision" || a.status === "rejected") && <p className="mt-1 text-sm"><b className="text-danger">{a.status === "revision" ? "보완 요청 사유" : "반려 사유"} </b>{a.reason}</p>}
          {a.status !== "approved" && (
            <Link href={`/mentor/join/${a.track}`} className="mt-2 inline-block text-sm font-semibold text-navy underline underline-offset-2">
              {a.status === "draft" || a.status === "revision" ? "지원서 이어서 쓰기" : "지원서 보기"}
            </Link>
          )}
        </div>
      ))}

      {g.approved && g.result && m && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-sm font-extrabold ${g.grade === "suspended" ? "bg-danger text-white" : g.grade === "master" ? "bg-accent text-white" : "bg-navy text-white"}`}>
              {gradeLabel(g.grade)}
            </span>
            {m.isFounding && <span className="rounded border border-accent/40 bg-accent-soft px-1.5 py-0.5 text-[12px] font-bold text-accent">파운딩 멘토</span>}
            {g.boosted && <span className="rounded bg-panel px-1.5 py-0.5 text-[12px] font-bold text-navy">캠프 수료 · 30일 상위 노출 중</span>}
            <span className="text-[13px] text-sub">입구 {m.track} {TRACK_LABELS[m.track]}{m.approvedAt ? ` · ${fmtDate(m.approvedAt)} 승인` : ""}</span>
          </div>

          {m.override && (
            <p className="mt-3 rounded-lg bg-accent-soft p-3 text-sm"><b>운영자 등급 조정</b> · {m.override.reason}</p>
          )}

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-panel p-2"><dt className="text-[12px] text-sub">판매</dt><dd className="font-extrabold">{g.stats.sales}건</dd></div>
            <div className="rounded-lg bg-panel p-2"><dt className="text-[12px] text-sub">평균 평점</dt><dd className="font-extrabold">{g.stats.avgRating === null ? "-" : `★ ${g.stats.avgRating.toFixed(1)}`}</dd></div>
            <div className="rounded-lg bg-panel p-2"><dt className="text-[12px] text-sub">리포트 제출률</dt><dd className="font-extrabold">{g.stats.reportRate === null ? "-" : `${Math.round(g.stats.reportRate * 100)}%`}</dd></div>
          </dl>

          {g.probation && (
            <div className="mt-4">
              <p className="text-sm font-bold">수습 기간 · 판매 {g.stats.sales}/{GRADE_RULES.probationSales}건</p>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel ring-1 ring-line"><div className="h-full bg-navy" style={{ width: `${(g.stats.sales / GRADE_RULES.probationSales) * 100}%` }} /></div>
              <p className="mt-1 text-[12px] text-sub">첫 3건 판매 동안 운영자가 함께 살펴봅니다. 멘티에게는 &ldquo;새로 온 멘토&rdquo;로 표시됩니다.</p>
            </div>
          )}

          {g.result.next ? (
            <div className="mt-4">
              <p className="text-sm font-bold">다음 등급: {GRADE_LABELS[g.result.next.grade]}까지 {Math.round(g.result.next.progress * 100)}%</p>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-panel ring-1 ring-line"><div className="h-full bg-accent" style={{ width: `${g.result.next.progress * 100}%` }} /></div>
              {g.result.next.remaining.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-sm text-ink">
                  {g.result.next.remaining.map((r) => <li key={r}>· {r}</li>)}
                </ul>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-sub">최고 등급입니다. 상단 노출과 캠프 보조 강사·기관 사업 우선 배정 대상입니다.</p>
          )}
        </div>
      )}
    </div>
  );
}
