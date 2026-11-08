import type { Metadata } from "next";
import Link from "next/link";
import { FIELDS, getField } from "@/lib/fields";
import { aggregateWaitlist } from "@/lib/waitlistStats";
import { fetchWaitlist } from "./data";

export const metadata: Metadata = { title: "대기자 관리" };

const ROLE = { mentee: "멘티", mentor: "멘토" } as const;

export default async function AdminWaitlistPage({ searchParams }: PageProps<"/admin/waitlist">) {
  const sp = await searchParams;
  const field = typeof sp.field === "string" && getField(sp.field) ? sp.field : undefined;
  const role = sp.role === "mentee" || sp.role === "mentor" ? sp.role : undefined;

  const all = await fetchWaitlist();
  const stats = aggregateWaitlist(all.rows);
  const rows = all.rows.filter((r) => (!field || r.field_slug === field) && (!role || r.role_interest === role));
  const qs = new URLSearchParams({ ...(field ? { field } : {}), ...(role ? { role } : {}) }).toString();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">대기자</h1>
          <p className="mt-1 text-sm text-sub">수요 증명 목표: 300명 · 현재 {stats.totals.total}명</p>
        </div>
        <a href={`/admin/waitlist/export${qs ? `?${qs}` : ""}`} className="btn-navy">CSV 내보내기</a>
      </div>

      {all.error && <p role="alert" className="mt-4 text-sm text-danger">불러오기 오류: {all.error}</p>}

      {/* 집계 */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.rows.map((s) => (
          <div key={s.slug} className="card p-4">
            <p className="text-sm font-bold text-navy">{s.name}</p>
            <p className="mt-1 text-2xl font-extrabold">{s.total}<span className="ml-1 text-sm font-semibold text-sub">명</span></p>
            <p className="mt-1 text-sm text-sub">멘티 {s.mentee} · 멘토 {s.mentor}</p>
          </div>
        ))}
        <div className="card border-accent/40 bg-accent-soft p-4">
          <p className="text-sm font-bold text-accent">전체</p>
          <p className="mt-1 text-2xl font-extrabold">{stats.totals.total}<span className="ml-1 text-sm font-semibold text-sub">명</span></p>
          <p className="mt-1 text-sm text-sub">멘티 {stats.totals.mentee} · 멘토 {stats.totals.mentor}</p>
        </div>
      </div>

      {/* 필터 */}
      <form className="mt-8 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="f-field" className="label">분야</label>
          <select id="f-field" name="field" defaultValue={field ?? ""} className="input w-auto">
            <option value="">전체</option>
            {FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-role" className="label">관심</label>
          <select id="f-role" name="role" defaultValue={role ?? ""} className="input w-auto">
            <option value="">전체</option>
            <option value="mentee">멘티</option>
            <option value="mentor">멘토</option>
          </select>
        </div>
        <button className="btn-outline" type="submit">적용하기</button>
        {qs && <Link href="/admin/waitlist" className="py-2 text-sm text-sub underline">필터 지우기</Link>}
      </form>

      {/* 목록: 모바일 카드, 넓은 화면 표 */}
      <p className="mt-6 text-sm text-sub">{rows.length}명 표시</p>
      <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
        <li className="hidden grid-cols-[1fr_1.4fr_70px_1fr_1.6fr_110px] gap-3 bg-panel px-4 py-2 text-[13px] font-bold text-sub md:grid">
          <span>이름</span><span>이메일</span><span>관심</span><span>분야</span><span>메모</span><span>등록일</span>
        </li>
        {rows.map((r) => (
          <li key={r.id} className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[1fr_1.4fr_70px_1fr_1.6fr_110px] md:gap-3">
            <span className="font-semibold">{r.name}</span>
            <span className="text-sub md:text-ink">{r.email}</span>
            <span><span className="md:hidden text-sub">관심 </span>{ROLE[r.role_interest]}</span>
            <span>{getField(r.field_slug ?? "")?.name ?? "-"}</span>
            <span className="text-sub">{r.note || "-"}</span>
            <span className="text-sub">{new Date(r.created_at).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
          </li>
        ))}
        {!rows.length && <li className="px-4 py-8 text-center text-sm text-sub">아직 대기자가 없습니다.</li>}
      </ul>
    </div>
  );
}
