"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { demo, useDemo } from "@/lib/demo/store";
import type { DemoRole } from "@/lib/demo/types";
import { DEMO_ROLE_LABELS, DEMO_ROLES, ROLE_NAV } from "./roles";

// 시연용 상단: 데모 안내 바(역할 전환·초기화) + 사이트 헤더
export function DemoHeader() {
  const s = useDemo();
  const router = useRouter();

  function reset() {
    if (window.confirm("이 브라우저에서 바꾼 시연 데이터를 지우고 처음 상태로 돌릴까요?")) {
      demo.reset();
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30">
      <div className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2 text-[13px]">
          <span className="font-bold">시연용 데모</span>
          <span className="hidden text-white/75 md:inline">예시 데이터이며, 입력한 내용은 이 브라우저에만 저장됩니다.</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <label htmlFor="demo-role" className="text-white/80">보는 역할</label>
            <select
              id="demo-role"
              value={s.role}
              onChange={(e) => demo.setRole(e.target.value as DemoRole)}
              className="rounded-md border border-white/30 bg-navy px-2 py-1 font-semibold text-white"
            >
              {DEMO_ROLES.map((r) => (
                <option key={r} value={r}>{DEMO_ROLE_LABELS[r]}</option>
              ))}
            </select>
            <Link href="/demo" className="rounded-md bg-accent px-2.5 py-1 font-bold text-white hover:bg-accent-dark">기능 둘러보기</Link>
            <button type="button" onClick={reset} className="text-white/75 underline-offset-2 hover:underline">초기화</button>
          </div>
        </div>
      </div>

      <div className="border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 md:py-3">
          <Link href="/" className="flex items-baseline gap-1.5" aria-label="먼저가본 홈">
            <span className="text-lg font-extrabold tracking-tight text-navy">먼저가본</span>
            <span className="text-[13px] font-semibold text-sub">인생공략집</span>
          </Link>
          <nav aria-label="주요 메뉴" className="order-3 flex w-full flex-wrap gap-x-5 text-[15px] font-medium text-ink md:order-none md:w-auto">
            <Link href="/find" className="py-1.5 hover:text-accent">공략 찾기</Link>
            <Link href="/#fields" className="py-1.5 hover:text-accent">분야별 공략집</Link>
            <Link href="/academy" className="py-1.5 hover:text-accent">아카데미</Link>
            {ROLE_NAV[s.role].map((n) => (
              <Link key={n.href} href={n.href} className="py-1.5 font-semibold text-navy hover:text-accent">{n.label}</Link>
            ))}
          </nav>
          <span className="ml-auto rounded-full bg-accent-soft px-2.5 py-1 text-[13px] font-bold text-accent">
            {DEMO_ROLE_LABELS[s.role]}로 보는 중
          </span>
        </div>
      </div>
    </header>
  );
}
