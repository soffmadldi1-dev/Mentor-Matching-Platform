"use client";

import { useState } from "react";
import Link from "next/link";
import { getField, MODE_LABELS } from "@/lib/fields";
import { demo, useDemo, useHydrated } from "@/lib/demo/store";
import { COURSE_STATUS } from "@/lib/demo/format";
import { CourseEditForm } from "@/app/studio/courses/[id]/edit/CourseEditForm";
import { RoleHint } from "./RoleHint";

// 시연용 과정 편집: 브라우저 저장 + 게시 요청(금지 표현·연락처 검사)
export function DemoCourseEdit({ id, fromDesigner }: { id: string; fromDesigner: boolean }) {
  const s = useDemo();
  const hydrated = useHydrated();
  const c = s.courses.find((x) => x.id === id);
  const [warnings, setWarnings] = useState<string[] | null>(null);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!c) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-lg font-bold">과정을 찾을 수 없습니다</p>
        <Link href="/studio/courses" className="btn-outline mt-4">내 과정 목록</Link>
      </div>
    );
  }

  function requestReview() {
    const w = demo.requestReview(id);
    setWarnings(w);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <RoleHint roles={["mentor", "registered", "master", "candidate"]} what="멘토가 과정을 다듬고 게시를 요청하는 곳입니다." />
      <p className="eyebrow">멘토 스튜디오 · 과정 편집</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{c.title || "제목 없는 초안"}</h1>
      <p className="mt-1 text-sm text-sub">
        {getField(c.field)?.name} · {c.sessionCount}회차 · 회당 {c.minutes}분 · {MODE_LABELS[c.mode]} ·{" "}
        <b className="text-ink">{COURSE_STATUS[c.status]}</b>
      </p>
      {fromDesigner && (
        <p role="status" className="mt-4 rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm">
          초안을 저장했습니다. 설계서를 보며 아래 항목을 채우거나, &ldquo;설계서에서 가져오기&rdquo;로 한 번에 채운 뒤 다듬으세요.
        </p>
      )}
      {c.rejectReason && (
        <p role="alert" className="mt-4 rounded-lg bg-panel p-3 text-sm"><b className="text-danger">운영자 반려 사유 </b>{c.rejectReason}</p>
      )}
      <div className="mt-6">
        <CourseEditForm
          key={c.id}
          designMarkdown={c.designMarkdown ?? ""}
          sessionCount={c.sessionCount}
          initial={{
            title: c.title,
            oneLiner: c.oneLiner,
            target: c.target,
            before: c.before,
            after: c.after,
            sessions: c.sessions,
            prep: c.prep,
            notice: c.notice,
            price: c.price,
            headlines: c.headlines,
            checks: c.checks,
          }}
          onSave={async (v) => {
            demo.updateCourse(id, { ...v, status: c.status === "published" ? "review" : c.status });
            return { ok: true, message: c.status === "published" ? "저장했습니다. 게시 중인 과정이라 다시 검토 대기로 바뀌었습니다." : "저장했습니다." };
          }}
          footer={
            <div className="mt-3 border-t border-line pt-3">
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" className="btn-navy" onClick={requestReview} disabled={c.status === "review" || c.status === "published"}>
                  {c.status === "review" ? "검토 대기 중" : c.status === "published" ? "게시 중" : "게시 요청하기"}
                </button>
                <Link href={`/courses/${c.id}`} className="text-sm font-semibold text-navy underline underline-offset-2">상세페이지 미리보기</Link>
              </div>
              <p className="mt-1 text-[12px] text-sub">먼저 &ldquo;초안 저장하기&rdquo;를 누른 뒤 게시를 요청하세요. 운영자가 검토 후 게시합니다.</p>
              {warnings && (
                <div role="status" className={`mt-2 rounded-lg p-3 text-sm ${warnings.length ? "bg-accent-soft" : "bg-panel"}`}>
                  {warnings.length ? (
                    <>
                      <p className="font-bold text-danger">게시 요청은 접수됐지만, 운영자 검토 때 아래 내용이 표시됩니다</p>
                      <ul className="mt-1 space-y-0.5">{warnings.map((w) => <li key={w}>· {w}</li>)}</ul>
                    </>
                  ) : (
                    <p className="font-semibold text-ok">금지 표현·연락처 검사 통과. 운영자 검토를 기다립니다.</p>
                  )}
                </div>
              )}
            </div>
          }
        />
      </div>
    </div>
  );
}
