"use client";

import { useState } from "react";
import Link from "next/link";
import { getField } from "@/lib/fields";
import { formatWon } from "@/lib/prompts/pricing";
import { demo, useDemo } from "@/lib/demo/store";
import { personName } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";

// 과정 게시 승인/반려
export function DemoAdminCourses() {
  const s = useDemo();
  const queue = s.courses.filter((c) => c.status === "review");
  const published = s.courses.filter((c) => c.status === "published");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  return (
    <div>
      <h1 className="text-2xl font-extrabold">과정 게시 승인</h1>
      <p className="mt-1 text-sm text-sub">게시 요청이 들어오면 보장 표현·외부 연락처를 자동 검사한 결과와 함께 표시됩니다.</p>

      <h2 className="mt-6 text-lg font-bold">검토 대기 {queue.length}건</h2>
      <ul className="mt-3 space-y-3">
        {queue.map((c) => (
          <li key={c.id} className="card p-4">
            <p className="font-bold">{c.title}</p>
            <p className="mt-0.5 text-sm text-sub">{personName(s, c.mentorId)} · {getField(c.field)?.name} · {c.sessionCount}회차 · {c.price ? formatWon(c.price) : "가격 미정"}</p>
            <p className="mt-2 text-[15px]">{c.oneLiner}</p>
            {c.reviewWarnings?.length ? (
              <ul className="mt-3 rounded-lg bg-accent-soft p-3 text-sm text-danger">
                {c.reviewWarnings.map((w) => <li key={w}>· {w}</li>)}
              </ul>
            ) : (
              <p className="mt-3 rounded-lg bg-panel p-3 text-sm text-ok">자동 검사 통과</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Link href={`/courses/${c.id}`} className="btn-outline min-h-9 px-3 text-sm">상세페이지 미리보기</Link>
              <button type="button" className="btn-navy min-h-9 px-3 text-sm" onClick={() => demo.approveCourse(c.id)}>게시 승인하기</button>
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input className="input" aria-label="반려 사유" placeholder="반려 사유 (예: 한 줄 소개의 '합격 보장' 표현을 고쳐 주세요)" value={reasons[c.id] ?? ""} onChange={(e) => setReasons((r) => ({ ...r, [c.id]: e.target.value }))} />
              <button type="button" className="btn-outline shrink-0" disabled={!reasons[c.id]?.trim()} onClick={() => demo.rejectCourse(c.id, reasons[c.id].trim())}>반려하기</button>
            </div>
          </li>
        ))}
        {!queue.length && <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-sub">검토할 과정이 없습니다.</li>}
      </ul>

      <h2 className="mt-10 text-lg font-bold">게시 중 {published.length}개</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
        {published.map((c) => (
          <li key={c.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <Link href={`/courses/${c.id}`} className="font-semibold hover:text-navy">{c.title}</Link>
              <p className="text-sm text-sub">{personName(s, c.mentorId)} · {getField(c.field)?.name} · {c.publishedAt ? `${fmtDate(c.publishedAt)} 게시` : ""}</p>
            </div>
            <button type="button" className="text-sm text-sub underline underline-offset-2" onClick={() => demo.updateCourse(c.id, { status: "hidden" })}>숨기기</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
