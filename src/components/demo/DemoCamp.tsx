"use client";

import { useState } from "react";
import Link from "next/link";
import { CAMP_WEEKS } from "@/lib/academy";
import { demo, useDemo } from "@/lib/demo/store";
import { ME } from "@/lib/demo/seed";
import { fmtDate } from "@/lib/demo/format";
import { buildExperiencePrompt, EXPERIENCE_CHECKLIST } from "@/lib/prompts/experience";
import { PromptPanel } from "@/components/prompt/PromptPanel";
import { RoleHint } from "./RoleHint";

// 캠프 수강 화면 (예비 멘토): 0~4주차 진도, 과제 제출, 통과 기준
export function DemoCamp() {
  const s = useDemo();
  const enrollment = s.enrollments.find((e) => e.userId === ME.candidate && e.cohortId === "co-camp1");
  const cohort = s.cohorts.find((c) => c.id === "co-camp1");
  const [openWeek, setOpenWeek] = useState<number | null>(null);

  if (!enrollment || !cohort) return null;
  const current = CAMP_WEEKS.find((w) => !enrollment.passedWeeks.includes(w.week))?.week ?? 4;
  const shown = openWeek ?? current;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <RoleHint roles={["candidate"]} what="예비 멘토가 출시 캠프 과제를 내고 진도를 확인하는 곳입니다." />
      <p className="eyebrow">아카데미 · 내 캠프</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{cohort.name}</h1>
      <p className="mt-1 text-sm text-sub">{fmtDate(cohort.startsOn)} ~ {fmtDate(cohort.endsOn)} · 수료 조건: 과정 게시 + 파일럿 후기 3건</p>

      <div className="mt-5 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-panel ring-1 ring-line">
          <div className="h-full bg-accent" style={{ width: `${(enrollment.passedWeeks.length / 5) * 100}%` }} />
        </div>
        <span className="text-sm font-bold">{enrollment.status === "completed" ? "수료" : `${enrollment.passedWeeks.length}/5 주차 통과`}</span>
      </div>

      <ol className="mt-6 space-y-3">
        {CAMP_WEEKS.map((w) => {
          const passed = enrollment.passedWeeks.includes(w.week);
          const locked = !passed && w.week > current;
          const isOpen = shown === w.week;
          return (
            <li key={w.week} className={`card overflow-hidden ${w.week === current && !passed ? "border-accent" : ""}`}>
              <button type="button" onClick={() => setOpenWeek(isOpen ? -1 : w.week)} aria-expanded={isOpen} disabled={locked}
                className="flex w-full items-center justify-between gap-3 p-4 text-left disabled:opacity-60">
                <span>
                  <span className="block text-sm font-bold text-accent">{w.week}주차</span>
                  <span className="block font-bold">{w.title}</span>
                </span>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[13px] font-bold ${passed ? "bg-navy text-white" : locked ? "bg-panel text-sub" : "bg-accent-soft text-accent"}`}>
                  {passed ? "통과" : locked ? "잠김" : "진행 중"}
                </span>
              </button>
              {isOpen && !locked && <WeekBody week={w.week} enrollmentId={enrollment.id} passed={passed} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function WeekBody({ week, enrollmentId, passed }: { week: number; enrollmentId: string; passed: boolean }) {
  const s = useDemo();
  const w = CAMP_WEEKS[week];
  const submitted = s.assignments.find((a) => a.enrollmentId === enrollmentId && a.week === week);
  const [text, setText] = useState("");
  const [checks, setChecks] = useState<boolean[]>(w.pass.map(() => passed));
  const [experience, setExperience] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);

  return (
    <div className="border-t border-line p-4">
      <p className="text-[15px]">{w.goal}</p>

      <div className="mt-4 rounded-lg bg-panel p-3">
        <p className="text-sm font-bold text-navy">통과 기준</p>
        <ul className="mt-1.5 space-y-1">
          {w.pass.map((p, i) => (
            <li key={p}>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="size-4 accent-accent" checked={checks[i]} onChange={(e) => setChecks((c) => c.map((x, j) => (j === i ? e.target.checked : x)))} />
                {p}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {(week === 0 || week === 1) && (
        <div className="mt-4 rounded-lg border border-line p-3">
          <p className="font-bold">경험 진단 프롬프트</p>
          <p className="text-[13px] text-sub">경력·자격·성공과 실패 경험을 적으면, 팔 수 있는 경험 자산 3개를 찾는 프롬프트를 만들어 드립니다.</p>
          <textarea className="input mt-2" rows={3} value={experience} onChange={(e) => setExperience(e.target.value)} aria-label="내 경험" placeholder="예: MICE 기획사 PM 5년, 국제회의 운영, 신입 면접 참여…" />
          <button type="button" className="btn-navy mt-2" disabled={!experience.trim()} onClick={() => setPrompt(buildExperiencePrompt(experience))}>경험 진단 프롬프트 만들기</button>
          {prompt && <div className="mt-4"><PromptPanel prompt={prompt} checklist={EXPERIENCE_CHECKLIST} /></div>}
        </div>
      )}
      {week === 2 && (
        <Link href="/studio/designer" className="mt-4 flex items-center justify-between rounded-lg border border-line p-3 hover:border-navy">
          <span><b>AI 공략 설계기</b><span className="block text-[13px] text-sub">4회차 과정 설계서를 만들고 초안으로 저장합니다.</span></span>
          <span className="text-sm font-semibold text-navy">열기 →</span>
        </Link>
      )}
      {week === 4 && (
        <Link href="/studio/courses" className="mt-4 flex items-center justify-between rounded-lg border border-line p-3 hover:border-navy">
          <span><b>내 과정</b><span className="block text-[13px] text-sub">과정을 다듬고 게시를 요청합니다.</span></span>
          <span className="text-sm font-semibold text-navy">열기 →</span>
        </Link>
      )}

      <div className="mt-4">
        <p className="font-bold">과제 제출</p>
        {submitted && (
          <div className="mt-2 rounded-lg border border-line p-3 text-sm">
            <p className="text-[13px] text-sub">{fmtDate(submitted.submittedAt)} 제출 · {submitted.reviewed ? "운영자 검토 완료" : "운영자 검토 대기"}</p>
            <p className="mt-1 whitespace-pre-line">{submitted.content}</p>
          </div>
        )}
        {!passed && (
          <>
            <textarea className="input mt-2" rows={3} value={text} onChange={(e) => setText(e.target.value)} aria-label={`${week}주차 과제`} placeholder="과제 내용을 적거나 링크를 붙여넣으세요 (파일 첨부는 DB 연동 후 제공)" />
            <button type="button" className="btn-primary mt-2" disabled={!text.trim()} onClick={() => { demo.submitAssignment(enrollmentId, week, text.trim()); setText(""); }}>
              {submitted ? "과제 다시 제출하기" : "과제 제출하기"}
            </button>
            <p className="mt-1 text-[12px] text-sub">시연: 운영자 → 기수 관리에서 이 과제를 검토하고 주차를 통과시킬 수 있습니다.</p>
          </>
        )}
      </div>
    </div>
  );
}
