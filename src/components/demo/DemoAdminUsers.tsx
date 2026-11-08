"use client";

import { useDemo } from "@/lib/demo/store";
import { fmtDate } from "@/lib/demo/format";
import { DEMO_ROLE_LABELS } from "./roles";

export function DemoAdminUsers() {
  const s = useDemo();
  return (
    <div>
      <h1 className="text-2xl font-extrabold">회원·역할</h1>
      <p className="mt-1 text-sm text-sub">가입하면 멘티로 시작합니다. 아카데미 참여자는 예비 멘토로, 수료·인증자는 인증 멘토로 운영자가 역할을 바꿉니다. (시연에서는 상단 &ldquo;보는 역할&rdquo;로 바꿔 봅니다)</p>
      <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
        {s.people.map((p) => (
          <li key={p.id} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm text-sub">{p.email} · 가입 {fmtDate(p.joinedAt)}</p>
            </div>
            <span className="w-fit rounded-full bg-panel px-2.5 py-0.5 text-[13px] font-bold text-navy">{DEMO_ROLE_LABELS[p.role]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
