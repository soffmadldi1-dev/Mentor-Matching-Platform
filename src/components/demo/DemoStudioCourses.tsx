"use client";

import Link from "next/link";
import { demo, useDemo } from "@/lib/demo/store";
import { COURSE_STATUS, fmtDate } from "@/lib/demo/format";
import { getField } from "@/lib/fields";
import { formatWon } from "@/lib/prompts/pricing";
import { RoleHint } from "./RoleHint";
import { studioMe } from "./studioMe";

// 내 과정 목록·게시 요청 (CLAUDE.md 7장 /studio/courses)
export function DemoStudioCourses() {
  const s = useDemo();
  const me = studioMe(s);
  const courses = s.courses.filter((c) => c.mentorId === me);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <RoleHint roles={["mentor", "registered", "master", "candidate"]} what="멘토가 자기 과정을 관리하는 곳입니다." />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">멘토 스튜디오</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">내 과정</h1>
        </div>
        <Link href="/studio/designer" className="btn-primary">새 과정 설계하기</Link>
      </div>
      <p className="mt-2 text-sm text-sub">초안 → 게시 요청(금지 표현·연락처 자동 검사) → 운영자 승인 → 게시 순서로 진행됩니다.</p>

      <ul className="mt-6 space-y-3">
        {courses.map((c) => (
          <li key={c.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-bold">{c.title || "제목 없는 초안"}</p>
                <p className="mt-0.5 text-sm text-sub">
                  {getField(c.field)?.name} · {c.sessionCount}회차 · {c.minutes}분 · {c.price ? formatWon(c.price) : "가격 미정"} · {fmtDate(c.createdAt)} 생성
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${c.status === "published" ? "bg-accent text-white" : c.status === "review" ? "bg-accent-soft text-accent" : "bg-panel text-navy"}`}>
                {COURSE_STATUS[c.status]}
              </span>
            </div>
            {c.rejectReason && <p className="mt-2 text-sm"><b className="text-danger">반려 사유 </b>{c.rejectReason}</p>}
            {c.status === "review" && !!c.reviewWarnings?.length && (
              <p className="mt-2 text-sm text-danger">검사 경고: {c.reviewWarnings.join(" · ")}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/studio/courses/${c.id}/edit`} className="btn-outline min-h-9 px-3 text-sm">편집하기</Link>
              <Link href={`/courses/${c.id}`} className="btn-outline min-h-9 px-3 text-sm">상세페이지 보기</Link>
              {c.status === "draft" && (
                <button type="button" className="btn-navy min-h-9 px-3 text-sm" onClick={() => demo.requestReview(c.id)} disabled={!c.title || !c.sessions.length}>
                  게시 요청하기
                </button>
              )}
            </div>
            {c.status === "draft" && (!c.title || !c.sessions.length) && (
              <p className="mt-1 text-[12px] text-sub">과정명과 회차표를 채워야 게시를 요청할 수 있습니다.</p>
            )}
          </li>
        ))}
        {!courses.length && <li className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-sub">아직 과정이 없습니다.</li>}
      </ul>
    </div>
  );
}
