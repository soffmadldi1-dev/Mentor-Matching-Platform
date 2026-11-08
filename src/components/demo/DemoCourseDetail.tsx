"use client";

import { useState } from "react";
import Link from "next/link";
import { getField, MODE_LABELS } from "@/lib/fields";
import { demo, meId, useDemo, useHydrated } from "@/lib/demo/store";
import { courseRating, mentorBadges, mentorOf, personName } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import { hasContactPattern } from "@/lib/prompts/common";
import { CourseDetailView } from "@/components/course/CourseDetailView";

export function DemoCourseDetail({ id }: { id: string }) {
  const s = useDemo();
  const c = s.courses.find((x) => x.id === id);
  const [open, setOpen] = useState(false);
  const [schedule, setSchedule] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  const hydrated = useHydrated();

  if (!c && !hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!c) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-lg font-bold">과정을 찾을 수 없습니다</p>
        <Link href="/#fields" className="btn-outline mt-4">분야별 공략집 보기</Link>
      </div>
    );
  }

  const mentor = mentorOf(s, c.mentorId);
  const rating = courseRating(s, c.id);
  const reviews = s.reviews.filter((r) => r.courseId === c.id);
  const me = meId(s.role);
  const contactWarn = hasContactPattern(message) || hasContactPattern(schedule);
  const preview = c.status !== "published";

  function submit() {
    if (!me || s.role !== "mentee" || contactWarn || !schedule.trim()) return;
    demo.addBooking(c!.id, me, schedule.trim(), message.trim());
    setDone(true);
  }

  const cta =
    preview ? (
      <span className="rounded-lg bg-panel px-3 py-2 text-sm font-semibold text-sub">게시 전 미리보기</span>
    ) : (
      <button type="button" className="btn-primary" onClick={() => setOpen(true)}>신청 접수하기</button>
    );

  return (
    <div className="mx-auto max-w-5xl px-0 py-0 md:px-4 md:py-10">
      {preview && (
        <p className="bg-accent-soft px-4 py-2 text-sm font-semibold text-accent md:rounded-lg">
          아직 게시되지 않은 과정의 미리보기입니다 (상태: {c.status === "review" ? "운영자 검토 대기" : "초안"})
        </p>
      )}
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="overflow-hidden md:rounded-2xl md:border md:border-line">
          <CourseDetailView
            cta={cta}
            c={{
              fieldName: getField(c.field)?.name ?? "",
              title: c.title || "제목 없는 과정",
              oneLiner: c.oneLiner,
              headline: c.headlines[0],
              target: c.target,
              before: c.before,
              after: c.after,
              sessions: c.sessions,
              prep: c.prep,
              notice: c.notice,
              price: c.price,
              sessionCount: c.sessionCount,
              minutes: c.minutes,
              modeLabel: MODE_LABELS[c.mode],
              mentorName: personName(s, c.mentorId),
              mentorHeadline: mentor?.headline,
              badges: mentorBadges(s, c.mentorId),
              isExample: true,
            }}
          />
        </div>

        <aside className="space-y-4 px-4 md:px-0">
          <div className="card p-5">
            <p className="text-[13px] font-bold text-sub">멘토 소개</p>
            <p className="mt-1 font-bold">{personName(s, c.mentorId)}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink">{mentor?.bio}</p>
          </div>
          <div className="card p-5">
            <p className="text-[13px] font-bold text-sub">
              후기 {rating.avg !== null && <span className="ml-1 text-ink">★ {rating.avg.toFixed(1)} ({rating.count})</span>}
            </p>
            {reviews.length ? (
              <ul className="mt-2 space-y-3">
                {reviews.map((r) => (
                  <li key={r.id} className="text-sm">
                    <p className="font-semibold">{"★".repeat(r.rating)}<span className="text-line">{"★".repeat(5 - r.rating)}</span> <span className="ml-1 font-normal text-sub">{r.authorLabel} · {fmtDate(r.createdAt)}</span></p>
                    <p className="mt-0.5 leading-relaxed">{r.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-sub">아직 후기가 없습니다.</p>
            )}
          </div>
        </aside>
      </div>

      {/* 신청 접수 시트 */}
      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="apply-title" className="fixed inset-0 z-40 flex items-end justify-center bg-ink/40 md:items-center" onClick={() => setOpen(false)}>
          <div className="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <p id="apply-title" className="text-lg font-bold">신청 접수하기</p>
            <p className="mt-1 text-sm text-sub">{c.title}</p>
            {done ? (
              <div className="mt-4 rounded-lg border border-accent/30 bg-accent-soft p-4">
                <p className="font-bold">신청이 접수되었습니다</p>
                <p className="mt-1 text-sm">멘토가 일정을 확인한 뒤 연락드립니다. 진행 상황은 내 공략 노트에서 볼 수 있습니다.</p>
                <p className="mt-2 text-[13px] text-sub">시연: 역할을 &ldquo;인증 멘토&rdquo;로 바꾸면 멘토의 신청 관리 화면에서 이 신청을 볼 수 있습니다{c.mentorId === "m-a" ? "" : " (예시 멘토 A의 과정일 때)"}.</p>
                <div className="mt-3 flex gap-2">
                  <Link href="/me/notes" className="btn-primary">내 공략 노트 보기</Link>
                  <button type="button" className="btn-outline" onClick={() => setOpen(false)}>닫기</button>
                </div>
              </div>
            ) : s.role !== "mentee" ? (
              <div className="mt-4 rounded-lg bg-panel p-4 text-sm">
                <p>신청은 로그인한 멘티만 할 수 있습니다.</p>
                <button type="button" className="btn-primary mt-3" onClick={() => demo.setRole("mentee")}>멘티로 보기</button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="ap-s" className="label">희망 일정</label>
                  <input id="ap-s" className="input" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="예: 평일 저녁 8시 이후, 다음 주부터" />
                </div>
                <div>
                  <label htmlFor="ap-m" className="label">멘토에게 남길 말 <span className="font-normal text-sub">(선택)</span></label>
                  <textarea id="ap-m" className="input" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="지금 상황과 기대하는 점을 적어 주세요" />
                </div>
                {contactWarn && (
                  <p role="alert" className="rounded-lg bg-accent-soft p-3 text-sm text-danger">
                    전화번호·이메일은 적지 말아 주세요. 연락은 플랫폼 안에서 이어집니다.
                  </p>
                )}
                <p className="text-[13px] text-sub">지금은 결제 없이 신청 접수만 받습니다. 멘토 확인 후 일정이 확정됩니다.</p>
                <div className="flex gap-2">
                  <button type="button" className="btn-primary" disabled={!schedule.trim() || contactWarn} onClick={submit}>신청 접수하기</button>
                  <button type="button" className="btn-outline" onClick={() => setOpen(false)}>닫기</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
