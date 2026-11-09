"use client";

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { courseRating, mentorGradeInfo, personName } from "@/lib/demo/selectors";
import { GradeCard } from "./GradeCard";
import { COURSE_STATUS } from "@/lib/demo/format";
import { getField } from "@/lib/fields";
import { RoleHint } from "./RoleHint";
import { studioMe } from "./studioMe";

// 멘토 스튜디오 홈
export function DemoStudio() {
  const s = useDemo();
  const me = studioMe(s);
  const courses = s.courses.filter((c) => c.mentorId === me);
  const bookings = s.bookings.filter((b) => courses.some((c) => c.id === b.courseId));
  const g = mentorGradeInfo(s, me);
  const isCandidate = me === "me-cand";
  const isApplicant = !g.approved && !isCandidate;
  const inquiries = bookings.filter((b) => b.status === "inquiry").length;

  const stats = isApplicant
    ? []
    : isCandidate
    ? [
        { k: "내 과정", v: `${courses.length}개` },
        { k: "캠프 진도", v: `${s.enrollments.find((e) => e.userId === me)?.passedWeeks.length ?? 0}/5 주차` },
        { k: "인증 상태", v: "예비 멘토" },
      ]
    : [
        { k: "새 신청", v: `${inquiries}건` },
        { k: "진행·완료", v: `${bookings.filter((b) => b.status === "in_progress" || b.status === "done").length}건` },
        { k: "판매(확정)", v: `${g.stats.sales}건` },
        { k: "후기", v: `${g.stats.reviewCount}건` },
      ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <RoleHint roles={["mentor", "registered", "master", "candidate"]} what="멘토가 과정을 설계·관리하는 작업 공간입니다." />
      <p className="eyebrow">멘토 스튜디오</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{personName(s, me)}의 스튜디오</h1>
      {isApplicant && <p className="mt-1 text-sm text-sub">멘토 지원·심사 흐름 시연용 스튜디오입니다.</p>}
      <div className="mt-5"><GradeCard mentorId={me} /></div>
      {isCandidate && (
        <p className="mt-3 rounded-lg bg-panel p-3 text-sm">출시 캠프(입구 C)를 수료하면 인증 멘토가 되고, 첫 멘티 연결과 30일 상위 노출 혜택을 받습니다.</p>
      )}

      {stats.length > 0 && <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((x) => (
          <div key={x.k} className="card p-4">
            <dt className="text-[13px] font-bold text-sub">{x.k}</dt>
            <dd className="mt-1 text-xl font-extrabold">{x.v}</dd>
          </div>
        ))}
      </dl>}

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          { href: "/studio/designer", t: "AI 공략 설계기", b: "내 경험으로 회차별 과정을 설계합니다." },
          { href: "/studio/courses", t: "내 과정", b: "초안을 다듬고 게시를 요청합니다." },
          isCandidate
            ? { href: "/academy/camp", t: "내 캠프", b: "주차별 과제를 내고 통과 기준을 확인합니다." }
            : { href: "/studio/bookings", t: "신청 관리 · 회차 리포트", b: "신청을 확정하고 회차 리포트를 보냅니다." },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="card p-5 hover:border-navy">
            <p className="font-bold">{x.t}</p>
            <p className="mt-1 text-sm text-sub">{x.b}</p>
          </Link>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-bold">내 과정</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
        {courses.map((c) => {
          const r = courseRating(s, c.id);
          return (
            <li key={c.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{c.title || "제목 없는 초안"}</p>
                <p className="text-sm text-sub">
                  {getField(c.field)?.name} · {c.sessionCount}회차 · {COURSE_STATUS[c.status]}
                  {r.avg !== null && ` · ★ ${r.avg.toFixed(1)}`}
                </p>
              </div>
              <Link href={`/studio/courses/${c.id}/edit`} className="text-sm font-semibold text-navy hover:text-accent">편집하기</Link>
            </li>
          );
        })}
        {!courses.length && <li className="px-4 py-8 text-center text-sm text-sub">아직 과정이 없습니다. 공략 설계기에서 첫 초안을 만들어 보세요.</li>}
      </ul>
    </div>
  );
}
