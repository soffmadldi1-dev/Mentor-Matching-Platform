"use client";

import { useActionState } from "react";
import { changeRole, type RoleState } from "./actions";

const ROLES = [
  { v: "mentee", t: "멘티" },
  { v: "candidate", t: "예비 멘토" },
  { v: "mentor", t: "인증 멘토" },
  { v: "admin", t: "운영자" },
];

export function RoleForm({ userId, role, disabled }: { userId: string; role: string; disabled?: boolean }) {
  const [state, action, pending] = useActionState<RoleState, FormData>(changeRole, {});
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="userId" value={userId} />
      <label className="sr-only" htmlFor={`role-${userId}`}>역할</label>
      <select id={`role-${userId}`} name="role" defaultValue={role} className="input w-auto py-2" disabled={disabled}>
        {ROLES.map((r) => <option key={r.v} value={r.v}>{r.t}</option>)}
      </select>
      <button type="submit" className="btn-outline min-h-10 px-3 text-sm" disabled={pending || disabled}>
        {pending ? "변경 중…" : "역할 변경하기"}
      </button>
      {state.message && (
        <span role="status" className={`text-[13px] ${state.ok ? "text-ok" : "text-danger"}`}>{state.message}</span>
      )}
    </form>
  );
}
