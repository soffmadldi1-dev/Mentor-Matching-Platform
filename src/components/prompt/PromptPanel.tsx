"use client";

import { CopyButton } from "./CopyButton";

// 공통 "프롬프트 생성기" 결과 영역: 3단계 안내 + 프롬프트 + 복사 + 확인 체크리스트 (CLAUDE.md 9장)
export function PromptPanel({ prompt, checklist }: { prompt: string; checklist: string[] }) {
  return (
    <div className="space-y-5">
      <ol className="grid gap-2 sm:grid-cols-3">
        {[
          { t: "복사하기", b: "아래 프롬프트를 복사합니다." },
          { t: "내 AI 열기", b: "ChatGPT, Claude, Gemini 등 평소 쓰는 AI를 엽니다." },
          { t: "붙여넣기", b: "새 대화에 붙여넣고 답을 받습니다." },
        ].map((s, i) => (
          <li key={s.t} className="flex gap-2 rounded-lg bg-panel p-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-navy text-[12px] font-bold text-white">{i + 1}</span>
            <span className="text-sm">
              <span className="font-bold text-ink">{s.t}</span>
              <span className="block text-sub">{s.b}</span>
            </span>
          </li>
        ))}
      </ol>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-bold text-ink">프롬프트</p>
          <CopyButton text={prompt} />
        </div>
        <pre className="mt-2 max-h-[420px] overflow-y-auto whitespace-pre-wrap rounded-lg border border-line bg-panel p-4 font-sans text-[13px] leading-relaxed text-ink">
          {prompt}
        </pre>
      </div>

      <div className="rounded-lg border border-accent/30 bg-accent-soft p-4">
        <p className="text-sm font-bold text-ink">AI 답을 받은 뒤 확인할 것</p>
        <ul className="mt-2 space-y-1.5">
          {checklist.map((c) => (
            <li key={c}>
              <label className="flex items-start gap-2 text-sm text-ink">
                <input type="checkbox" className="mt-0.5 size-4 accent-accent" />
                <span>{c}</span>
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
