"use client";

import { useDemo } from "@/lib/demo/store";
import { publishedCourses } from "@/lib/demo/selectors";
import type { FieldSlug } from "@/lib/fields";
import { CourseCard } from "./CourseCard";

export function FieldCourses({ field }: { field: FieldSlug }) {
  const s = useDemo();
  const list = publishedCourses(s, field);
  if (!list.length) {
    return (
      <div className="rounded-xl border border-dashed border-line p-6 text-center">
        <p className="font-bold">이 분야 멘토를 준비 중입니다</p>
        <p className="mt-1 text-sm text-sub">아래 대기자로 등록하시면 첫 과정이 열릴 때 알려 드립니다.</p>
      </div>
    );
  }
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {list.map((c) => <CourseCard key={c.id} s={s} c={c} />)}
    </div>
  );
}
