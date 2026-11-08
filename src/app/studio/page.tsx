import type { Metadata } from "next";
import Link from "next/link";
import { requireRole, STUDIO_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getField } from "@/lib/fields";
import { Notice } from "@/components/Notice";

export const metadata: Metadata = { title: "멘토 스튜디오" };

const STATUS_LABEL: Record<string, string> = { draft: "초안", review: "검토 대기", published: "게시 중", hidden: "숨김" };

export default async function StudioPage() {
  const { viewer, allowed } = await requireRole(STUDIO_ROLES, "/studio");
  if (!allowed) {
    return (
      <Notice title="멘토 스튜디오는 예비 멘토부터 쓸 수 있습니다" action={{ href: "/studio/designer", label: "공략 설계기 체험하기" }}>
        <p>공략 설계기는 누구나 체험할 수 있습니다. 초안 저장과 과정 관리는 아카데미에 참여한 예비 멘토부터 열립니다.</p>
      </Notice>
    );
  }

  const supabase = await createClient();
  const { data: courses } = supabase
    ? await supabase
        .from("courses")
        .select("id, title, field_slug, status, session_count, minutes, updated_at")
        .eq("mentor_id", viewer.id)
        .order("updated_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="eyebrow">멘토 스튜디오</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{viewer.displayName ? `${viewer.displayName}님의 스튜디오` : "내 스튜디오"}</h1>

      <Link href="/studio/designer" className="card mt-6 flex flex-col gap-1 p-5 hover:border-navy sm:flex-row sm:items-center sm:justify-between">
        <span>
          <span className="block font-bold">AI 공략 설계기</span>
          <span className="block text-sm text-sub">내 경험으로 회차별 공략 과정을 설계합니다.</span>
        </span>
        <span className="text-sm font-semibold text-navy">새 과정 설계하기 →</span>
      </Link>

      <h2 className="mt-10 text-lg font-bold">내 과정</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
        {(courses ?? []).map((c) => (
          <li key={c.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{c.title || "제목 없는 초안"}</p>
              <p className="text-sm text-sub">
                {getField(c.field_slug)?.name} · {c.session_count}회차 · {c.minutes}분 · {STATUS_LABEL[c.status] ?? c.status}
              </p>
            </div>
            <Link href={`/studio/courses/${c.id}/edit`} className="text-sm font-semibold text-navy hover:text-accent">편집하기</Link>
          </li>
        ))}
        {!courses?.length && <li className="px-4 py-8 text-center text-sm text-sub">아직 저장한 과정이 없습니다. 공략 설계기에서 첫 초안을 만들어 보세요.</li>}
      </ul>
    </div>
  );
}
