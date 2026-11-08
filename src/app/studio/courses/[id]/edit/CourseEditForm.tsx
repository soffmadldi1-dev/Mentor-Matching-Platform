"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { MarkdownView } from "@/components/MarkdownView";
import { parseDesignMarkdown, type SessionRow } from "@/lib/designer/parseDesign";

type FormValues = {
  title: string;
  oneLiner: string;
  target: string;
  before: string;
  after: string;
  sessions: SessionRow[];
  prep: string[];
  notice: string;
  price: number | null;
  headlines: string[];
  checks: string[];
};

/** 회차 수만큼 행을 맞춘다 (모자라면 빈 행, 넘치면 자른다) */
function fitSessions(rows: SessionRow[], count: number): SessionRow[] {
  return Array.from({ length: count }, (_, i) => {
    const r = rows[i];
    return { n: i + 1, goal: r?.goal ?? "", activities: r?.activities ?? "", output: r?.output ?? "", homework: r?.homework ?? "" };
  });
}

const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);

export type CourseEditValues = FormValues;

export function CourseEditForm({
  designMarkdown,
  sessionCount,
  initial,
  onSave,
  footer,
}: {
  designMarkdown: string;
  sessionCount: number;
  initial: FormValues;
  /** 저장 처리 (실서비스: 서버 액션, 시연: 브라우저 저장) */
  onSave: (payload: FormValues) => Promise<{ ok: boolean; message: string }>;
  /** 저장 버튼 옆에 붙일 추가 영역 (예: 게시 요청) */
  footer?: React.ReactNode;
}) {
  const [v, setV] = useState<FormValues>({ ...initial, sessions: fitSessions(initial.sessions, sessionCount) });
  const [prepText, setPrepText] = useState(initial.prep.join("\n"));
  const [checksText, setChecksText] = useState(initial.checks.join("\n"));
  const [headlines, setHeadlines] = useState<string[]>([0, 1, 2].map((i) => initial.headlines[i] ?? ""));
  const [priceText, setPriceText] = useState(initial.price ? String(initial.price) : "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) => setV((p) => ({ ...p, [k]: val }));
  const setSession = (i: number, key: keyof Omit<SessionRow, "n">, val: string) =>
    setV((p) => ({ ...p, sessions: p.sessions.map((s, j) => (j === i ? { ...s, [key]: val } : s)) }));

  // "설계서에서 가져오기": 찾은 항목만 채우고, 못 찾은 항목은 안내한다
  function importFromDesign() {
    const hasValues = v.title || v.oneLiner || v.sessions.some((s) => s.goal);
    if (hasValues && !window.confirm("이미 입력한 내용 위에 설계서 내용을 덮어씁니다. 계속할까요?")) return;
    const { data, missing } = parseDesignMarkdown(designMarkdown);
    setV((p) => ({
      ...p,
      title: data.title?.slice(0, 30) ?? p.title,
      oneLiner: data.oneLiner?.slice(0, 60) ?? p.oneLiner,
      target: data.target ?? p.target,
      before: data.before ?? p.before,
      after: data.after ?? p.after,
      sessions: data.sessions ? fitSessions(data.sessions, sessionCount) : p.sessions,
      notice: data.notice ?? p.notice,
    }));
    if (data.prep) setPrepText(data.prep.join("\n"));
    if (data.checks) setChecksText(data.checks.join("\n"));
    if (data.headlines) setHeadlines([0, 1, 2].map((i) => data.headlines?.[i] ?? ""));
    if (data.price) setPriceText(String(data.price));

    const notes: string[] = [];
    if (missing.length) notes.push(`찾지 못한 항목: ${missing.join(", ")} — 직접 채워 주세요.`);
    if (data.sessions && data.sessions.length !== sessionCount) notes.push(`설계서 회차표가 ${data.sessions.length}행이라 ${sessionCount}회차에 맞춰 조정했습니다.`);
    if (data.title && data.title.length > 30) notes.push("과정명이 30자를 넘어 잘랐습니다.");
    setImportMsg(notes.length ? notes.join(" ") : "설계서 내용을 모두 가져왔습니다. 저장하기 전에 한 번 더 다듬어 주세요.");
  }

  function save() {
    setMsg(null);
    const digits = priceText.replace(/[^\d]/g, "");
    const payload = {
      ...v,
      prep: lines(prepText),
      checks: lines(checksText),
      headlines: headlines.map((h) => h.trim()),
      price: digits ? Number(digits) : null,
    };
    startSaving(async () => {
      const res = await onSave(payload);
      setMsg({ ok: res.ok, text: res.message });
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      {/* 설계서 참고 패널 (모바일에서는 위에 접어서) */}
      <aside className="order-first lg:order-last">
        <details className="card group lg:sticky lg:top-24" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 font-bold">
            <span>AI 설계서</span>
            <span className="text-sm font-normal text-sub group-open:hidden">펼치기</span>
            <span className="hidden text-sm font-normal text-sub group-open:inline">접기</span>
          </summary>
          <div className="max-h-[60vh] overflow-y-auto border-t border-line p-4">
            {designMarkdown ? <MarkdownView markdown={designMarkdown} /> : <p className="text-sm text-sub">저장된 설계서가 없습니다.</p>}
          </div>
          {designMarkdown && (
            <div className="border-t border-line p-4">
              <button type="button" onClick={importFromDesign} className="btn-outline w-full">설계서에서 가져오기</button>
              {importMsg && <p role="status" className="mt-2 text-[13px] text-sub">{importMsg}</p>}
            </div>
          )}
        </details>
      </aside>

      <div className="space-y-6">
        <Field id="e-title" label="과정명" count={`${v.title.length}/30`}>
          <input id="e-title" className="input" maxLength={30} value={v.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field id="e-one" label="한 줄 소개" count={`${v.oneLiner.length}/60`}>
          <input id="e-one" className="input" maxLength={60} value={v.oneLiner} onChange={(e) => set("oneLiner", e.target.value)} />
        </Field>
        <Field id="e-target" label="대상">
          <textarea id="e-target" className="input" rows={2} value={v.target} onChange={(e) => set("target", e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="e-before" label="Before (지금 멘티의 상태)">
            <textarea id="e-before" className="input" rows={3} value={v.before} onChange={(e) => set("before", e.target.value)} />
          </Field>
          <Field id="e-after" label="After (마친 뒤 멘티의 상태)">
            <textarea id="e-after" className="input" rows={3} value={v.after} onChange={(e) => set("after", e.target.value)} />
          </Field>
        </div>

        <fieldset>
          <legend className="label">회차표 ({sessionCount}회차)</legend>
          <div className="space-y-3">
            {v.sessions.map((s, i) => (
              <div key={s.n} className="rounded-xl border border-line p-3">
                <p className="text-sm font-bold text-accent">{s.n}회차{i === sessionCount - 1 ? " · 마지막 결과물" : ""}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {([
                    ["goal", "목표"],
                    ["activities", "진행 내용"],
                    ["output", "멘티가 가져가는 결과물"],
                    ["homework", "과제"],
                  ] as const).map(([key, label]) => (
                    <div key={key}>
                      <label htmlFor={`s${s.n}-${key}`} className="text-[13px] font-semibold text-sub">{label}</label>
                      <input id={`s${s.n}-${key}`} className="input mt-0.5" value={s[key]} onChange={(e) => setSession(i, key, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </fieldset>

        <Field id="e-prep" label="준비물" hint="한 줄에 하나씩">
          <textarea id="e-prep" className="input" rows={3} value={prepText} onChange={(e) => setPrepText(e.target.value)} />
        </Field>
        <Field id="e-notice" label="교육 안내문" hint="3문장 정도로">
          <textarea id="e-notice" className="input" rows={3} value={v.notice} onChange={(e) => set("notice", e.target.value)} />
        </Field>
        <Field id="e-price" label="가격 (원)">
          <input id="e-price" className="input" inputMode="numeric" value={priceText} onChange={(e) => setPriceText(e.target.value)} placeholder="예: 200000" />
        </Field>
        <fieldset>
          <legend className="label">헤드카피 3안</legend>
          <div className="space-y-2">
            {headlines.map((h, i) => (
              <input
                key={i}
                aria-label={`헤드카피 ${i + 1}`}
                className="input"
                maxLength={80}
                value={h}
                onChange={(e) => setHeadlines((p) => p.map((x, j) => (j === i ? e.target.value : x)))}
              />
            ))}
          </div>
        </fieldset>
        <Field id="e-checks" label="출시 전 멘토 확인 사항" hint="한 줄에 하나씩 · 게시 요청 전에 직접 확인하세요">
          <textarea id="e-checks" className="input" rows={3} value={checksText} onChange={(e) => setChecksText(e.target.value)} />
        </Field>

        <div className="sticky bottom-0 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={save} disabled={saving} className="btn-primary">
              {saving ? "저장하는 중…" : "초안 저장하기"}
            </button>
            <Link href="/studio" className="text-sm text-sub underline underline-offset-2">스튜디오로 돌아가기</Link>
            {msg && <span role="status" className={`text-sm ${msg.ok ? "text-ok" : "text-danger"}`}>{msg.text}</span>}
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}

function Field({ id, label, hint, count, children }: { id: string; label: string; hint?: string; count?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="label">{label}</label>
        {count && <span className="text-[12px] text-sub">{count}</span>}
      </div>
      {children}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
