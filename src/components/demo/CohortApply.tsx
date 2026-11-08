"use client";

import Link from "next/link";
import { demo, useDemo } from "@/lib/demo/store";
import { fmtDate } from "@/lib/demo/format";
import { formatWon } from "@/lib/prompts/pricing";
import { ME } from "@/lib/demo/seed";

const STATUS = { draft: "준비 중", open: "모집 중", running: "진행 중", closed: "종료" } as const;
const ENROLL = { applied: "신청 완료 · 운영자 승인 대기", accepted: "참여 중", completed: "수료", dropped: "중단" } as const;

// 아카데미 기수 목록과 신청 (예비 멘토)
export function CohortApply() {
  const s = useDemo();
  const me = ME.candidate;
  const cohorts = s.cohorts.filter((c) => c.status !== "draft");

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {cohorts.map((c) => {
        const mine = s.enrollments.find((e) => e.cohortId === c.id && e.userId === me);
        return (
          <div key={c.id} className="card flex flex-col p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="font-bold">{c.name}</p>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] font-bold ${c.status === "open" ? "bg-accent text-white" : "bg-panel text-sub"}`}>{STATUS[c.status]}</span>
            </div>
            <p className="mt-1 text-sm text-sub">
              {c.kind === "workshop" ? "진입 워크숍 2시간" : "출시 캠프 4주"} · {fmtDate(c.startsOn)}{c.endsOn !== c.startsOn && ` ~ ${fmtDate(c.endsOn)}`} · 수강료 {c.price ? formatWon(c.price) : "0원"}
            </p>
            <div className="mt-auto pt-4">
              {mine ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-navy">{ENROLL[mine.status]}</span>
                  {mine.status === "accepted" && <Link href="/academy/camp" className="font-semibold text-accent underline">캠프 열기</Link>}
                </div>
              ) : c.status === "open" ? (
                s.role === "candidate" ? (
                  <button type="button" className="btn-primary min-h-10" onClick={() => demo.applyCohort(c.id, me)}>기수 신청하기</button>
                ) : (
                  <button type="button" className="btn-outline min-h-10 text-sm" onClick={() => demo.setRole("candidate")}>예비 멘토로 보고 신청하기</button>
                )
              ) : (
                <span className="text-sm text-sub">신청 기간이 아닙니다</span>
              )}
            </div>
          </div>
        );
      })}
      <p className="text-[13px] text-sub md:col-span-2">기수 가격 정책: 1기 0원 · 2기 9.9만 원 · 3기부터 19.9만 원 (결제는 사업자등록 후 연결 예정)</p>
    </div>
  );
}
