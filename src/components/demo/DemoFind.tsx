"use client";

import { useState } from "react";
import Link from "next/link";
import { FIELDS, getField, type FieldSlug } from "@/lib/fields";
import { demo, meId, useDemo } from "@/lib/demo/store";
import { publishedCourses } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import type { NeedAnswers } from "@/lib/demo/types";
import { buildNeedSummaryPrompt, NEED_QUESTIONS, NEED_SUMMARY_CHECKLIST } from "@/lib/prompts/needSummary";
import { PromptPanel } from "@/components/prompt/PromptPanel";
import { WaitlistForm } from "@/components/WaitlistForm";
import { CourseCard } from "./CourseCard";

const EMPTY: NeedAnswers = { current: "", goal: "", blocker: "", output: "", timeline: "" };

// 공략 찾기: 5개 질문 요청서 → 운영자 매칭 → 추천 3개 (CLAUDE.md 9장 ③④)
export function DemoFind({ initialQuery }: { initialQuery: string }) {
  const s = useDemo();
  const me = meId(s.role);
  const [field, setField] = useState<FieldSlug>("tourism");
  const [answers, setAnswers] = useState<NeedAnswers>(EMPTY);
  const [free, setFree] = useState(initialQuery);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const myRequests = s.role === "mentee" && me ? s.needRequests.filter((r) => r.menteeId === me) : [];
  const fieldHasCourses = publishedCourses(s, field).length > 0;

  function save() {
    setError(null);
    if (s.role !== "mentee" || !me) {
      setError("요청서 저장은 로그인한 멘티만 할 수 있습니다. 위의 \"멘티로 보기\"를 눌러 주세요.");
      return;
    }
    const empty = NEED_QUESTIONS.filter((q) => !answers[q.key].trim());
    if (empty.length) {
      setError(`비어 있는 질문이 있습니다: ${empty.map((q) => q.label).join(", ")}`);
      return;
    }
    if (!consent) {
      setError("개인정보 수집·이용에 동의해 주세요.");
      return;
    }
    const id = demo.addNeedRequest(me, field, answers, aiSummary.trim() || undefined);
    setSavedId(id);
    setAnswers(EMPTY);
    setAiSummary("");
    setConsent(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="eyebrow">멘티의 문</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">공략 찾기</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-sub">
        다섯 가지 질문에 답해 공략 요청서를 만들면, 운영자가 읽고 맞는 공략 과정을 최대 3개까지 추천해 드립니다.
      </p>

      {s.role !== "mentee" && (
        <div className="mt-6 flex flex-col gap-2 rounded-lg border border-navy/20 bg-panel p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>요청서는 누구나 작성해 볼 수 있고, 저장과 추천 받기는 멘티 로그인 후에 됩니다.</p>
          <button type="button" className="btn-outline min-h-9 shrink-0 px-3 text-sm" onClick={() => demo.setRole("mentee")}>멘티로 보기</button>
        </div>
      )}

      {/* 내 요청서와 추천 결과 */}
      {myRequests.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">내 공략 요청서</h2>
          <div className="mt-4 space-y-6">
            {myRequests.map((r) => {
              const picks = s.matches.filter((m) => m.requestId === r.id);
              return (
                <article key={r.id} className={`card p-5 ${savedId === r.id ? "border-accent" : ""}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">{getField(r.field)?.name} · {fmtDate(r.createdAt)} 작성</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${r.status === "matched" ? "bg-accent text-white" : "bg-panel text-navy"}`}>
                      {r.status === "matched" ? "추천 도착" : "매칭 중"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-sub">목표: {r.answers.goal}</p>
                  {r.status === "waiting" ? (
                    <div className="mt-4 rounded-lg bg-panel p-4 text-sm">
                      <p className="font-semibold">운영자가 맞는 멘토를 찾고 있어요 (보통 24시간)</p>
                      <p className="mt-1 text-[13px] text-sub">
                        시연: 상단 역할을 &ldquo;운영자&rdquo;로 바꾸고 <Link href="/admin/matching" className="font-semibold text-navy underline">매칭 검수</Link>에서 추천을 공개해 보세요.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="rounded-lg bg-accent-soft px-3 py-2 text-[13px] font-semibold text-ink">추천은 참고용이며 최종 선택은 멘티가 합니다.</p>
                      <ol className="mt-4 space-y-4">
                        {picks.map((p, i) => {
                          const c = s.courses.find((x) => x.id === p.courseId);
                          if (!c) return null;
                          return (
                            <li key={p.id} className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                              <div className="rounded-lg border border-line p-4">
                                <p className="text-sm font-bold text-accent">추천 {i + 1}</p>
                                <ul className="mt-2 space-y-1.5 text-[15px]">
                                  {p.reasons.map((reason) => <li key={reason}>· {reason}</li>)}
                                </ul>
                                {p.caution && <p className="mt-3 text-sm text-sub"><b className="text-ink">주의할 점 </b>{p.caution}</p>}
                              </div>
                              <CourseCard s={s} c={c} />
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* 요청서 작성 */}
      <section className="mt-10">
        <h2 className="text-xl font-bold">새 공략 요청서 쓰기</h2>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div>
              <label htmlFor="f-field" className="label">분야</label>
              <select id="f-field" className="input" value={field} onChange={(e) => setField(e.target.value as FieldSlug)}>
                {FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.no} {f.name}</option>)}
              </select>
              {!fieldHasCourses && (
                <div className="mt-3 rounded-lg border border-dashed border-line p-4">
                  <p className="font-bold">이 분야 멘토를 준비 중입니다</p>
                  <p className="mt-1 text-sm text-sub">대기자로 등록하시면 과정이 열릴 때 알려 드립니다.</p>
                  <div className="mt-3"><WaitlistForm id="find-empty-waitlist" defaultField={field} /></div>
                </div>
              )}
            </div>
            {NEED_QUESTIONS.map((q, i) => (
              <div key={q.key}>
                <label htmlFor={`q-${q.key}`} className="label">{i + 1}. {q.label}</label>
                <textarea id={`q-${q.key}`} className="input" rows={2} placeholder={q.placeholder} value={answers[q.key]} onChange={(e) => setAnswers((a) => ({ ...a, [q.key]: e.target.value }))} />
              </div>
            ))}
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="mt-0.5 size-4 accent-accent" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>[필수] 매칭을 위해 요청서 내용을 수집·이용하는 데 동의합니다. 본인과 운영자만 봅니다. <Link href="/legal/privacy" target="_blank" className="font-semibold text-navy underline">전문 보기</Link></span>
            </label>
            {error && <p role="alert" className="text-sm text-danger">{error}</p>}
            {savedId && <p role="status" className="text-sm font-semibold text-ok">요청서를 저장했습니다. 위 &ldquo;내 공략 요청서&rdquo;에서 진행 상황을 볼 수 있습니다.</p>}
            <button type="button" className="btn-primary w-full" onClick={save}>공략 요청서 저장하기</button>
          </div>

          {/* 서술이 편한 사람을 위한 "내 AI로 정리하기" */}
          <div className="rounded-xl bg-panel p-4">
            <p className="font-bold">질문에 답하기 어렵다면</p>
            <p className="mt-1 text-sm text-sub">고민을 편하게 3~5문장으로 쓰고, 내 AI로 다섯 가지 질문 형식에 맞춰 정리해 보세요.</p>
            <label htmlFor="f-free" className="label mt-3">내 고민</label>
            <textarea id="f-free" className="input bg-white" rows={4} value={free} onChange={(e) => setFree(e.target.value)} placeholder="예: 관광통역안내사 필기는 붙었는데 면접을 어떻게 준비할지 막막해요…" />
            <button type="button" className="btn-navy mt-3 w-full" disabled={!free.trim()} onClick={() => setPrompt(buildNeedSummaryPrompt(free))}>
              내 AI로 정리하기
            </button>
            {prompt && (
              <div className="mt-4 rounded-lg bg-white p-3">
                <PromptPanel prompt={prompt} checklist={NEED_SUMMARY_CHECKLIST} />
                <label htmlFor="f-ai" className="label mt-4">정리 결과 붙여넣기 <span className="font-normal text-sub">(선택)</span></label>
                <textarea id="f-ai" className="input" rows={4} value={aiSummary} onChange={(e) => setAiSummary(e.target.value)} />
                <p className="hint">붙여넣은 정리 결과는 요청서와 함께 운영자에게 전달됩니다. 왼쪽 질문 칸에도 옮겨 적어 주세요.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
