"use client";

import Link from "next/link";
import { demo, useDemo } from "@/lib/demo/store";
import { personName } from "@/lib/demo/selectors";
import { BOOKING_STATUS, fmtDate } from "@/lib/demo/format";
import type { BookingStatus } from "@/lib/demo/types";
import { RoleHint } from "./RoleHint";
import { studioMe } from "./studioMe";

const NEXT: Partial<Record<BookingStatus, { to: BookingStatus; label: string }>> = {
  inquiry: { to: "confirmed", label: "일정 확정하기" },
  confirmed: { to: "in_progress", label: "진행 시작하기" },
};

// 신청 관리 (멘토)
export function DemoBookings() {
  const s = useDemo();
  const me = studioMe(s);
  const myCourses = s.courses.filter((c) => c.mentorId === me);
  const bookings = s.bookings.filter((b) => myCourses.some((c) => c.id === b.courseId));
  const order: BookingStatus[] = ["inquiry", "confirmed", "in_progress", "done", "cancelled"];
  bookings.sort((a, z) => order.indexOf(a.status) - order.indexOf(z.status));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <RoleHint roles={["mentor", "registered", "master"]} what="멘토가 들어온 신청을 확정하고 회차 리포트를 보내는 곳입니다." />
      <p className="eyebrow">멘토 스튜디오</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">신청 관리</h1>
      <p className="mt-2 text-sm text-sub">결제 없이 신청 접수만 받습니다. 멘티와 일정을 맞춘 뒤 확정하세요. 연락은 플랫폼 안에서 이어집니다.</p>

      <ul className="mt-6 space-y-3">
        {bookings.map((b) => {
          const c = myCourses.find((x) => x.id === b.courseId)!;
          const reports = s.reports.filter((r) => r.bookingId === b.id).length;
          const next = NEXT[b.status];
          return (
            <li key={b.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold">{personName(s, b.menteeId)} <span className="font-normal text-sub">· {c.title}</span></p>
                  <p className="mt-0.5 text-sm text-sub">{fmtDate(b.createdAt)} 신청 · 희망 일정 {b.preferredSchedule}</p>
                  {b.message && <p className="mt-1 text-sm">&ldquo;{b.message}&rdquo;</p>}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${b.status === "inquiry" ? "bg-accent text-white" : "bg-panel text-navy"}`}>
                  {BOOKING_STATUS[b.status]}
                </span>
              </div>
              <p className="mt-2 text-sm text-sub">진행 {b.sessionsDone}/{c.sessionCount}회차 · 리포트 {reports}건</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {next && <button type="button" className="btn-navy min-h-9 px-3 text-sm" onClick={() => demo.setBookingStatus(b.id, next.to)}>{next.label}</button>}
                {(b.status === "in_progress" || b.status === "done") && (
                  <Link href={`/studio/bookings/${b.id}`} className="btn-primary min-h-9 px-3 text-sm">회차 리포트 쓰기</Link>
                )}
                {b.status === "inquiry" && (
                  <button type="button" className="btn-outline min-h-9 px-3 text-sm" onClick={() => demo.setBookingStatus(b.id, "cancelled")}>신청 거절하기</button>
                )}
              </div>
            </li>
          );
        })}
        {!bookings.length && <li className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-sub">아직 들어온 신청이 없습니다.</li>}
      </ul>
    </div>
  );
}
