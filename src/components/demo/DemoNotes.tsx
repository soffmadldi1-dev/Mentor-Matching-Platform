"use client";

import { useState } from "react";
import Link from "next/link";
import { demo, useDemo } from "@/lib/demo/store";
import { personName } from "@/lib/demo/selectors";
import { BOOKING_STATUS, fmtDate } from "@/lib/demo/format";
import type { DemoBooking } from "@/lib/demo/types";
import { RoleHint } from "./RoleHint";

// 내 공략 노트(멘티): 신청 내역, 회차 요약, 다음 과제, 결과물 보관, 후기
export function DemoNotes() {
  const s = useDemo();
  // 시연: 어떤 역할로 보든 예시 멘티(나)의 노트를 보여 준다
  const me = "me-mentee";
  const bookings = s.bookings.filter((b) => b.menteeId === me);
  const outputs = s.reports
    .filter((r) => bookings.some((b) => b.id === r.bookingId) && r.output)
    .map((r) => ({ ...r, course: s.courses.find((c) => c.id === bookings.find((b) => b.id === r.bookingId)?.courseId)?.title ?? "" }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <RoleHint roles={["mentee"]} what="멘티가 신청한 과정과 회차별 기록을 모아 보는 곳입니다." />
      <p className="eyebrow">멘티</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">내 공략 노트</h1>
      <p className="mt-2 text-[15px] text-sub">회차가 끝날 때마다 멘토가 보낸 요약과 다음 과제, 손에 쥔 결과물이 여기에 쌓입니다.</p>

      <div className="mt-8 space-y-6">
        {bookings.map((b) => <BookingNote key={b.id} b={b} />)}
        {!bookings.length && (
          <div className="rounded-xl border border-dashed border-line p-6 text-center">
            <p className="font-bold">아직 신청한 과정이 없습니다</p>
            <Link href="/find" className="btn-primary mt-3">공략 찾기</Link>
          </div>
        )}
      </div>

      {!!outputs.length && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">결과물 보관함</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {outputs.map((o) => (
              <li key={o.id} className="rounded-lg border border-line p-3 text-sm">
                <p className="font-semibold">{o.output}</p>
                <p className="mt-0.5 text-[13px] text-sub">{o.course} · {o.sessionN}회차</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function BookingNote({ b }: { b: DemoBooking }) {
  const s = useDemo();
  const c = s.courses.find((x) => x.id === b.courseId);
  const review = s.reviews.find((r) => r.bookingId === b.id);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  if (!c) return null;
  const reports = s.reports.filter((r) => r.bookingId === b.id).sort((a, z) => a.sessionN - z.sessionN);
  const nextHomework = [...reports].pop()?.nextHomework;

  return (
    <article className="card overflow-hidden">
      <div className="border-b border-line bg-panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link href={`/courses/${c.id}`} className="text-lg font-bold hover:text-navy">{c.title}</Link>
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[13px] font-bold text-navy ring-1 ring-line">{BOOKING_STATUS[b.status]}</span>
        </div>
        <p className="mt-1 text-sm text-sub">{personName(s, c.mentorId)} · {fmtDate(b.createdAt)} 신청 · 희망 일정 {b.preferredSchedule}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white ring-1 ring-line">
            <div className="h-full bg-accent" style={{ width: `${(b.sessionsDone / c.sessionCount) * 100}%` }} />
          </div>
          <span className="text-sm font-semibold">{b.sessionsDone}/{c.sessionCount}회차</span>
        </div>
        {nextHomework && b.status !== "done" && (
          <p className="mt-3 rounded-lg bg-accent-soft px-3 py-2 text-sm"><b>다음 과제 </b>{nextHomework}</p>
        )}
        {b.status === "inquiry" && <p className="mt-3 text-sm text-sub">멘토가 일정을 확인하고 있습니다.</p>}
      </div>

      <ol className="divide-y divide-line">
        {c.sessions.map((sess) => {
          const r = reports.find((x) => x.sessionN === sess.n);
          return (
            <li key={sess.n} className="p-5">
              <p className="text-sm font-bold text-accent">{sess.n}회차 · {sess.goal}</p>
              {r ? (
                <>
                  <p className="mt-1.5 text-[15px] leading-relaxed">{r.menteeSummary}</p>
                  <p className="mt-2 text-sm"><b className="text-navy">결과물 </b>{r.output}</p>
                  <p className="mt-0.5 text-sm"><b className="text-navy">과제 </b>{r.nextHomework}</p>
                </>
              ) : (
                <p className="mt-1 text-sm text-sub">예정 · 가져갈 결과물: {sess.output}</p>
              )}
            </li>
          );
        })}
      </ol>

      {b.status === "done" && (
        <div className="border-t border-line p-5">
          {review ? (
            <p className="text-sm"><b>내 후기 </b>{"★".repeat(review.rating)} {review.body}</p>
          ) : (
            <div>
              <p className="font-bold">과정이 끝났습니다. 후기를 남겨 주세요</p>
              <div className="mt-2 flex gap-1" role="radiogroup" aria-label="별점">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n}점`} onClick={() => setRating(n)} className={`text-2xl ${n <= rating ? "text-accent" : "text-line"}`}>★</button>
                ))}
              </div>
              <textarea className="input mt-2" rows={2} value={body} onChange={(e) => setBody(e.target.value)} placeholder="어떤 점이 도움이 됐나요?" aria-label="후기 내용" />
              <button type="button" className="btn-primary mt-2" disabled={!body.trim()} onClick={() => demo.addReview(b.id, c.id, rating, body.trim())}>후기 남기기</button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
