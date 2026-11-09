"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FIELDS } from "@/lib/fields";
import { demo, useDemo, useHydrated } from "@/lib/demo/store";
import { APPLICANT_ID } from "@/lib/demo/seed";
import { fmtDate } from "@/lib/demo/format";
import { mentorGradeInfo, gradeLabel } from "@/lib/demo/selectors";
import type { DemoApplication } from "@/lib/demo/types";
import { DESIGNER_EXAMPLES } from "@/lib/designer/examples";
import { allPassed, checkDesignMarkdown, type DesignCheckItem } from "@/lib/designCheck";
import { gradeQuiz, MODULE_UNITS, type ModuleUnit } from "@/lib/mentorModule";
import { joinSteps, JOIN_STEP_LABELS, TRACKS, type JoinStep } from "@/lib/mentorTracks";
import { SESSION_COUNT_OPTIONS } from "@/lib/prompts/courseDesign";

// 멘토 지원 흐름 /mentor/join/[track] — A 셀프 등록 · B 경력 인증 공용 단계형 화면 (입력은 자동 저장)
export function JoinFlow({ track, initialStep }: { track: "A" | "B"; initialStep?: string }) {
  const s = useDemo();
  const hydrated = useHydrated();
  const app = s.applications.find((a) => a.userId === APPLICANT_ID && a.track === track);
  const steps = joinSteps(track);
  const [step, setStep] = useState<JoinStep>(steps.includes(initialStep as JoinStep) ? (initialStep as JoinStep) : "basic");

  // 처음 들어오면 작성 중 지원서를 만든다
  useEffect(() => {
    if (hydrated && !app) demo.ensureApplication(APPLICANT_ID, track);
  }, [hydrated, app, track]);

  if (!hydrated || !app) return <div className="min-h-[60vh]" aria-busy="true" />;

  const info = TRACKS.find((t) => t.track === track)!;
  const header = (
    <div>
      <Link href="/mentor/join" className="text-sm text-sub underline underline-offset-2">← 멘토로 활동하기</Link>
      <p className="eyebrow mt-3">입구 {track} · {info.name}</p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight md:text-3xl">멘토 지원서</h1>
      <p className="mt-1 text-sm text-sub">예시 지원자(나)로 작성합니다 · 결과 등급: {info.result}</p>
    </div>
  );

  if (app.status === "submitted" || app.status === "approved" || app.status === "rejected") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        {header}
        <StatusPanel app={app} />
      </div>
    );
  }

  const idx = steps.indexOf(step);
  const update = (patch: Partial<DemoApplication>) => demo.updateApplication(app.id, patch);
  const designChecks = checkDesignMarkdown(app.design.markdown, app.design.sessionCount, app.design.finalOutput);
  const done: Record<JoinStep, boolean> = {
    basic: app.identityChecked && !!app.basic.name.trim() && !!app.basic.field && !!app.basic.oneLiner.trim() && !!app.basic.career.trim(),
    evidence: app.evidence.items.some((e) => e.org.trim() && e.topic.trim()),
    module: [1, 2, 3].every((n) => app.modulePassed.includes(n)),
    design: !!app.design.markdown.trim() && allPassed(designChecks),
    interview: app.interviewSlots.length === 3,
    submit: false,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {header}

      {app.status === "revision" && (
        <div role="alert" className="mt-5 rounded-lg border border-accent/40 bg-accent-soft p-4 text-sm">
          <p className="font-bold text-danger">운영자 보완 요청 · {app.decidedAt ? fmtDate(app.decidedAt) : ""}</p>
          <p className="mt-1">{app.reason}</p>
          <p className="mt-1 text-[13px] text-sub">내용을 고친 뒤 마지막 단계에서 다시 제출해 주세요.</p>
        </div>
      )}

      {/* 진행률 */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold">{idx + 1}/{steps.length}단계 · {JOIN_STEP_LABELS[step]}</span>
          <span className="text-[13px] text-sub">입력 내용은 자동 저장됩니다</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-panel ring-1 ring-line">
          <div className="h-full bg-accent transition-all" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
        </div>
        <ol className="mt-3 flex flex-wrap gap-1.5">
          {steps.map((st, i) => (
            <li key={st}>
              <button type="button" onClick={() => setStep(st)} aria-current={st === step ? "step" : undefined}
                className={`rounded-full border px-2.5 py-1 text-[13px] font-semibold ${st === step ? "border-navy bg-navy text-white" : done[st] ? "border-accent/40 bg-accent-soft text-accent" : "border-line bg-white text-sub"}`}>
                {i + 1}. {JOIN_STEP_LABELS[st]}{done[st] && st !== step ? " · 완료" : ""}
              </button>
            </li>
          ))}
        </ol>
      </div>

      <div className="card mt-6 p-5 md:p-6">
        {step === "basic" && <BasicStep app={app} update={update} />}
        {step === "evidence" && <EvidenceStep app={app} update={update} />}
        {step === "module" && <ModuleStep app={app} update={update} />}
        {step === "design" && <DesignStep app={app} update={update} track={track} checks={designChecks} />}
        {step === "interview" && <InterviewStep app={app} update={update} />}
        {step === "submit" && <SubmitStep app={app} steps={steps} done={done} checks={designChecks} goTo={setStep} />}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button type="button" className="btn-outline" disabled={idx === 0} onClick={() => setStep(steps[idx - 1])}>이전 단계</button>
        <span className="text-[13px] text-sub">{done[step] || step === "submit" ? "" : "이 단계를 마치면 다음으로 넘어가세요"}</span>
        {idx < steps.length - 1 && (
          <button type="button" className="btn-primary" onClick={() => setStep(steps[idx + 1])}>다음 단계</button>
        )}
      </div>
    </div>
  );
}

