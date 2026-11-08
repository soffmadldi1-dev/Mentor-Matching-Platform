"use client";

import Link from "next/link";
import { demo, useDemo } from "@/lib/demo/store";
import { personName } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import { formatWon } from "@/lib/prompts/pricing";
import { CAMP_WEEKS } from "@/lib/academy";

const STATUS = { draft: "준비 중", open: "모집 중", running: "진행 중", closed: "종료" } as const;

// 기수 목록 + 신청자 승인
export function DemoAdminCohorts() {
  const s = useDemo();
  return (
    <div>
      <h1 className="text-2xl font-extrabold">기수 관리</h1>
      <p className="mt-1 text-sm text-sub">진입 워크숍과 출시 캠프 기수, 신청자 승인, 수강생 진도를 관리합니다.</p>
      <ul className="mt-6 space-y-3">
        {s.cohorts.map((c) => {
          const list = s.enrollments.filter((e) => e.cohortId === c.id);
          const applied = list.filter((e) => e.status === "applied");
          return (
            <li key={c.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{c.name}</p>
                  <p className="text-sm text-sub">{c.kind === "workshop" ? "워크숍" : "캠프"} · {fmtDate(c.startsOn)} ~ {fmtDate(c.endsOn)} · {c.price ? formatWon(c.price) : "0원"} · 수강생 {list.filter((e) => e.status !== "applied").length}명</p>
                </div>
                <span className="rounded-full bg-panel px-2.5 py-0.5 text-[13px] font-bold text-navy">{STATUS[c.status]}</span>
              </div>
              {applied.length > 0 && (
                <ul className="mt-3 space-y-2 rounded-lg bg-accent-soft p-3">
                  {applied.map((e) => (
                    <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span><b>{personName(s, e.userId)}</b> 신청</span>
                      <span className="flex gap-2">
                        <button type="button" className="btn-navy min-h-9 px-3 text-sm" onClick={() => demo.setEnrollmentStatus(e.id, "accepted")}>참여 승인하기</button>
                        <button type="button" className="btn-outline min-h-9 px-3 text-sm" onClick={() => demo.setEnrollmentStatus(e.id, "dropped")}>거절하기</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {c.kind === "camp" && list.length > 0 && (
                <Link href={`/admin/cohorts/${c.id}`} className="mt-3 inline-block text-sm font-semibold text-navy underline underline-offset-2">수강생 진도·과제 보기</Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[13px] text-sub">새 기수 만들기(기간·가격·상태 입력)는 DB 연동 후 이 화면에 추가됩니다. 가격 정책: 1기 0원 · 2기 9.9만 원 · 3기부터 19.9만 원.</p>
    </div>
  );
}

// 기수 상세: 수강생별 주차 진도, 과제 검토, 수료 승인
export function DemoAdminCohortDetail({ id }: { id: string }) {
  const s = useDemo();
  const c = s.cohorts.find((x) => x.id === id);
  if (!c) return <p className="text-sm text-sub">기수를 찾을 수 없습니다.</p>;
  const list = s.enrollments.filter((e) => e.cohortId === id && e.status !== "applied" && e.status !== "dropped");

  return (
    <div>
      <Link href="/admin/cohorts" className="text-sm text-sub underline underline-offset-2">← 기수 관리</Link>
      <h1 className="mt-2 text-2xl font-extrabold">{c.name}</h1>
      <p className="mt-1 text-sm text-sub">수료 조건: 과정 게시 + 파일럿 후기 3건. 수료를 승인하면 인증 멘토가 되고 배지가 붙습니다.</p>

      <ul className="mt-6 space-y-4">
        {list.map((e) => {
          const course = s.courses.find((x) => x.mentorId === e.userId && x.status !== "hidden");
          const pending = s.assignments.filter((a) => a.enrollmentId === e.id && !a.reviewed);
          const canGraduate = e.status !== "completed" && [0, 1, 2, 3].every((w) => e.passedWeeks.includes(w));
          return (
            <li key={e.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{personName(s, e.userId)}</p>
                <span className="text-sm font-semibold text-navy">{e.status === "completed" ? `수료 · ${e.graduatedAt ? fmtDate(e.graduatedAt) : ""}` : `${e.passedWeeks.length}/5 주차 통과`}</span>
              </div>
              <ol className="mt-3 grid grid-cols-5 gap-1.5" aria-label="주차 진도">
                {CAMP_WEEKS.map((w) => (
                  <li key={w.week} className={`rounded-md px-1 py-1.5 text-center text-[12px] font-bold ${e.passedWeeks.includes(w.week) ? "bg-navy text-white" : "bg-panel text-sub"}`}>
                    {w.week}주
                  </li>
                ))}
              </ol>
              {course && <p className="mt-3 text-sm">과정: <Link href={`/courses/${course.id}`} className="font-semibold text-navy underline">{course.title || "제목 없는 초안"}</Link> ({course.status === "published" ? "게시 중" : course.status === "review" ? "검토 대기" : "초안"})</p>}
              {pending.map((a) => (
                <div key={a.id} className="mt-3 rounded-lg bg-accent-soft p-3 text-sm">
                  <p className="font-bold">{a.week}주차 과제 · {fmtDate(a.submittedAt)} 제출</p>
                  <p className="mt-1 whitespace-pre-line">{a.content}</p>
                  <button type="button" className="btn-navy mt-2 min-h-9 px-3 text-sm" onClick={() => demo.passWeek(e.id, a.week)}>검토 완료 · {a.week}주차 통과하기</button>
                </div>
              ))}
              {canGraduate && (
                <button type="button" className="btn-primary mt-3" onClick={() => demo.graduate(e.id)}>수료 승인하기 → 인증 멘토</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
