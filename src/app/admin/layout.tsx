import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Notice } from "@/components/Notice";
import { DEMO_MODE } from "@/lib/demo/mode";
import { RoleHint } from "@/components/demo/RoleHint";

const NAV = [
  { href: "/admin/waitlist", label: "대기자" },
  { href: "/admin/courses", label: "과정 승인" },
  { href: "/admin/matching", label: "매칭 검수" },
  { href: "/admin/cohorts", label: "기수·수료" },
  { href: "/admin/quality", label: "품질 지표" },
  { href: "/admin/users", label: "회원·역할" },
];

// /admin 이하 전체: 운영자만 접근 (시연용 데모에서는 안내만 하고 열어 둔다)
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!DEMO_MODE) {
    const { allowed } = await requireRole(["admin"], "/admin");
    if (!allowed) {
      return <Notice title="운영자만 볼 수 있는 화면입니다" action={{ href: "/", label: "홈으로 가기" }} />;
    }
  }
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {DEMO_MODE && <RoleHint roles={["admin"]} what="운영자가 대기자·과정·매칭·캠프·품질을 관리하는 곳입니다." />}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line pb-3">
        <Link href="/admin" className="text-lg font-extrabold text-navy">운영</Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
          {(DEMO_MODE ? NAV : NAV.filter((n) => n.href === "/admin/waitlist" || n.href === "/admin/users")).map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-accent">{n.label}</Link>
          ))}
        </nav>
      </div>
      <div className="pt-6">{children}</div>
    </div>
  );
}