type StepProps = { app: DemoApplication; update: (patch: Partial<DemoApplication>) => void };

function BasicStep({ app, update }: StepProps) {
  const b = app.basic;
  const setB = (patch: Partial<DemoApplication["basic"]>) => update({ basic: { ...b, ...patch } });
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">기본 정보</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="j-name" className="label">이름</label>
          <input id="j-name" className="input" value={b.name} onChange={(e) => setB({ name: e.target.value })} />
        </div>
        <div>
          <label htmlFor="j-field" className="label">분야</label>
          <select id="j-field" className="input" value={b.field} onChange={(e) => setB({ field: e.target.value as DemoApplication["basic"]["field"] })}>
            <option value="">분야를 골라 주세요</option>
            {FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="j-one" className="label">한 줄 소개</label>
        <input id="j-one" className="input" maxLength={60} value={b.oneLiner} onChange={(e) => setB({ oneLiner: e.target.value })} placeholder="예: 서류에서 떨어지는 취업 준비생의 이력서를 고칩니다" />
      </div>
      <div>
        <label htmlFor="j-career" className="label">경력 요약</label>
        <textarea id="j-career" className="input" rows={3} value={b.career} onChange={(e) => setB({ career: e.target.value })} placeholder="예: 중견기업 인사팀 8년, 신입·경력 채용 담당" />
      </div>
      <label className="flex items-start gap-2 rounded-lg bg-panel p-3 text-sm">
        <input type="checkbox" className="mt-0.5 size-4 accent-accent" checked={app.identityChecked} onChange={(e) => update({ identityChecked: e.target.checked })} />
        <span>[필수] 본인 확인: 이름과 연락처가 본인 것임을 확인합니다. <span className="text-sub">(정식 서비스에서는 휴대폰 본인인증으로 바뀝니다)</span></span>
      </label>
      <button type="button" className="text-sm font-semibold text-navy underline underline-offset-2"
        onClick={() => update({ identityChecked: true, basic: { name: b.name || "예시 지원자(나)", field: "tourism", oneLiner: "관광통역안내사 수험생의 첫 면접을 돕습니다.", career: "관광통역안내사 6년, 면접 스터디 3년 운영" } })}>
        시연: 예시로 채우기
      </button>
    </div>
  );
}

