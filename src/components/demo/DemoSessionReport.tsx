"use client";

import { useState } from "react";
import Link from "next/link";
import { demo, useDemo, useHydrated } from "@/lib/demo/store";
import { personName } from "@/lib/demo/selectors";
import { fmtDate } from "@/lib/demo/format";
import { buildSessionReportPrompt } from "@/lib/prompts/sessionReport";
import { PromptPanel } from "@/components/prompt/PromptPanel";
import { MarkdownView } from "@/components/MarkdownView";
import { RoleHint } from "./RoleHint";

const CHECKLIST = [
  "멘티 이름·연락처가 들어가지 않았나요?",
  "메모에 없는 평가나 수치가 덧붙지 않았나요?",
  "다음 과제가 구체적인가요?",
];

// 회차 리포트: 멘토 메모 → 프롬프트 복사 → AI 답 붙여넣기 → 확인 후 발송 (직접 작성도 가능)
export function DemoSessionReport({ id }: { id: string }) {
  const s = useDemo();
  const hydrated = useHydrated();
  const b = s.bookings.find((x) => x.id === id);
  const c = b && s.courses.find((x) => x.id === b.courseId);
  const reports = s.reports.filter((r) => r.bookingId === id);
  const firstOpen = c ? (c.sessions.find((x) => !reports.some((r) => r.sessionN === x.n))?.n ?? c.sessionCount) : 1;
  const [n, setN] = useState<number | null>(null);
  const sessionN = n ?? firstOpen;
  const [memo, setMemo] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [aiAnswer, setAiAnswer] = useState("");
  const [summary, setSummary] = useState("");
  const [homework, setHomework] = useState("");
  const [sent, setSent] = useState<number | null>(null);

  if (!hydrated) return <div className="min-h-[60vh]" aria-busy="true" />;
  if (!b || !c) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-lg font-bold">신청을 찾을 수 없습니다</p>
        <Link href="/studio/bookings" className="btn-outline mt-4">신청 관리로</Link>
      </div>
    );
  }
  const sess = c.sessions.find((x) => x.n === sessionN);
  const existing = reports.find((r) => r.sessionN === sessionN);

  function pick(k: number) {
    setN(k);
    setPrompt(null);
    setAiAnswer("");
    setMemo("");
    setSummary("");
    setHomework("");
    setSent(null);
  }

  // AI 답에서 "멘티용 요약"과 "다음 과제" 칸을 찾아 채운다 (실패해도 직접 입력 가능)
  function importAnswer() {
    const grab = (title: string) => {
      const m = aiAnswer.match(new RegExp(`#+\\s*\\d*\\.?\\s*${title}[^\\n]*\\n([\\s\\S]*?)(?=\\n#+\\s|$)`));
      return m ? m[1].trim().replace(/^[-*]\s+/gm, "").replace(/\n+/g, " ") : "";
    };
    const sm = grab("멘티용 요약");
    const hw = grab("다음 과제");
    if (sm) setSummary(sm);
    if (hw) setHomework(hw);
  }

  function send() {
    demo.addReport(b!.id, sessionN, { memo, menteeSummary: summary.trim(), nextHomework: homework.trim(), output: sess?.output ?? "" });
    setSent(sessionN);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <RoleHint roles={["mentor"]} what="멘토가 회차를 마치고 멘티에게 리포트를 보내는 곳입니다." />
      <Link href="/studio/bookings" className="text-sm text-sub underline underline-offset-2">← 신청 관리</Link>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">회차 리포트</h1>
      <p className="mt-1 text-sm text-sub">{personName(s, b.menteeId)} · {c.title}</p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="회차 선택">
        {c.sessions.map((x) => {
          const done = reports.some((r) => r.sessionN === x.n);
          return (
            <button key={x.n} role="tab" type="button" aria-selected={sessionN === x.n} onClick={() => pick(x.n)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${sessionN === x.n ? "border-navy bg-navy text-white" : "border-line bg-white"}`}>
              {x.n}회차{done ? " · 발송함" : ""}
            </button>
          );
        })}
      </div>

      {sess && (
        <p className="mt-4 rounded-lg bg-panel p-3 text-sm">
          <b>목표</b> {sess.goal} · <b>결과물</b> {sess.output}
        </p>
      )}

      {existing && sent === null ? (
        <div className="card mt-6 p-5">
          <p className="text-sm font-bold text-ok">{fmtDate(existing.sentAt)} 발송한 리포트</p>
          <p className="mt-2 text-[15px] leading-relaxed">{existing.menteeSummary}</p>
          <p className="mt-2 text-sm"><b>다음 과제</b> {existing.nextHomework}</p>
        </div>
      ) : sent !== null ? (
        <div role="status" className="mt-6 rounded-lg border border-accent/30 bg-accent-soft p-4">
          <p className="font-bold">{sent}회차 리포트를 보냈습니다</p>
          <p className="mt-1 text-sm">멘티의 내 공략 노트에 요약·다음 과제·결과물이 표시됩니다.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" className="btn-outline" onClick={() => demo.setRole("mentee")}>멘티로 바꿔 보기</button>
            <Link href="/me/notes" className="btn-primary">내 공략 노트 열기</Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="rp-memo" className="label">멘토 메모 3줄</label>
              <textarea id="rp-memo" className="input" rows={4} value={memo} onChange={(e) => setMemo(e.target.value)} placeholder={"예: 관광지 설명 3단 구조를 잘 따라옴\n돌발 질문에서 말이 길어짐\n다음 회차에 녹음 피드백 예정"} />
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className="btn-navy" disabled={!memo.trim()} onClick={() => setPrompt(buildSessionReportPrompt({ courseTitle: c.title, sessionN, sessionCount: c.sessionCount, goal: sess?.goal ?? "", output: sess?.output ?? "", memo }))}>
                  리포트 프롬프트 만들기
                </button>
                <button type="button" className="text-sm font-semibold text-navy underline underline-offset-2" onClick={() => setMemo(`${sess?.goal ?? ""} 실습을 끝까지 따라옴\n답변이 길어지는 습관이 있어 2분 안에 끊는 연습 필요\n다음 회차 전까지 과제 녹음 제출 요청`)}>
                  시연: 메모 예시 넣기
                </button>
              </div>
            </div>
            {prompt && <PromptPanel prompt={prompt} checklist={CHECKLIST} />}
          </div>

          <div className="space-y-4">
            {prompt && (
              <div>
                <label htmlFor="rp-ai" className="label">AI 답 붙여넣기 <span className="font-normal text-sub">(선택)</span></label>
                <textarea id="rp-ai" className="input font-mono text-[13px]" rows={6} value={aiAnswer} onChange={(e) => setAiAnswer(e.target.value)} />
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" className="btn-outline min-h-9 px-3 text-sm" disabled={!aiAnswer.trim()} onClick={importAnswer}>요약·과제 칸으로 옮기기</button>
                  <button type="button" className="text-sm font-semibold text-navy underline underline-offset-2" onClick={() => setAiAnswer(`### 1. 멘티용 요약\n오늘은 ${sess?.goal ?? "이번 회차 목표"}를 함께 연습했어요. 실습을 끝까지 따라오셨고, 답변을 2분 안에 정리하는 연습만 더하면 됩니다.\n\n### 2. 다음 과제\n- ${sess?.homework ?? "다음 과제"}\n\n### 3. 멘토 품질 점검\n목표 달성. 시간 배분 보완 필요.\n\n### 4. 기관 보고용 한 줄\n${sessionN}회차 진행, 결과물(${sess?.output ?? ""}) 작성 완료.`)}>
                    시연: AI 답 예시 넣기
                  </button>
                </div>
                {aiAnswer.trim() && <div className="mt-3 rounded-lg border border-line p-3"><MarkdownView markdown={aiAnswer} /></div>}
              </div>
            )}
            <div className="rounded-xl border border-line p-4">
              <p className="font-bold">멘티에게 보낼 내용</p>
              <p className="text-[13px] text-sub">AI 답을 옮기거나 직접 써도 됩니다. 확인 후 보내세요.</p>
              <label htmlFor="rp-sum" className="label mt-3">멘티용 요약</label>
              <textarea id="rp-sum" className="input" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} />
              <label htmlFor="rp-hw" className="label mt-3">다음 과제</label>
              <input id="rp-hw" className="input" value={homework} onChange={(e) => setHomework(e.target.value)} />
              <button type="button" className="btn-primary mt-4 w-full" disabled={!summary.trim() || !homework.trim()} onClick={send}>
                확인하고 리포트 보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
