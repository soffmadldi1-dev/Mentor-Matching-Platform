"use client";

import Link from "next/link";
import { useDemo } from "@/lib/demo/store";
import { mentorQuality, publishedCourses } from "@/lib/demo/selectors";

export function DemoAdminHome() {
  const s = useDemo();
  const review = s.courses.filter((c) => c.status === "review").length;
  const waiting = s.needRequests.filter((r) => r.status === "waiting").length;
  const pendingAssign = s.assignments.filter((a) => !a.reviewed).length;
  const applied = s.enrollments.filter((e) => e.status === "applied").length;
  const warnings = mentorQuality(s).filter((m) => m.warnings.length).length;

  const kpis = [
    { k: "대기자", v: `${s.waitlist.length}명`, sub: "목표 300명", href: "/admin/waitlist" },
    { k: "게시 과정", v: `${publishedCourses(s).length}개`, sub: "3개 분야", href: "/fields/tourism" },
    { k: "누적 신청", v: `${s.bookings.length}건`, sub: `완료 ${s.bookings.filter((b) => b.status === "done").length}건`, href: "/admin/quality" },
    { k: "인증 멘토", v: `${s.mentors.filter((m) => m.status === "certified").length}명`, sub: `파운딩 ${s.mentors.filter((m) => m.isFounding && m.status === "certified").length}명`, href: "/admin/quality" },
  ];
  const todos = [
    { n: review, t: "과정 게시 승인 대기", href: "/admin/courses" },
    { n: waiting, t: "매칭을 기다리는 요청서", href: "/admin/matching" },
    { n: pendingAssign + applied, t: "캠프 과제 검토·기수 신청 승인", href: "/admin/cohorts" },
    { n: warnings, t: "인증 유지 기준 미달 멘토", href: "/admin/quality" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">운영 대시보드</h1>
      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((x) => (
          <Link key={x.k} href={x.href} className="card p-4 hover:border-navy">
            <dt className="text-[13px] font-bold text-sub">{x.k}</dt>
            <dd className="mt-1 text-2xl font-extrabold">{x.v}</dd>
            <dd className="text-[13px] text-sub">{x.sub}</dd>
          </Link>
        ))}
      </dl>
      <h2 className="mt-8 text-lg font-bold">처리할 일</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
        {todos.map((t) => (
          <li key={t.t}>
            <Link href={t.href} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-panel">
              <span>{t.t}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-sm font-bold ${t.n ? "bg-accent text-white" : "bg-panel text-sub"}`}>{t.n}건</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-sub">AI 사용량 화면은 AI API 직접 연동(로드맵 단계 8) 때 추가됩니다. 지금은 사용자가 자기 AI를 쓰므로 API 비용이 0원입니다.</p>
    </div>
  );
}
