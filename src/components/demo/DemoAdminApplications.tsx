"use client";

import { useState } from "react";
import Link from "next/link";
import { getField } from "@/lib/fields";
import { demo, useDemo, useHydrated } from "@/lib/demo/store";
import { gradeLabel, mentorGradeInfo, personName } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import { allPassed, checkDesignMarkdown } from "@/lib/designCheck";
import { baseGrade, GRADE_LABELS, TRACK_LABELS } from "@/lib/mentorGrade";
import { MODULE_UNITS } from "@/lib/mentorModule";
import { MarkdownView } from "@/components/MarkdownView";
import { APP_STATUS_LABELS } from "./GradeCard";

// 운영자: 멘토 지원 심사 목록
export function DemoAdminApplications() {
  const s = useDemo();
  const [track, setTrack] = useState<"" | "A" | "B">("");
  const [status, setStatus] = useState<"" | "submitted" | "revision" | "approved" | "rejected">("submitted");
  const list = s.applications
    .filter((a) => a.status !== "draft" && (!track || a.track === track) && (!status || a.status === status))
    .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));

  return (
    <div>
      <h1 className="text-2xl font-extrabold">멘토 지원 심사</h1>
      <p className="mt-1 text-sm text-sub">셀프 등록(A)·경력 인증(B) 지원서입니다. 출시 캠프(C)는 기수·수료 화면에서 수료 승인합니다.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <div>
          <label htmlFor="ap-t" className="label">입구</label>
          <select id="ap-t" className="input w-auto" value={track} onChange={(e) => setTrack(e.target.value as typeof track)}>
            <option value="">전체</option>
            <option value="A">A 셀프 등록</option>
            <option value="B">B 경력 인증</option>
          </select>
        </div>
        <div>
          <label htmlFor="ap-s" className="label">상태</label>
          <select id="ap-s" className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
            <option value="">전체</option>
            <option value="submitted">심사 중</option>
            <option value="revision">보완 요청</option>
            <option value="approved">승인</option>
            <option value="rejected">반려</option>
          </select>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {list.map((a) => {
          const checks = checkDesignMarkdown(a.design.markdown, a.design.sessionCount, a.design.finalOutput);
          const ok = allPassed(checks);
          return (
            <li key={a.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold">{personName(s, a.userId)} <span className="ml-1 rounded bg-panel px-1.5 py-0.5 text-[12px] font-bold text-navy">입구 {a.track} {TRACK_LABELS[a.track]}</span></p>
                  <p className="mt-0.5 text-sm text-sub">{getField(a.basic.field || "")?.name ?? "-"} · {a.submittedAt ? `${fmtDate(a.submittedAt)} 제출` : "-"} · 승인 시 {GRADE_LABELS[baseGrade(a.track)]}</p>
                  <p className="mt-1 text-sm">{a.basic.oneLiner}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${a.status === "submitted" ? "bg-accent text-white" : "bg-panel text-navy"}`}>{APP_STATUS_LABELS[a.status]}</span>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <p className={`rounded-lg p-2 ${ok ? "bg-panel" : "bg-accent-soft"}`}><b>자동 검사</b> <span className={ok ? "text-ok" : "text-danger"}>{ok ? "통과" : `수정 필요 ${checks.filter((c) => !c.ok).length}건`}</span></p>
                {a.track === "B" && <p className="rounded-lg bg-panel p-2"><b>경력 증빙</b> {a.evidence.items.filter((e) => e.org).length}건{a.evidence.certs && ` · ${a.evidence.certs}`}</p>}
                {a.track === "B" && <p className="rounded-lg bg-panel p-2"><b>인터뷰</b> {a.interviewSlots[0] ?? "-"} 외 {Math.max(0, a.interviewSlots.length - 1)}개</p>}
              </div>
              <Link href={`/admin/applications/${a.id}`} className="btn-outline mt-3 min-h-9 px-3 text-sm">상세 보고 심사하기</Link>
            </li>
          );
        })}
        {!list.length && <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-sub">해당하는 지원서가 없습니다.</li>}
      </ul>
    </div>
  );
}

// 운영자: 지원서 상세 — 승인 / 보완 요청(사유) / 반려(사유)
export function DemoAdminApplicationDetail({ id }: { id: string }) {
  const s = useDemo();
  const hydrated = useHydrated();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const a = s.applications.find((x) => x.id === id);
  if (!hydrated) return <div className="min-h-[40vh]" aria-busy="true" />;
  if (!a) return <p className="text-sm text-sub">지원서를 찾을 수 없습니다. <Link href="/admin/applications" className="underline">목록으로</Link></p>;
  const checks = checkDesignMarkdown(a.design.markdown, a.design.sessionCount, a.design.finalOutput);
  const g = mentorGradeInfo(s, a.userId);

  function decide(d: "approved" | "revision" | "rejected") {
    if (d !== "approved" && !reason.trim()) {
      setError("보완 요청·반려에는 사유를 적어 주세요.");
      return;
    }
    setError(null);
    demo.decideApplication(a!.id, d, reason.trim());
    setReason("");
  }

  return (
    <div>
      <Link href="/admin/applications" className="text-sm text-sub underline underline-offset-2">← 멘토 지원 심사</Link>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold">{personName(s, a.userId)}</h1>
        <span className="rounded bg-panel px-2 py-0.5 text-sm font-bold text-navy">입구 {a.track} {TRACK_LABELS[a.track]}</span>
        <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-sm font-bold text-accent">{APP_STATUS_LABELS[a.status]}</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <section className="card p-4">
            <p className="font-bold">기본 정보</p>
            <dl className="mt-2 space-y-1 text-sm">
              <div><dt className="inline font-bold text-sub">분야 </dt><dd className="inline">{getField(a.basic.field || "")?.name ?? "-"}</dd></div>
              <div><dt className="inline font-bold text-sub">한 줄 소개 </dt><dd className="inline">{a.basic.oneLiner}</dd></div>
              <div><dt className="inline font-bold text-sub">경력 </dt><dd className="inline">{a.basic.career}</dd></div>
              <div><dt className="inline font-bold text-sub">본인 확인 </dt><dd className="inline">{a.identityChecked ? "확인" : "미확인"}</dd></div>
              <div><dt className="inline font-bold text-sub">필수 모듈 </dt><dd className="inline">{a.modulePassed.length}/{MODULE_UNITS.length} 단원 통과</dd></div>
            </dl>
          </section>
          {a.track === "B" && (
            <section className="card p-4">
              <p className="font-bold">경력 증빙</p>
              <ul className="mt-2 space-y-1 text-sm">
                {a.evidence.items.filter((e) => e.org).map((e, i) => <li key={i}>· {e.org} — {e.topic} ({e.year}, {e.people}명)</li>)}
              </ul>
              <p className="mt-2 text-sm"><b className="text-sub">자격</b> {a.evidence.certs || "-"}</p>
              <p className="text-sm"><b className="text-sub">후기</b> {a.evidence.reviewLinks || "-"}</p>
              <p className="text-sm"><b className="text-sub">대표 강의</b> {a.evidence.lectureUrl || "-"}</p>
              <p className="mt-3 font-bold">20분 화상 인터뷰 희망 일정</p>
              <ul className="mt-1 text-sm">{a.interviewSlots.map((t) => <li key={t}>· {t}</li>)}</ul>
            </section>
          )}
          <section className="card p-4">
            <p className="font-bold">설계서 자동 검사</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {checks.map((c) => (
                <li key={c.key}><span className={c.ok ? "font-semibold text-ok" : "font-semibold text-danger"}>{c.ok ? "통과" : "수정 필요"}</span> · {c.label}{!c.ok && <span className="block text-[13px] text-sub">{c.detail}</span>}</li>
              ))}
            </ul>
          </section>

          {a.status === "submitted" || a.status === "revision" ? (
            <section className="card p-4">
              <p className="font-bold">심사</p>
              <p className="mt-1 text-sm text-sub">승인하면 <b className="text-ink">{GRADE_LABELS[baseGrade(a.track)]}</b> 등급이 부여되고, 첫 3건 판매 동안 수습으로 표시됩니다.</p>
              <button type="button" className="btn-primary mt-3 w-full" onClick={() => decide("approved")}>승인하기 · {GRADE_LABELS[baseGrade(a.track)]}</button>
              <label htmlFor="ad-reason" className="label mt-4">보완 요청·반려 사유</label>
              <textarea id="ad-reason" className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="예: 2회차 결과물을 명사로 구체적으로 써 주세요" />
              <div className="mt-2 flex gap-2">
                <button type="button" className="btn-outline flex-1" onClick={() => decide("revision")}>보완 요청하기</button>
                <button type="button" className="btn-outline flex-1" onClick={() => decide("rejected")}>반려하기</button>
              </div>
              {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
            </section>
          ) : (
            <section className="card p-4 text-sm">
              <p className="font-bold">심사 결과: {APP_STATUS_LABELS[a.status]}{a.decidedAt ? ` · ${fmtDate(a.decidedAt)}` : ""}</p>
              {a.reason && <p className="mt-1">사유: {a.reason}</p>}
              {a.status === "approved" && <p className="mt-1">현재 등급: <b>{gradeLabel(g.grade)}</b> · <Link href="/admin/mentors" className="font-semibold text-navy underline">멘토 목록</Link></p>}
            </section>
          )}
        </div>

        <section className="card p-4">
          <p className="font-bold">제출한 설계서 <span className="font-normal text-sub">· {a.design.sessionCount}회차 · 최종 결과물 &ldquo;{a.design.finalOutput}&rdquo;</span></p>
          <div className="mt-2 max-h-[70vh] overflow-y-auto"><MarkdownView markdown={a.design.markdown} /></div>
        </section>
      </div>
    </div>
  );
}