function EvidenceStep({ app, update }: StepProps) {
  const ev = app.evidence;
  const setEv = (patch: Partial<DemoApplication["evidence"]>) => update({ evidence: { ...ev, ...patch } });
  const setItem = (i: number, key: keyof DemoApplication["evidence"]["items"][number], v: string) =>
    setEv({ items: ev.items.map((it, j) => (j === i ? { ...it, [key]: v } : it)) });
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">경력 증빙</h2>
      <p className="text-sm text-sub">강의·코칭 이력을 최대 5건 적어 주세요. 운영자가 인터뷰 전에 확인합니다.</p>
      <div className="space-y-3">
        {ev.items.map((it, i) => (
          <fieldset key={i} className="rounded-lg border border-line p-3">
            <legend className="px-1 text-sm font-bold text-accent">이력 {i + 1}</legend>
            <div className="grid gap-2 sm:grid-cols-[1.2fr_1.4fr_80px_80px]">
              <input className="input" aria-label={`이력 ${i + 1} 기관`} placeholder="기관" value={it.org} onChange={(e) => setItem(i, "org", e.target.value)} />
              <input className="input" aria-label={`이력 ${i + 1} 주제`} placeholder="주제" value={it.topic} onChange={(e) => setItem(i, "topic", e.target.value)} />
              <input className="input" aria-label={`이력 ${i + 1} 연도`} placeholder="연도" inputMode="numeric" value={it.year} onChange={(e) => setItem(i, "year", e.target.value)} />
              <input className="input" aria-label={`이력 ${i + 1} 인원`} placeholder="인원" inputMode="numeric" value={it.people} onChange={(e) => setItem(i, "people", e.target.value)} />
            </div>
            {ev.items.length > 1 && (
              <button type="button" className="mt-2 text-[13px] text-sub underline" onClick={() => setEv({ items: ev.items.filter((_, j) => j !== i) })}>이 이력 지우기</button>
            )}
          </fieldset>
        ))}
      </div>
      {ev.items.length < 5 && (
        <button type="button" className="btn-outline min-h-9 px-3 text-sm" onClick={() => setEv({ items: [...ev.items, { org: "", topic: "", year: "", people: "" }] })}>이력 추가하기</button>
      )}
      <div>
        <label htmlFor="j-certs" className="label">보유 자격</label>
        <input id="j-certs" className="input" value={ev.certs} onChange={(e) => setEv({ certs: e.target.value })} placeholder="예: 직업상담사 2급" />
      </div>
      <div>
        <label htmlFor="j-reviews" className="label">기존 후기 링크·캡처</label>
        <input id="j-reviews" className="input" value={ev.reviewLinks} onChange={(e) => setEv({ reviewLinks: e.target.value })} placeholder="후기 링크" />
        <div className="mt-2 rounded-lg border border-dashed border-line p-3 text-center text-[13px] text-sub">캡처 파일 첨부 자리 · DB 연동 후 제공</div>
      </div>
      <div>
        <label htmlFor="j-url" className="label">대표 강의 URL</label>
        <input id="j-url" className="input" inputMode="url" value={ev.lectureUrl} onChange={(e) => setEv({ lectureUrl: e.target.value })} placeholder="https://" />
      </div>
      <button type="button" className="text-sm font-semibold text-navy underline underline-offset-2"
        onClick={() => setEv({ items: [{ org: "예시 관광교육원", topic: "관광통역안내사 면접 특강", year: "2025", people: "80" }, { org: "예시 스터디 모임", topic: "면접 스터디 코칭", year: "2024", people: "30" }], certs: "관광통역안내사(영어)", reviewLinks: "https://example.com/reviews", lectureUrl: "https://example.com/lecture" })}>
        시연: 예시로 채우기
      </button>
    </div>
  );
}

function ModuleStep({ app, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold">필수 모듈</h2>
        <p className="text-sm text-sub">3개 단원을 읽고 단원별 확인 퀴즈 3문항을 모두 맞히면 통과입니다. 틀려도 다시 풀 수 있습니다.</p>
      </div>
      {MODULE_UNITS.map((u) => (
        <UnitBlock key={u.no} unit={u} passed={app.modulePassed.includes(u.no)}
          onPass={() => update({ modulePassed: Array.from(new Set([...app.modulePassed, u.no])).sort() })} />
      ))}
    </div>
  );
}

