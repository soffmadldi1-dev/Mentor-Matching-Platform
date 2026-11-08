"use client";

import { useState } from "react";
import { FIELDS, getField } from "@/lib/fields";
import { useDemo } from "@/lib/demo/store";
import { aggregateWaitlist } from "@/lib/waitlistStats";
import { toCsv } from "@/lib/csv";
import { downloadText } from "./download";

const ROLE = { mentee: "멘티", mentor: "멘토" } as const;

export function DemoAdminWaitlist() {
  const s = useDemo();
  const [field, setField] = useState("");
  const [role, setRole] = useState("");
  const all = s.waitlist;
  const stats = aggregateWaitlist(all.map((w) => ({ role_interest: w.roleInterest, field_slug: w.field })));
  const rows = all.filter((w) => (!field || w.field === field) && (!role || w.roleInterest === role));
  const pct = Math.min(100, Math.round((all.length / 300) * 100));

  function exportCsv() {
    const csv = toCsv(
      ["등록일시", "이름", "이메일", "관심", "분야", "메모"],
      rows.map((r) => [new Date(r.createdAt).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }), r.name, r.email, ROLE[r.roleInterest], getField(r.field)?.name ?? "", r.note]),
    );
    downloadText(`waitlist-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">대기자</h1>
          <p className="mt-1 text-sm text-sub">수요 증명 목표 300명 · 현재 {all.length}명 ({pct}%)</p>
        </div>
        <button type="button" className="btn-navy" onClick={exportCsv}>CSV 내보내기</button>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-panel ring-1 ring-line"><div className="h-full bg-accent" style={{ width: `${pct}%` }} /></div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.rows.map((x) => (
          <div key={x.slug} className="card p-4">
            <p className="text-sm font-bold text-navy">{x.name}</p>
            <p className="mt-1 text-2xl font-extrabold">{x.total}<span className="ml-1 text-sm font-semibold text-sub">명</span></p>
            <p className="mt-1 text-sm text-sub">멘티 {x.mentee} · 멘토 {x.mentor}</p>
          </div>
        ))}
        <div className="card border-accent/40 bg-accent-soft p-4">
          <p className="text-sm font-bold text-accent">전체</p>
          <p className="mt-1 text-2xl font-extrabold">{stats.totals.total}<span className="ml-1 text-sm font-semibold text-sub">명</span></p>
          <p className="mt-1 text-sm text-sub">멘티 {stats.totals.mentee} · 멘토 {stats.totals.mentor}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="w-f" className="label">분야</label>
          <select id="w-f" className="input w-auto" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="">전체</option>
            {FIELDS.map((f) => <option key={f.slug} value={f.slug}>{f.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="w-r" className="label">관심</label>
          <select id="w-r" className="input w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">전체</option>
            <option value="mentee">멘티</option>
            <option value="mentor">멘토</option>
          </select>
        </div>
      </div>

      <p className="mt-6 text-sm text-sub">{rows.length}명 표시</p>
      <ul className="mt-2 divide-y divide-line rounded-xl border border-line">
        <li className="hidden grid-cols-[1fr_1.4fr_70px_1fr_1.6fr_90px] gap-3 bg-panel px-4 py-2 text-[13px] font-bold text-sub md:grid">
          <span>이름</span><span>이메일</span><span>관심</span><span>분야</span><span>메모</span><span>등록일</span>
        </li>
        {rows.slice(0, 100).map((r) => (
          <li key={r.id} className="grid gap-1 px-4 py-3 text-sm md:grid-cols-[1fr_1.4fr_70px_1fr_1.6fr_90px] md:gap-3">
            <span className="font-semibold">{r.name}</span>
            <span className="text-sub md:text-ink">{r.email}</span>
            <span><span className="text-sub md:hidden">관심 </span>{ROLE[r.roleInterest]}</span>
            <span>{getField(r.field)?.name}</span>
            <span className="text-sub">{r.note || "-"}</span>
            <span className="text-sub">{new Date(r.createdAt).toLocaleDateString("ko-KR", { timeZone: "Asia/Seoul" })}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
