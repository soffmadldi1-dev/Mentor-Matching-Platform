import Link from "next/link";
import { FIELDS } from "@/lib/fields";
import { WaitlistForm } from "@/components/WaitlistForm";
import { DEMO_MODE } from "@/lib/demo/mode";

export default function HomePage() {
  return (
    <>
      {/* 히어로 + 고민 입력창 */}
      <section className="border-b border-line bg-gradient-to-b from-accent-soft/60 to-white">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-12 md:pb-20 md:pt-20">
          <p className="eyebrow">경험 기반 멘토링 · 인생공략집</p>
          <h1 className="mt-3 text-[32px] font-extrabold leading-tight tracking-tight text-ink md:text-5xl">
            먼저 가본 사람이
            <br />
            1% 앞을 보여줍니다
          </h1>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-sub">
            그 길을 먼저 지나간 사람이 4회차 공략 과정으로 안내합니다. 매 회차가 끝나면 손에 쥐는 결과물이 남습니다.
          </p>

          <form action="/find" className="mt-8 max-w-2xl">
            <label htmlFor="home-q" className="text-[15px] font-bold text-navy">
              지금 어떤 길 앞에 서 있나요?
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="home-q"
                name="q"
                className="input flex-1 bg-white"
                placeholder="예: 관광통역안내사 필기는 붙었는데 면접이 막막해요"
                maxLength={300}
              />
              <button type="submit" className="btn-primary shrink-0">공략 찾기</button>
            </div>
          </form>
          {DEMO_MODE && (
            <p className="mt-4 text-sm text-sub">
              처음 오셨나요? <Link href="/demo" className="font-semibold text-navy underline underline-offset-2">기능 둘러보기</Link>에서 멘티·멘토·운영자 화면을 차례로 볼 수 있습니다.
            </p>
          )}
        </div>
      </section>

      {/* 3개 분야 카드 */}
      <section id="fields" className="mx-auto max-w-6xl scroll-mt-32 px-4 py-14">
        <p className="eyebrow">분야별 공략집</p>
        <h2 className="section-title mt-2">지금은 세 갈래 길부터 엽니다</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {FIELDS.map((f) => (
            <Link
              key={f.slug}
              href={`/fields/${f.slug}`}
              className="card group flex flex-col p-5 transition hover:border-navy"
            >
              <span className="text-sm font-bold text-accent">{f.no}</span>
              <h3 className="mt-1 text-xl font-bold text-ink group-hover:text-navy">{f.name}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-sub">{f.description}</p>
              <div className="mt-4 rounded-lg bg-panel p-3">
                <p className="text-[13px] font-bold text-navy">대표 결과물</p>
                <ul className="mt-1 space-y-0.5 text-sm text-ink">
                  {f.outputs.map((o) => (
                    <li key={o}>· {o}</li>
                  ))}
                </ul>
              </div>
              <span className="mt-4 text-sm font-semibold text-navy">공략집 보기 →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 서비스 흐름: 두 출입구 */}
      <section className="border-y border-line bg-panel">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="eyebrow">한 플랫폼, 두 출입구</p>
          <h2 className="section-title mt-2">배우러 오셨나요, 나누러 오셨나요?</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="card p-6">
              <p className="text-sm font-bold text-accent">멘티의 문</p>
              <h3 className="mt-1 text-xl font-bold">공략 찾기</h3>
              <ol className="mt-4 space-y-3 text-[15px]">
                <Step n="1" title="고민 정리" body="다섯 가지 질문에 답해 내 공략 요청서를 만듭니다." />
                <Step n="2" title="멘토 추천" body="운영자가 요청서를 읽고 맞는 공략 과정을 최대 3개 추천합니다." />
                <Step n="3" title="4회차 공략" body="회차마다 결과물을 받고, 공략 노트에 차곡차곡 쌓입니다." />
              </ol>
              <Link href="/find" className="btn-outline mt-6 w-full sm:w-auto">공략 찾기 시작하기</Link>
            </div>
            <div className="card p-6">
              <p className="text-sm font-bold text-accent">멘토의 문</p>
              <h3 className="mt-1 text-xl font-bold">공략 만들기</h3>
              <ol className="mt-4 space-y-3 text-[15px]">
                <Step n="1" title="입구 선택" body="셀프 등록, 경력 인증(빠른 등록), 처음 과정을 만드는 분을 위한 출시 캠프 중 나에게 맞는 입구를 고릅니다." />
                <Step n="2" title="기준 통과" body="본인 확인, 필수 모듈, 설계서 기준 검사를 통과합니다. 모든 입구가 같은 기준입니다." />
                <Step n="3" title="활동 시작" body="과정을 게시해 활동을 시작하고, 판매·평점·회차 리포트 실적으로 등급이 오릅니다." />
              </ol>
              <Link href="/mentor/join" className="btn-outline mt-6 w-full sm:w-auto">멘토로 활동하기</Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { t: "같은 기준, 실적으로 오르는 등급", b: "모든 멘토가 같은 품질 기준을 통과하고, 판매·평점·회차 리포트 실적으로 등급이 오릅니다." },
              { t: "AI로 다듬은 과정 설계", b: "멘토의 경험을 AI 공략 설계기로 회차별 계획과 결과물로 정리합니다." },
              { t: "회차마다 결과물", b: "듣고 끝나는 상담이 아니라, 매 회차 손에 쥐는 결과물로 확인합니다." },
            ].map((x) => (
              <div key={x.t} className="border-l-2 border-accent pl-4">
                <p className="font-bold text-ink">{x.t}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-sub">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 대기자 등록 */}
      <section id="waitlist" className="mx-auto max-w-3xl scroll-mt-32 px-4 py-14">
        <p className="eyebrow">오픈 알림 받기</p>
        <h2 className="section-title mt-2">가장 먼저 소식을 받아 보세요</h2>
        <p className="mt-2 text-[15px] text-sub">
          공략 과정이 열리거나 파운딩 멘토 모집 일정이 정해지면 이메일로 알려 드립니다.
        </p>
        <div className="card mt-6 p-5 md:p-6">
          <WaitlistForm id="home-waitlist" />
        </div>
      </section>
    </>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-navy text-[13px] font-bold text-white">
        {n}
      </span>
      <span>
        <span className="font-bold text-ink">{title}</span>
        <span className="block text-sub">{body}</span>
      </span>
    </li>
  );
}
