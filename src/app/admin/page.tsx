import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "운영" };

export default function AdminHome() {
  const items = [
    { href: "/admin/waitlist", t: "대기자", b: "분야·관심별 집계와 CSV 내보내기" },
    { href: "/admin/users", t: "회원·역할", b: "회원 역할(멘티·예비 멘토·인증 멘토·운영자) 변경" },
  ];
  return (
    <div>
      <h1 className="text-2xl font-extrabold">운영 홈</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {items.map((i) => (
          <Link key={i.href} href={i.href} className="card p-5 hover:border-navy">
            <p className="font-bold">{i.t}</p>
            <p className="mt-1 text-sm text-sub">{i.b}</p>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-sm text-sub">기수·과정 승인·매칭 검수 화면은 단계 3~5에서 추가됩니다.</p>
    </div>
  );
}
