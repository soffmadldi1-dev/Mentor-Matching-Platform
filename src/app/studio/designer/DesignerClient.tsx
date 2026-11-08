"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FIELDS, MODE_LABELS, getField } from "@/lib/fields";
import {
  buildCourseDesignPrompt,
  courseDesignChecklist,
  MINUTES_OPTIONS,
  SESSION_COUNT_OPTIONS,
} from "@/lib/prompts/courseDesign";
import { formatRange, recommendedPriceRange } from "@/lib/prompts/pricing";
import { hasContactPattern } from "@/lib/prompts/common";
import { DESIGNER_EXAMPLES, getExample, type DesignerExample } from "@/lib/designer/examples";
import { parseDesignMarkdown } from "@/lib/designer/parseDesign";
import {
  EMPTY_DESIGNER_FORM,
  parseDesignerForm,
  type DesignerFormState,
} from "@/lib/validation/courseDesign";
import { PromptPanel } from "@/components/prompt/PromptPanel";
import { MarkdownView } from "@/components/MarkdownView";
import { CourseDetailView } from "@/components/course/CourseDetailView";
import { saveDesignDraft } from "./actions";

type SaveAccess = "guest" | "mentee" | "allowed" | "unconfigured";
type Tab = "prompt" | "example" | "detail";

const STORAGE_KEY = "meonjeo.designer.v1";

// 브라우저 저장소는 편의 기능이다. 막혀 있어도 화면은 그대로 동작한다.
function loadSaved(): { form: DesignerFormState; exampleId: string | null; pasted: string } | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function persist(value: unknown) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // 무시
  }
}

function exampleToForm(ex: DesignerExample): DesignerFormState {
  const i = ex.input;
  return {
    field: i.field,
    experience: i.experience,
    who: i.who,
    finalOutput: i.finalOutput,
    sessionCount: String(i.sessionCount),
    minutes: String(i.minutes),
    mode: i.mode,
    desiredPrice: i.desiredPrice ? String(i.desiredPrice) : "",
    keywords: i.keywords,
  };
}

