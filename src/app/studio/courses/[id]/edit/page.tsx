import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole, STUDIO_ROLES } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getField, MODE_LABELS, type CourseMode } from "@/lib/fields";
import { Notice } from "@/components/Notice";
import type { SessionRow } from "@/lib/designer/parseDesign";
import { CourseEditForm } from "./CourseEditForm";

export const metadata: Metadata = { title: "과정 편집" };

export default async function CourseEditPage({ params, searchParams }: PageProps<"/studio/courses/[id]/edit">) {
  const { id } = await params;
  const sp = await searchParams;
  const { allowed } = await requireRole(STUDIO_ROLES, `/studio/courses/${id}/edit`);
  if (!allowed) return <Notice title="예비 멘토부터 과정을 편집할 수 있습니다" action={{ href: "/studio/designer", label: "공략 설계기로 가기" }} />;

  const supabase = await createClient();
  if (!supabase) notFound();
  const { data: c } = await supabase
    .from("courses")
    .select("id, field_slug, design_markdown, title, one_liner, target, before, after, sessions, prep, notice, price, headlines, checks, session_count, minutes, mode, status")
    .eq("id", id)
    .maybeSingle();
  if (!c) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">멘토 스튜디오 · 과정 편집</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">{c.title || "제목 없는 초안"}</h1>
      <p className="mt-1 text-sm text-sub">
        {getField(c.field_slug)?.name} · {c.session_count}회차 · 회당 {c.minutes}분 · {MODE_LABELS[c.mode as CourseMode]}
      </p>
      {sp.from === "designer" && (
        <p role="status" className="mt-4 rounded-lg border border-accent/30 bg-accent-soft p-3 text-sm">
          초안을 저장했습니다. 오른쪽(모바일은 위쪽) 설계서를 보며 아래 항목을 채우거나, &ldquo;설계서에서 가져오기&rdquo;를 눌러 한 번에 채운 뒤 다듬으세요.
        </p>
      )}
      <div className="mt-6">
        <CourseEditForm
          courseId={c.id}
          designMarkdown={c.design_markdown ?? ""}
          sessionCount={c.session_count}
          initial={{
            title: c.title ?? "",
            oneLiner: c.one_liner ?? "",
            target: c.target ?? "",
            before: c.before ?? "",
            after: c.after ?? "",
            sessions: (c.sessions as SessionRow[]) ?? [],
            prep: c.prep ?? [],
            notice: c.notice ?? "",
            price: c.price,
            headlines: c.headlines ?? [],
            checks: c.checks ?? [],
          }}
        />
      </div>
    </div>
  );
}
