"use client";

import { useState } from "react";
import Link from "next/link";
import { getField } from "@/lib/fields";
import { demo, useDemo } from "@/lib/demo/store";
import { courseRating, mentorOf, personName, publishedCourses } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import type { DemoCourse, DemoNeedRequest, DemoState } from "@/lib/demo/types";
import { buildMatchReasonPrompt } from "@/lib/prompts/matchReason";
import { NEED_QUESTIONS } from "@/lib/prompts/needSummary";
import { PromptPanel } from "@/components/prompt/PromptPanel";

type Pick = { courseId: string; reasons: [string, string, string]; caution: string };

/** 1차 후보: 같은 분야 + 게시 과정, 최대 20개 (나중에 임베딩 검색으로 바꿀 자리) */
export function candidateCourses(s: DemoState, r: DemoNeedRequest): DemoCourse[] {
  return publishedCourses(s, r.field).slice(0, 20);
}

// 매칭 검수 (운영자 수동 매칭, CLAUDE.md 9장 ④ MVP)
export function DemoAdminMatching() {
  const s = useDemo();
  const waiting = s.needRequests.filter((r) => r.status === "waiting");
  const done = s.needRequests.filter((r) => r.status === "matched");
  const [selected, setSelected] = useState<string | null>(null);
  const [justPublished, setJustPublished] = useState<string | null>(null);
  const req = waiting.find((r) => r.id === selected) ?? waiting[0];
  const publishedReq = s.needRequests.find((r) => r.id === justPublished);

  return (
    <div>
      <h1 className="text-2xl font-extrabold">매칭 검수</h1>
      <p className="mt-1 text-sm text-sub">요청서와 같은 분야의 게시 과정을 나란히 보고 최대 3개를 고릅니다. 추천 이유는 운영자가 직접 쓰고, 필요하면 AI 초안 프롬프트를 씁니다.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {waiting.map((r) => (
          <button key={r.id} type="button" onClick={() => setSelected(r.id)}
            className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${req?.id === r.id ? "border-navy bg-navy text-white" : "border-line bg-white"}`}>
            {personName(s, r.menteeId)} · {getField(r.field)?.short}
          </button>
        ))}
        {!waiting.length && <p className="text-sm text-sub">매칭을 기다리는 요청서가 없습니다. 멘티로 바꿔 공략 찾기에서 요청서를 써 보세요.</p>}
      </div>

      {publishedReq && (
        <div role="status" className="mt-6 rounded-lg border border-accent/30 bg-accent-soft p-4">
          <p className="font-bold">{personName(s, publishedReq.menteeId)}님에게 추천을 공개했습니다</p>
          <p className="mt-1 text-sm">멘티의 공략 찾기 화면에 추천 과정과 이유가 표시됩니다.</p>
          {publishedReq.menteeId === "me-mentee" && (
            <div className="mt-3 flex gap-2">
              <button type="button" className="btn-outline" onClick={() => demo.setRole("mentee")}>멘티로 바꿔 보기</button>
              <Link href="/find" className="btn-primary">공략 찾기 열기</Link>
            </div>
          )}
        </div>
      )}

      {req && <MatchWorkbench key={req.id} s={s} r={req} onPublished={() => { setJustPublished(req.id); setSelected(null); }} />}

      <h2 className="mt-10 text-lg font-bold">추천을 공개한 요청서</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
        {done.map((r) => (
          <li key={r.id} className="px-4 py-3 text-sm">
            <p className="font-semibold">{personName(s, r.menteeId)} · {getField(r.field)?.name} · {fmtDate(r.createdAt)}</p>
            <p className="text-sub">추천: {s.matches.filter((m) => m.requestId === r.id).map((m) => s.courses.find((c) => c.id === m.courseId)?.title).join(" / ")}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MatchWorkbench({ s, r, onPublished }: { s: DemoState; r: DemoNeedRequest; onPublished: () => void }) {
  const candidates = candidateCourses(s, r);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);

  function toggle(courseId: string) {
    setPicks((p) =>
      p.some((x) => x.courseId === courseId)
        ? p.filter((x) => x.courseId !== courseId)
        : p.length >= 3
          ? p
          : [...p, { courseId, reasons: ["", "", ""], caution: "" }],
    );
  }
  const setReason = (courseId: string, i: number, v: string) =>
    setPicks((p) => p.map((x) => (x.courseId === courseId ? { ...x, reasons: x.reasons.map((r, j) => (j === i ? v : r)) as Pick["reasons"] } : x)));
  const setCaution = (courseId: string, v: string) => setPicks((p) => p.map((x) => (x.courseId === courseId ? { ...x, caution: v } : x)));

  function fillExample() {
    setPicks((p) =>
      p.map((x) => {
        const c = s.courses.find((cc) => cc.id === x.courseId)!;
        return {
          ...x,
          reasons: [
            `"${r.answers.blocker}"라는 고민과 과정 대상(${c.target.slice(0, 30)}…)이 맞닿아 있습니다.`,
            `원하시는 결과물과 마지막 회차 결과물(${c.sessions.at(-1)?.output ?? ""})이 가깝습니다.`,
            `${mentorOf(s, c.mentorId)?.headline ?? "멘토"}의 경험으로 같은 길을 먼저 가 본 조언을 받을 수 있습니다.`,
          ],
          caution: `일정(${r.answers.timeline})에 맞춰 첫 회차를 빨리 잡는 것이 좋습니다.`,
        };
      }),
    );
  }

  const ready = picks.length > 0 && picks.every((p) => p.reasons.every((x) => x.trim()));
  const reqForPrompt = Object.fromEntries(NEED_QUESTIONS.map((q) => [q.label, r.answers[q.key]]));

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* 요청서 */}
      <section className="card h-fit p-5 lg:sticky lg:top-32">
        <p className="text-sm font-bold text-accent">공략 요청서</p>
        <p className="mt-1 font-bold">{personName(s, r.menteeId)} · {getField(r.field)?.name}</p>
        <dl className="mt-3 space-y-2 text-sm">
          {NEED_QUESTIONS.map((q) => (
            <div key={q.key}>
              <dt className="font-bold text-sub">{q.label}</dt>
              <dd>{r.answers[q.key]}</dd>
            </div>
          ))}
          {r.aiSummary && (
            <div><dt className="font-bold text-sub">AI 정리 결과</dt><dd className="whitespace-pre-line">{r.aiSummary}</dd></div>
          )}
        </dl>
        <p className="mt-3 text-[12px] text-sub">멘티 고민은 본인과 운영자만 봅니다. 매칭 외 목적으로 쓰지 않습니다.</p>
      </section>

      {/* 후보 과정 */}
      <section>
        <p className="font-bold">후보 과정 {candidates.length}개 <span className="font-normal text-sub">· 같은 분야 게시 과정, 최대 3개 선택</span></p>
        {!candidates.length && <p className="mt-3 rounded-lg border border-dashed border-line p-4 text-sm">이 분야 게시 과정이 없습니다. 멘티에게는 &ldquo;이 분야 멘토를 준비 중입니다 + 대기자 등록&rdquo;이 안내됩니다.</p>}
        <ul className="mt-3 space-y-3">
          {candidates.map((c) => {
            const picked = picks.find((p) => p.courseId === c.id);
            const rating = courseRating(s, c.id);
            return (
              <li key={c.id} className={`card p-4 ${picked ? "border-accent" : ""}`}>
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="mt-1 size-4 accent-accent" checked={!!picked} onChange={() => toggle(c.id)} disabled={!picked && picks.length >= 3} />
                  <span className="min-w-0">
                    <span className="block font-bold">{c.title}</span>
                    <span className="block text-sm text-sub">{personName(s, c.mentorId)} · {mentorOf(s, c.mentorId)?.headline}{rating.avg !== null && ` · ★ ${rating.avg.toFixed(1)}`}</span>
                    <span className="mt-1 block text-sm">대상: {c.target}</span>
                    <span className="block text-sm">최종 결과물: {c.sessions.at(-1)?.output}</span>
                  </span>
                </label>
                {picked && (
                  <div className="mt-3 space-y-2 border-t border-line pt-3">
                    {[0, 1, 2].map((i) => (
                      <input key={i} className="input" aria-label={`추천 이유 ${i + 1}`} placeholder={`추천 이유 ${i + 1}`} value={picked.reasons[i]} onChange={(e) => setReason(c.id, i, e.target.value)} />
                    ))}
                    <input className="input" aria-label="주의할 점" placeholder="주의할 점 (선택)" value={picked.caution} onChange={(e) => setCaution(c.id, e.target.value)} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {picks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-outline" onClick={() => setPrompt(buildMatchReasonPrompt(reqForPrompt, picks.map((p) => {
              const c = s.courses.find((x) => x.id === p.courseId)!;
              return { title: c.title, target: c.target, finalOutput: c.sessions.at(-1)?.output ?? "", sessionGoals: c.sessions.map((x) => x.goal), mentorHeadline: mentorOf(s, c.mentorId)?.headline ?? "", avgRating: courseRating(s, c.id).avg };
            })))}>추천 이유 초안 프롬프트 만들기</button>
            <button type="button" className="text-sm font-semibold text-navy underline underline-offset-2" onClick={fillExample}>시연: 예시 문구 채우기</button>
          </div>
        )}
        {prompt && <div className="mt-4"><PromptPanel prompt={prompt} checklist={["요청서에 없는 내용을 지어내지 않았나요?", "보장 표현이 없나요?", "멘티 이름·연락처가 빠져 있나요?"]} /></div>}

        <div className="mt-6 rounded-lg bg-panel p-4">
          <p className="text-sm">멘티 화면에는 &ldquo;추천은 참고용이며 최종 선택은 멘티가 합니다&rdquo; 문구가 항상 함께 표시됩니다.</p>
          <button type="button" className="btn-primary mt-3" disabled={!ready} onClick={() => { demo.publishMatches(r.id, picks.map((p) => ({ courseId: p.courseId, reasons: [...p.reasons], caution: p.caution }))); onPublished(); }}>
            추천 공개하기
          </button>
          {!ready && picks.length > 0 && <p className="mt-1 text-[12px] text-sub">고른 과정마다 추천 이유 3줄을 채워 주세요.</p>}
        </div>
      </section>
    </div>
  );
}
