"use client";

import { demo, useDemo } from "@/lib/demo/store";
import type { DemoRole } from "@/lib/demo/types";
import { DEMO_ROLE_LABELS } from "./roles";

// 화면을 쓰는 역할 안내. 시연 편의를 위해 막지는 않고 "이 역할로 보기" 버튼을 준다.
export function RoleHint({ roles, what }: { roles: DemoRole[]; what: string }) {
  const s = useDemo();
  if (roles.includes(s.role)) return null;
  const target = roles[0];
  return (
    <div role="note" className="mb-6 flex flex-col gap-2 rounded-lg border border-navy/20 bg-panel p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p>
        <b className="text-navy">{roles.map((r) => DEMO_ROLE_LABELS[r]).join("·")}</b> 화면입니다. {what}
      </p>
      <button type="button" onClick={() => demo.setRole(target)} className="btn-outline min-h-9 shrink-0 px-3 text-sm">
        {DEMO_ROLE_LABELS[target]}로 보기
      </button>
    </div>
  );
}
