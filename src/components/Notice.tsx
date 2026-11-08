import Link from "next/link";

// 권한 없음·설정 필요 같은 안내 상자
export function Notice({ title, children, action }: { title: string; children?: React.ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="card p-6">
        <p className="text-lg font-bold text-ink">{title}</p>
        {children && <div className="mt-2 text-[15px] leading-relaxed text-sub">{children}</div>}
        {action && <Link href={action.href} className="btn-outline mt-5">{action.label}</Link>}
      </div>
    </div>
  );
}