function UnitBlock({ unit, passed, onPass }: { unit: ModuleUnit; passed: boolean; onPass: () => void }) {
  const [answers, setAnswers] = useState<(number | null)[]>(unit.quiz.map(() => null));
  const [result, setResult] = useState<string | null>(null);
  function grade() {
    const r = gradeQuiz(unit, answers);
    if (r.passed) {
      onPass();
      setResult(null);
    } else setResult(`${r.wrong.length}문항을 다시 확인해 주세요 (${r.wrong.map((w) => w + 1).join(", ")}번).`);
  }
  return (
    <section className={`rounded-xl border p-4 ${passed ? "border-accent/40 bg-accent-soft/40" : "border-line"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">단원 {unit.no}. {unit.title}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-[13px] font-bold ${passed ? "bg-navy text-white" : "bg-panel text-sub"}`}>{passed ? "통과" : "미통과"}</span>
      </div>
      <div className="mt-3 flex h-24 items-center justify-center rounded-lg bg-panel text-sm text-sub">영상 준비 중</div>
      <ul className="mt-3 space-y-1.5 text-[15px]">
        {unit.points.map((p) => <li key={p}>· {p}</li>)}
      </ul>
      {!passed && (
        <div className="mt-4 space-y-3">
          {unit.quiz.map((q, qi) => (
            <fieldset key={qi}>
              <legend className="text-sm font-bold">{qi + 1}. {q.q}</legend>
              <div className="mt-1.5 grid gap-1.5 sm:grid-cols-2">
                {q.options.map((o, oi) => (
                  <label key={oi} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
                    <input type="radio" name={`u${unit.no}-q${qi}`} className="accent-accent" checked={answers[qi] === oi} onChange={() => setAnswers((a) => a.map((x, j) => (j === qi ? oi : x)))} />
                    {o}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-navy" disabled={answers.some((a) => a === null)} onClick={grade}>채점하기</button>
            <button type="button" className="text-sm font-semibold text-navy underline underline-offset-2" onClick={() => setAnswers(unit.quiz.map((q) => q.answer))}>시연: 정답 고르기</button>
          </div>
          {result && <p role="alert" className="text-sm text-danger">{result}</p>}
        </div>
      )}
    </section>
  );
}

function CheckList({ checks }: { checks: DesignCheckItem[] }) {
  return (
    <ul className="space-y-2">
      {checks.map((c) => (
        <li key={c.key} className={`rounded-lg p-3 text-sm ${c.ok ? "bg-panel" : "bg-accent-soft"}`}>
          <p className="font-semibold"><span className={c.ok ? "text-ok" : "text-danger"}>{c.ok ? "통과" : "수정 필요"}</span> · {c.label}</p>
          <p className="mt-0.5 text-[13px] text-sub">{c.detail}</p>
        </li>
      ))}
    </ul>
  );
}

function DesignStep({ app, update, track, checks }: StepProps & { track: "A" | "B"; checks: DesignCheckItem[] }) {
  const d = app.design;
  const setD = (patch: Partial<DemoApplication["design"]>) => update({ design: { ...d, ...patch } });
  const ex = DESIGNER_EXAMPLES[0];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">설계서 제출</h2>
      <p className="text-sm text-sub">AI 공략 설계기로 설계서를 만든 뒤 &ldquo;지원서에 연결하기&rdquo;를 누르거나, AI 답을 아래에 그대로 붙여넣으세요. 제출 전에 기준을 자동으로 검사합니다.</p>
      <div className="flex flex-wrap gap-2">
        <Link href={`/studio/designer?join=${track}`} className="btn-navy">공략 설계기에서 작성하기</Link>
        <button type="button" className="btn-outline" onClick={() => setD({ markdown: ex.sampleMarkdown, finalOutput: ex.input.finalOutput, sessionCount: ex.input.sessionCount })}>시연: 결과 예시 붙여넣기</button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <div>
          <label htmlFor="j-n" className="label">회차 수</label>
          <select id="j-n" className="input" value={d.sessionCount} onChange={(e) => setD({ sessionCount: Number(e.target.value) })}>
            {SESSION_COUNT_OPTIONS.map((n) => <option key={n} value={n}>{n}회차</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="j-final" className="label">최종 결과물</label>
          <input id="j-final" className="input" value={d.finalOutput} onChange={(e) => setD({ finalOutput: e.target.value })} placeholder="마지막 회차에 멘티가 손에 쥐는 것" />
        </div>
      </div>
      <div>
        <label htmlFor="j-md" className="label">설계서 (AI 답 붙여넣기)</label>
        <textarea id="j-md" className="input min-h-48 font-mono text-[13px]" value={d.markdown} onChange={(e) => setD({ markdown: e.target.value })} placeholder={"### 1. 과정명\n..."} />
      </div>
      {d.markdown.trim() ? (
        <div>
          <p className="mb-2 font-bold">자동 기준 검사</p>
          <CheckList checks={checks} />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-line p-4 text-center text-sm text-sub">설계서를 붙여넣으면 기준 검사 결과가 여기에 표시됩니다.</p>
      )}
    </div>
  );
}

function slotOptions(): string[] {
  const out: string[] = [];
  const d = new Date();
  while (out.length < 9) {
    d.setDate(d.getDate() + 1);
    const day = d.getDay();
    if (day === 0 || day === 6) continue;
    const label = d.toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "short" });
    for (const t of ["10:00", "14:00", "19:00"]) out.push(`${label} ${t}`);
  }
  return out;
}

function InterviewStep({ app, update }: StepProps) {
  const [options] = useState(slotOptions);
  const picked = app.interviewSlots;
  const toggle = (o: string) =>
    update({ interviewSlots: picked.includes(o) ? picked.filter((x) => x !== o) : picked.length >= 3 ? picked : [...picked, o] });
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">20분 화상 인터뷰 희망 일정</h2>
      <p className="text-sm text-sub">가능한 시간 3개를 골라 주세요. 운영자가 그중 하나로 확정해 연락드립니다. ({picked.length}/3 선택)</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o) => (
          <label key={o} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent-soft">
            <input type="checkbox" className="size-4 accent-accent" checked={picked.includes(o)} disabled={!picked.includes(o) && picked.length >= 3} onChange={() => toggle(o)} />
            {o}
          </label>
        ))}
      </div>
    </div>
  );
}

function SubmitStep({ app, steps, done, checks, goTo }: { app: DemoApplication; steps: JoinStep[]; done: Record<JoinStep, boolean>; checks: DesignCheckItem[]; goTo: (s: JoinStep) => void }) {
  const need = steps.filter((st) => st !== "submit" && !done[st]);
  const designFail = !!app.design.markdown.trim() && !allPassed(checks);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">확인·제출</h2>
      <ul className="divide-y divide-line rounded-lg border border-line">
        {steps.filter((st) => st !== "submit").map((st) => (
          <li key={st} className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
            <span>{JOIN_STEP_LABELS[st]}</span>
            {done[st] ? <span className="font-semibold text-ok">완료</span> : <button type="button" className="font-semibold text-danger underline" onClick={() => goTo(st)}>{st === "design" && designFail ? "수정 필요" : "미완료"} · 이동</button>}
          </li>
        ))}
      </ul>
      {designFail && (
        <div role="alert" className="rounded-lg border border-accent/40 bg-accent-soft p-3">
          <p className="font-bold text-danger">설계서를 수정해야 제출할 수 있습니다</p>
          <div className="mt-2"><CheckList checks={checks.filter((c) => !c.ok)} /></div>
        </div>
      )}
      <p className="text-[13px] text-sub">제출하면 운영자가 보통 3일 이내에 심사합니다. 승인 후 첫 3건 판매 동안은 수습 기간으로 운영자가 함께 살펴봅니다.</p>
      <button type="button" className="btn-primary w-full sm:w-auto" disabled={need.length > 0} onClick={() => demo.submitApplication(app.id)}>
        {app.status === "revision" ? "보완해서 다시 제출하기" : "지원서 제출하기"}
      </button>
      {need.length > 0 && <p className="text-[13px] text-sub">남은 단계: {need.map((n) => JOIN_STEP_LABELS[n]).join(", ")}</p>}
    </div>
  );
}

