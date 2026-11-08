import Link from "next/link";
import { getViewer, ROLE_LABELS, STUDIO_ROLES } from "@/lib/auth";
import { DEMO_MODE } from "@/lib/demo/mode";
import { DemoHeader } from "@/components/demo/DemoHeader";

// 상단 바: 로고 텍스트 + 공략 찾기 / 분야별 공략집 / 아카데미 / 로그인
export async function SiteHeader() {
  // 시연용 데모: 로그인 대신 역할 전환
  if (DEMO_MODE) return <DemoHeader />;
  const viewer = await getViewer();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 md:py-3">
        <Link href="/" className="flex items-baseline gap-1.5" aria-label="먼저가본 홈">
          <span className="text-lg font-extrabold tracking-tight text-navy">먼저가본</span>
          <span className="text-[13px] font-semibold text-sub">인생공략집</span>
        </Link>

        <nav
          aria-label="주요 메뉴"
          className="order-3 flex w-full gap-5 text-[15px] font-medium text-ink md:order-none md:w-auto"
        >
          <Link href="/find" className="py-1.5 hover:text-accent">공략 찾기</Link>
          <Link href="/#fields" className="py-1.5 hover:text-accent">분야별 공략집</Link>
          <Link href="/academy" className="py-1.5 hover:text-accent">아카데미</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          {viewer ? (
            <>
              {STUDIO_ROLES.includes(viewer.role) && (
                <Link href="/studio" className="font-semibold text-navy hover:text-accent">스튜디오</Link>
              )}
              {viewer.role === "admin" && (
                <Link href="/admin" className="font-semibold text-navy hover:text-accent">운영</Link>
              )}
              <span className="hidden text-sub sm:inline">{ROLE_LABELS[viewer.role]}</span>
              <form action="/auth/signout" method="post">
                <button type="submit" className="text-sub hover:text-ink">로그아웃</button>
              </form>
            </>
          ) : (
            <Link href="/login" className="rounded-lg border border-line px-3 py-1.5 font-semibold hover:border-navy">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
