import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FIELDS, getField } from "@/lib/fields";
import { WaitlistForm } from "@/components/WaitlistForm";
import { DEMO_MODE } from "@/lib/demo/mode";
import { FieldCourses } from "@/components/demo/FieldCourses";

export function generateStaticParams() {
  return FIELDS.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps<"/fields/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getField(slug)?.name ?? "분야별 공략집" };
}

// 단계 3에서 게시된 과정 카드 목록으로 채운다. 지금은 분야 소개 + 대기자 등록.
export default async function FieldPage({ params }: PageProps<"/fields/[slug]">) {
  const { slug } = await params;
  const field = getField(slug);
  if (!field) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="eyebrow">분야별 공략집 · {field.no}</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{field.name}</h1>
      <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-sub">{field.description}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {field.topics.map((t) => (
          <span key={t} className="rounded-full border border-line bg-white px-3 py-1 text-sm text-ink">{t}</span>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-panel p-4">
        <p className="text-sm font-bold text-navy">이 분야에서 손에 쥐는 결과물</p>
        <p className="mt-1 text-[15px] text-ink">{field.outputs.join(" · ")}</p>
      </div>

      <h2 className="mt-10 text-xl font-bold">게시된 공략 과정</h2>
      <div className="mt-4">
        {DEMO_MODE ? (
          <FieldCourses field={field.slug} />
        ) : (
          <div className="rounded-xl border border-dashed border-line p-6 text-center">
            <p className="font-bold">이 분야 멘토를 준비 중입니다</p>
            <p className="mt-1 text-sm text-sub">품질 기준을 통과한 멘토의 공략 과정이 이곳에 게시됩니다.</p>
          </div>
        )}
      </div>

      <h2 className="mt-12 text-xl font-bold">새 과정 소식 받기</h2>
      <div className="card mt-4 p-5 md:p-6">
        <WaitlistForm id={`field-${field.slug}-waitlist`} defaultField={field.slug} />
      </div>
    </div>
  );
}