export function DesignerClient({ access }: { access: SaveAccess }) {
  const router = useRouter();
  const [form, setForm] = useState<DesignerFormState>(EMPTY_DESIGNER_FORM);
  const [exampleId, setExampleId] = useState<string | null>(null);
  const [generated, setGenerated] = useState<{ prompt: string; snapshot: string; checklist: string[] } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>("prompt");
  const [pasted, setPasted] = useState("");
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  // 저장해 둔 입력 복원 (로그인하러 다녀와도 입력이 남도록)
  useEffect(() => {
    const saved = loadSaved();
    if (saved?.form) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 복원
      setForm({ ...EMPTY_DESIGNER_FORM, ...saved.form });
      setExampleId(saved.exampleId ?? null);
      setPasted(saved.pasted ?? "");
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (restored.current) persist({ form, exampleId, pasted });
  }, [form, exampleId, pasted]);

  const snapshot = useMemo(() => JSON.stringify(form), [form]);
  const stale = generated !== null && generated.snapshot !== snapshot;
  const sessionCount = Number(form.sessionCount);
  const minutes = Number(form.minutes);
  const field = getField(form.field) ?? FIELDS[0];
  const range = recommendedPriceRange(field.slug, sessionCount, minutes);
  const example = getExample(exampleId) ?? DESIGNER_EXAMPLES[0];

  function update<K extends keyof DesignerFormState>(key: K, value: DesignerFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function fillExample(ex: DesignerExample) {
    setForm(exampleToForm(ex));
    setExampleId(ex.id);
    setErrors({});
  }

  function generate() {
    const parsed = parseDesignerForm(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] ??= issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setGenerated({
      prompt: buildCourseDesignPrompt(parsed.data),
      snapshot,
      checklist: courseDesignChecklist(parsed.data),
    });
    setTab("prompt");
    requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  function save() {
    setSaveMsg(null);
    const parsed = parseDesignerForm(form);
    if (!parsed.success) {
      setSaveMsg("위 입력 폼을 먼저 채워 주세요.");
      return;
    }
    startSaving(async () => {
      const res = await saveDesignDraft({ input: parsed.data, markdown: pasted });
      if (res.ok) {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // 무시
        }
        router.push(`/studio/courses/${res.courseId}/edit?from=designer`);
      } else {
        setSaveMsg(res.message);
      }
    });
  }

  const pastedCheck = useMemo(() => {
    if (pasted.trim().length < 20) return null;
    const { data } = parseDesignMarkdown(pasted);
    const warnings: string[] = [];
    if (data.sessions && data.sessions.length !== sessionCount) {
      warnings.push(`회차표가 ${data.sessions.length}행입니다. 요청한 회차 수(${sessionCount})와 다릅니다.`);
    }
    if (/보장|100\s*%/.test(pasted)) warnings.push("\"보장\" 또는 \"100%\" 표현이 들어 있습니다. 게시 전에 고쳐 주세요.");
    if (hasContactPattern(pasted)) warnings.push("전화번호·이메일로 보이는 내용이 있습니다. 상세페이지에는 넣지 마세요.");
    return warnings;
  }, [pasted, sessionCount]);

  const exampleParsed = useMemo(() => parseDesignMarkdown(example.sampleMarkdown).data, [example]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      {/* ── 입력 폼 ── */}
      <section aria-labelledby="designer-form-title">
        <h2 id="designer-form-title" className="sr-only">설계 입력</h2>
        <div className="rounded-xl bg-panel p-4">
          <p className="text-sm font-bold text-ink">예시 채우기</p>
          <p className="mt-0.5 text-[13px] text-sub">가상 인물의 예시입니다. 눌러서 어떻게 쓰는지 살펴보세요.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {DESIGNER_EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => fillExample(ex)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
                  exampleId === ex.id ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-ink hover:border-navy"
                }`}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="d-field" className="label">분야</label>
            <select id="d-field" className="input" value={form.field} onChange={(e) => update("field", e.target.value)}>
              {FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.no} {f.name}</option>)}
            </select>
          </div>

          <TextArea id="d-exp" label="내 경험" hint="경력·자격·성공과 실패 경험을 있는 그대로 적어 주세요. 이름·연락처는 프롬프트에서 자동으로 지워집니다." value={form.experience} onChange={(v) => update("experience", v)} error={errors.experience} rows={5} />
          <TextArea id="d-who" label="누구를 돕나요" hint="어떤 상황의 누구인지 구체적으로 적을수록 좋습니다." value={form.who} onChange={(v) => update("who", v)} error={errors.who} rows={2} />

          <div>
            <label htmlFor="d-out" className="label">최종 결과물</label>
            <input id="d-out" className="input" value={form.finalOutput} onChange={(e) => update("finalOutput", e.target.value)} placeholder="예: 직무 맞춤 이력서 1부" maxLength={200} />
            <p className="hint">마지막 회차에 멘티가 손에 쥐고 가는 것입니다.</p>
            {errors.finalOutput && <p className="mt-1 text-[13px] text-danger">{errors.finalOutput}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="d-n" className="label">회차</label>
              <select id="d-n" className="input" value={form.sessionCount} onChange={(e) => update("sessionCount", e.target.value)}>
                {SESSION_COUNT_OPTIONS.map((n) => <option key={n} value={n}>{n}회차{n === 4 ? " (기본)" : ""}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="d-min" className="label">회당 시간</label>
              <select id="d-min" className="input" value={form.minutes} onChange={(e) => update("minutes", e.target.value)}>
                {MINUTES_OPTIONS.map((m) => <option key={m} value={m}>{m}분</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="d-mode" className="label">방식</label>
              <select id="d-mode" className="input" value={form.mode} onChange={(e) => update("mode", e.target.value)}>
                {Object.entries(MODE_LABELS).map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="d-price" className="label">희망 가격 <span className="font-normal text-sub">(선택, 원)</span></label>
            <input id="d-price" className="input" inputMode="numeric" value={form.desiredPrice} onChange={(e) => update("desiredPrice", e.target.value)} placeholder="예: 200000" />
            <p className="hint">이 구성의 권장 구간: <b className="text-ink">{formatRange(range)}</b></p>
            {errors.desiredPrice && <p className="mt-1 text-[13px] text-danger">{errors.desiredPrice}</p>}
          </div>

          <div>
            <label htmlFor="d-kw" className="label">강점 키워드 <span className="font-normal text-sub">(선택)</span></label>
            <input id="d-kw" className="input" value={form.keywords} onChange={(e) => update("keywords", e.target.value)} placeholder="쉼표로 구분 · 예: 실전 모의면접, 돌발 질문 대응" maxLength={300} />
          </div>

          <button type="button" onClick={generate} className="btn-primary w-full">AI로 공략 과정 설계하기</button>
          <p className="text-center text-[13px] text-sub">AI를 직접 부르지 않고, 내 AI에 붙여넣을 프롬프트를 만들어 드립니다.</p>
        </div>
      </section>

      {/* ── 결과 영역 ── */}
      <section ref={resultRef} aria-labelledby="designer-result-title" className="scroll-mt-24 min-w-0">
        <h2 id="designer-result-title" className="sr-only">설계 결과</h2>
        <div role="tablist" aria-label="결과 보기" className="grid grid-cols-3 rounded-lg border border-line bg-panel p-1 text-sm font-semibold">
          {([
            ["prompt", "설계 프롬프트"],
            ["example", "결과 예시"],
            ["detail", "상세페이지 예시"],
          ] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              type="button"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`min-h-10 rounded-md px-1 ${tab === key ? "bg-white text-ink shadow-sm" : "text-sub hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4" role="tabpanel">
          {tab === "prompt" && (
            <>
              {stale && (
                <p role="status" className="mb-4 rounded-lg border border-accent/40 bg-accent-soft p-3 text-sm font-semibold text-ink">
                  입력이 바뀌었습니다. 버튼을 눌러 프롬프트를 새로 만드세요.
                </p>
              )}
              {generated ? (
                <PromptPanel prompt={generated.prompt} checklist={generated.checklist} />
              ) : (
                <div className="rounded-xl border border-dashed border-line p-6 text-center">
                  <p className="font-bold text-ink">아직 만든 프롬프트가 없습니다</p>
                  <p className="mt-1 text-sm text-sub">왼쪽(모바일은 위쪽) 입력을 채우고 &ldquo;AI로 공략 과정 설계하기&rdquo;를 눌러 주세요.</p>
                </div>
              )}

              {/* AI 답 붙여넣기 + 초안 저장 */}
              <div className="mt-8 border-t border-line pt-6">
                <label htmlFor="d-paste" className="label">AI 답 붙여넣기</label>
                <p className="hint -mt-1 mb-2">내 AI가 돌려준 설계서를 그대로 붙여넣으세요. 초안으로 저장한 뒤 과정 편집 화면에서 다듬습니다.</p>
                <textarea id="d-paste" className="input min-h-48 font-mono text-[13px]" value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={"### 1. 과정명\n..."} />
                {!!pastedCheck?.length && (
                  <ul className="mt-2 space-y-1 text-[13px] text-danger">
                    {pastedCheck.map((w) => <li key={w}>· {w}</li>)}
                  </ul>
                )}
                <div className="mt-3">
                  {access === "allowed" && (
                    <button type="button" onClick={save} disabled={saving || pasted.trim().length < 20} className="btn-navy w-full sm:w-auto">
                      {saving ? "저장하는 중…" : "초안 저장하기"}
                    </button>
                  )}
                  {access === "guest" && (
                    <p className="text-sm text-sub">
                      <Link href="/login?next=/studio/designer" className="font-semibold text-navy underline underline-offset-2">로그인</Link>하면 초안으로 저장할 수 있습니다. 입력한 내용은 이 브라우저에 남아 있습니다.
                    </p>
                  )}
                  {access === "mentee" && (
                    <p className="text-sm text-sub">
                      초안 저장은 예비 멘토·인증 멘토만 할 수 있습니다.{" "}
                      <Link href="/academy" className="font-semibold text-navy underline underline-offset-2">아카데미</Link>에 참여하면 운영자가 역할을 바꿔 드립니다.
                    </p>
                  )}
                  {access === "unconfigured" && <p className="text-sm text-sub">데이터베이스가 연결되면 초안 저장을 쓸 수 있습니다.</p>}
                  {saveMsg && <p role="alert" className="mt-2 text-sm text-danger">{saveMsg}</p>}
                </div>
              </div>
            </>
          )}

          {tab === "example" && (
            <div>
              <ExampleNote example={example} selected={!!getExample(exampleId)} />
              <div className="card mt-3 p-4 md:p-5">
                <MarkdownView markdown={example.sampleMarkdown} />
              </div>
            </div>
          )}

          {tab === "detail" && (
            <div>
              <ExampleNote example={example} selected={!!getExample(exampleId)} />
              <div className="mx-auto mt-3 w-full max-w-[390px] overflow-hidden rounded-[28px] border-[6px] border-ink/90 bg-white shadow-xl">
                <div className="max-h-[720px] overflow-y-auto">
                  <CourseDetailView
                    c={{
                      fieldName: getField(example.input.field)?.name ?? "",
                      title: exampleParsed.title ?? "",
                      oneLiner: exampleParsed.oneLiner,
                      headline: exampleParsed.headlines?.[0],
                      target: exampleParsed.target,
                      before: exampleParsed.before,
                      after: exampleParsed.after,
                      sessions: exampleParsed.sessions ?? [],
                      prep: exampleParsed.prep,
                      notice: exampleParsed.notice,
                      price: exampleParsed.price,
                      sessionCount: example.input.sessionCount,
                      minutes: example.input.minutes,
                      modeLabel: MODE_LABELS[example.input.mode],
                      mentorName: example.mentorName,
                      mentorHeadline: example.mentorHeadline,
                      badges: ["파운딩 멘토", "인증 멘토"],
                      isExample: true,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ExampleNote({ example, selected }: { example: DesignerExample; selected: boolean }) {
  return (
    <p className="rounded-lg bg-panel px-3 py-2 text-[13px] text-sub">
      <b className="text-ink">예시 · {example.label}</b> 기준 화면입니다. 가상 인물과 가상 경력으로 만든 예시입니다.
      {!selected && " 다른 예시는 왼쪽 \"예시 채우기\"에서 고를 수 있습니다."}
    </p>
  );
}

function TextArea(props: { id: string; label: string; hint?: string; value: string; onChange: (v: string) => void; error?: string; rows?: number }) {
  return (
    <div>
      <label htmlFor={props.id} className="label">{props.label}</label>
      <textarea id={props.id} className="input" rows={props.rows ?? 3} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
      {props.hint && <p className="hint">{props.hint}</p>}
      {props.error && <p className="mt-1 text-[13px] text-danger">{props.error}</p>}
    </div>
  );
}