function StatusPanel({ app }: { app: DemoApplication }) {
  const s = useDemo();
  const g = mentorGradeInfo(s, app.userId);
  if (app.status === "submitted") {
    return (
      <div className="mt-6 rounded-xl border border-line p-6 text-center">
        <p className="text-sm font-bold text-accent">심사 중</p>
        <p className="mt-1 text-xl font-bold">지원서를 받았습니다 (보통 3일 이내)</p>
        <p className="mt-2 text-sm text-sub">{app.submittedAt ? `${fmtDate(app.submittedAt)} 제출` : ""} · 결과는 멘토 스튜디오와 이메일로 알려 드립니다.</p>
        {app.track === "B" && <p className="mt-2 text-sm">인터뷰 희망 일정: {app.interviewSlots.join(" / ")}</p>}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/studio" className="btn-outline">스튜디오에서 상태 보기</Link>
          <button type="button" className="btn-navy" onClick={() => demo.setRole("admin")}>시연: 운영자로 바꾸기</button>
          <Link href="/admin/applications" className="btn-primary">멘토 지원 심사 열기</Link>
        </div>
      </div>
    );
  }
  if (app.status === "approved") {
    return (
      <div className="mt-6 rounded-xl border border-accent/40 bg-accent-soft p-6 text-center">
        <p className="text-sm font-bold text-accent">승인</p>
        <p className="mt-1 text-xl font-bold">{gradeLabel(g.grade)}로 활동을 시작합니다</p>
        <p className="mt-2 text-sm">제출한 설계서로 과정 초안을 만들어 두었습니다. 다듬은 뒤 게시를 요청하세요. 첫 3건 판매 동안은 수습 기간입니다.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/studio" className="btn-primary">내 스튜디오 열기</Link>
          <Link href="/studio/courses" className="btn-outline">내 과정 보기</Link>
        </div>
      </div>
    );
  }
  return (
    <div className="mt-6 rounded-xl border border-line p-6">
      <p className="text-sm font-bold text-danger">반려</p>
      <p className="mt-1 text-lg font-bold">이번에는 함께하기 어렵습니다</p>
      <p className="mt-2 text-sm">사유: {app.reason}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn-outline" onClick={() => demo.updateApplication(app.id, { status: "draft" })}>내용을 고쳐 다시 작성하기</button>
        <Link href="/academy" className="btn-primary">출시 캠프 알아보기</Link>
      </div>
    </div>
  );
}
