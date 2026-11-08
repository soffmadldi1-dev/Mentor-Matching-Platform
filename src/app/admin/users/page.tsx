import type { Metadata } from "next";
import { getViewer, ROLE_LABELS, type Role } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RoleForm } from "./RoleForm";

export const metadata: Metadata = { title: "회원·역할" };

type ProfileRow = { id: string; email: string | null; display_name: string | null; role: Role; created_at: string };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const viewer = await getViewer();
  const supabase = await createClient();

  let rows: ProfileRow[] = [];
  let error: string | null = null;
  if (supabase) {
    let query = supabase
      .from("profiles")
      .select("id, email, display_name, role, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (q) query = query.or(`email.ilike.%${q.replace(/[%,()]/g, "")}%,display_name.ilike.%${q.replace(/[%,()]/g, "")}%`);
    const res = await query;
    rows = (res.data ?? []) as ProfileRow[];
    error = res.error?.message ?? null;
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold">회원·역할</h1>
      <p className="mt-1 text-sm text-sub">
        가입하면 멘티로 시작합니다. 아카데미 참여자는 예비 멘토로, 수료·인증자는 인증 멘토로 바꿔 주세요. 예비 멘토부터 공략 설계 초안을 저장할 수 있습니다.
      </p>
      <form className="mt-5 flex gap-2">
        <label htmlFor="user-q" className="sr-only">이메일 또는 이름 검색</label>
        <input id="user-q" name="q" defaultValue={q} className="input max-w-xs" placeholder="이메일 또는 이름" />
        <button className="btn-outline" type="submit">검색하기</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-danger">불러오기 오류: {error}</p>}
      <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="font-semibold">{r.display_name || "(이름 없음)"} <span className="ml-1 text-[13px] font-normal text-sub">{ROLE_LABELS[r.role]}</span></p>
              <p className="text-sm text-sub">{r.email ?? "-"} · 가입 {new Date(r.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</p>
            </div>
            <RoleForm userId={r.id} role={r.role} disabled={r.id === viewer?.id} />
          </li>
        ))}
        {!rows.length && <li className="px-4 py-8 text-center text-sm text-sub">회원이 없습니다.</li>}
      </ul>
    </div>
  );
}
