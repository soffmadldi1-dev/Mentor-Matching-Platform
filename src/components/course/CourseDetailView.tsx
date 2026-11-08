import { formatWon } from "@/lib/prompts/pricing";
import type { SessionRow } from "@/lib/designer/parseDesign";

// 멘티가 보게 될 과정 상세 화면. 설계기 [상세페이지 예시]와 단계 3의 /courses/[id]에서 함께 쓴다.
export type CourseView = {
  fieldName: string;
  title: string;
  oneLiner?: string;
  headline?: string; // 대표 헤드카피
  target?: string;
  before?: string;
  after?: string;
  sessions: SessionRow[];
  prep?: string[];
  notice?: string;
  price?: number | null;
  sessionCount: number;
  minutes: number;
  modeLabel: string;
  mentorName: string;
  mentorHeadline?: string;
  badges?: string[];
  isExample?: boolean;
};

export function CourseDetailView({ c, cta }: { c: CourseView; cta?: React.ReactNode }) {
  return (
    <article className="text-ink">
      <div className="bg-gradient-to-b from-accent-soft to-white px-5 pb-6 pt-6">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-bold text-navy ring-1 ring-line">{c.fieldName}</span>
          {c.isExample && <span className="rounded-full bg-navy px-2.5 py-0.5 text-[12px] font-bold text-white">예시</span>}
        </div>
        {c.headline && <p className="mt-3 text-[15px] font-bold text-accent">{c.headline}</p>}
        <h1 className="mt-1 text-[22px] font-extrabold leading-snug">{c.title}</h1>
        {c.oneLiner && <p className="mt-2 text-[15px] leading-relaxed text-sub">{c.oneLiner}</p>}
        <p className="mt-3 text-sm text-ink">
          {c.sessionCount}회차 · 회당 {c.minutes}분 · {c.modeLabel}
        </p>
      </div>

      <section className="border-t border-line px-5 py-5">
        <p className="text-[13px] font-bold text-sub">멘토</p>
        <div className="mt-2 flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-navy text-base font-bold text-white">
            {c.mentorName.replace(/^예시\s*/, "").slice(-1) || "멘"}
          </div>
          <div className="min-w-0">
            <p className="font-bold">{c.mentorName}</p>
            {c.mentorHeadline && <p className="text-sm text-sub">{c.mentorHeadline}</p>}
            {!!c.badges?.length && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {c.badges.map((b) => (
                  <span key={b} className="rounded border border-accent/40 bg-accent-soft px-1.5 py-0.5 text-[12px] font-bold text-accent">{b}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {(c.before || c.after) && (
        <section className="border-t border-line px-5 py-5">
          <p className="text-[13px] font-bold text-sub">이 과정을 마치면</p>
          <div className="mt-2 grid gap-2">
            {c.before && (
              <div className="rounded-lg bg-panel p-3">
                <p className="text-[12px] font-bold text-sub">Before</p>
                <p className="mt-0.5 text-[15px]">{c.before}</p>
              </div>
            )}
            {c.after && (
              <div className="rounded-lg border border-accent/30 bg-accent-soft p-3">
                <p className="text-[12px] font-bold text-accent">After</p>
                <p className="mt-0.5 text-[15px] font-semibold">{c.after}</p>
              </div>
            )}
          </div>
          {c.target && <p className="mt-3 text-sm leading-relaxed text-sub"><b className="text-ink">이런 분께 맞아요 </b>{c.target}</p>}
        </section>
      )}

      {!!c.sessions.length && (
        <section className="border-t border-line px-5 py-5">
          <p className="text-[13px] font-bold text-sub">회차별 공략</p>
          <ol className="mt-3 space-y-3">
            {c.sessions.map((s) => (
              <li key={s.n} className="rounded-lg border border-line p-3">
                <p className="text-[13px] font-bold text-accent">{s.n}회차</p>
                <p className="mt-0.5 font-bold">{s.goal}</p>
                {s.activities && <p className="mt-1 text-sm text-sub">{s.activities}</p>}
                {s.output && (
                  <p className="mt-2 rounded bg-panel px-2 py-1.5 text-sm">
                    <span className="font-bold text-navy">가져가는 결과물 </span>{s.output}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {!!c.prep?.length && (
        <section className="border-t border-line px-5 py-5">
          <p className="text-[13px] font-bold text-sub">준비물</p>
          <ul className="mt-2 space-y-1 text-[15px]">{c.prep.map((p) => <li key={p}>· {p}</li>)}</ul>
        </section>
      )}

      {c.notice && (
        <section className="border-t border-line px-5 py-5">
          <p className="text-[13px] font-bold text-sub">안내</p>
          <p className="mt-2 text-[15px] leading-relaxed">{c.notice}</p>
        </section>
      )}

      <section className="sticky bottom-0 border-t border-line bg-white px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[12px] text-sub">{c.sessionCount}회차 전체</p>
            <p className="text-xl font-extrabold">{c.price ? formatWon(c.price) : "가격 협의"}</p>
          </div>
          {cta ?? <span className="btn-primary pointer-events-none">신청 접수하기</span>}
        </div>
        <p className="mt-2 text-[12px] text-sub">지금은 결제 없이 신청 접수만 받습니다. 멘토가 일정을 확인한 뒤 연락드립니다.</p>
      </section>
    </article>
  );
}
