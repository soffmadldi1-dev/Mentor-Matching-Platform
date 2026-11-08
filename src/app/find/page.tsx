import type { Metadata } from "next";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata: Metadata = { title: "공략 찾기" };

// 단계 4에서 5개 질문 요청서·매칭 추천으로 채운다. 지금은 대기자 등록으로 연결한다.
export default async function FindPage({ searchParams }: PageProps<"/find">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 300) : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="eyebrow">멘티의 문</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">공략 찾기</h1>

      {query && (
        <blockquote className="mt-6 rounded-xl border-l-4 border-accent bg-accent-soft p-4 text-[15px] text-ink">
          <p className="text-[13px] font-bold text-accent">남겨 주신 고민</p>
          <p className="mt-1">{query}</p>
        </blockquote>
      )}

      <div className="mt-6 rounded-xl bg-panel p-5">
        <p className="font-bold text-navy">지금은 첫 멘토들을 모시는 중입니다</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">
          곧 다섯 가지 질문으로 공략 요청서를 만들고, 운영자가 맞는 멘토를 추천해 드리는 기능이 열립니다. 대기자로 등록하시면 열리는 날 가장 먼저 알려 드릴게요.
        </p>
      </div>

      <div className="card mt-6 p-5 md:p-6">
        <WaitlistForm id="find-waitlist" defaultRole="mentee" />
      </div>
    </div>
  );
}
