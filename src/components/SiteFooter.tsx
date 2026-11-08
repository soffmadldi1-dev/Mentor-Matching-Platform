import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-panel">
      <div className="mx-auto max-w-6xl px-4 py-8 text-[13px] leading-relaxed text-sub">
        <p className="text-sm font-bold text-navy">
          먼저가본 <span className="font-semibold text-sub">· 인생공략집</span>
        </p>
        <p className="mt-1">먼저 가본 사람이 1% 앞을 보여줍니다.</p>
        <p className="mt-3">운영: 홍요셉 · 현재 시범 운영 중이며 결제 없이 신청 접수만 받습니다.</p>
        <div className="mt-3 flex flex-wrap gap-4">
          <Link href="/legal/privacy" className="font-semibold text-ink hover:text-accent">개인정보 처리방침(초안)</Link>
          <Link href="/academy" className="hover:text-accent">멘토 아카데미</Link>
        </div>
      </div>
    </footer>
  );
}
