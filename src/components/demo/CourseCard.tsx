"use client";

import Link from "next/link";
import { getField } from "@/lib/fields";
import { formatWon } from "@/lib/prompts/pricing";
import { courseRating, mentorBadges, mentorOf, personName } from "@/lib/demo/selectors";
import type { DemoCourse, DemoState } from "@/lib/demo/types";

// 분야별 공략집·추천 결과에서 쓰는 과정 카드
export function CourseCard({ s, c, showField = false }: { s: DemoState; c: DemoCourse; showField?: boolean }) {
  const rating = courseRating(s, c.id);
  const badges = mentorBadges(s, c.mentorId);
  return (
    <Link href={`/courses/${c.id}`} className="card group flex flex-col p-5 transition hover:border-navy">
      {showField && <span className="text-[13px] font-bold text-sub">{getField(c.field)?.name}</span>}
      {c.headlines[0] && <p className="text-sm font-bold text-accent">{c.headlines[0]}</p>}
      <h3 className="mt-1 text-lg font-bold leading-snug group-hover:text-navy">{c.title}</h3>
      <p className="mt-1.5 text-[15px] leading-relaxed text-sub">{c.oneLiner}</p>
      <div className="mt-4 flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white">
          {personName(s, c.mentorId).slice(-1)}
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold">{personName(s, c.mentorId)}</p>
          <p className="truncate text-[13px] text-sub">{mentorOf(s, c.mentorId)?.headline}</p>
        </div>
      </div>
      {!!badges.length && (
        <div className="mt-2 flex flex-wrap gap-1">
          {badges.map((b) => (
            <span key={b} className="rounded border border-accent/40 bg-accent-soft px-1.5 py-0.5 text-[12px] font-bold text-accent">{b}</span>
          ))}
        </div>
      )}
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <p className="text-sm text-sub">
          {c.sessionCount}회차 · {c.minutes}분
          {rating.avg !== null && <> · <b className="text-ink">★ {rating.avg.toFixed(1)}</b> ({rating.count})</>}
        </p>
        <p className="text-lg font-extrabold">{c.price ? formatWon(c.price) : "가격 협의"}</p>
      </div>
    </Link>
  );
}
