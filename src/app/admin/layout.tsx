import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Notice } from "@/components/Notice";

// /admin 이하 전체: 운영자만 접근
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const { allowed } = await requireRole(["admin"], "/admin");
  if (!allowed) {
    return <Notice title="운영자만 볼 수 있는 화면입니다" action={{ href: "/", label: "홈으로 가기" }} />;
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-3">
        <Link href="/admin" className="text-lg font-extrabold text-navy">운영</Link>
        <nav className="flex flex-wrap gap-4 text-[15px]">
          <Link href="/admin/waitlist" className="hover:text-accent">대기자</Link>
          <Link href="/admin/users" className="hover:text-accent">회원·역할</Link>
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
