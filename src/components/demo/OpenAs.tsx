"use client";

import { useRouter } from "next/navigation";
import { demo } from "@/lib/demo/store";
import type { DemoRole } from "@/lib/demo/types";
import { DEMO_ROLE_LABELS } from "./roles";

// 역할을 바꾸고 해당 화면으로 이동하는 버튼
export function OpenAs({ role, href, label, className = "btn-outline min-h-9 px-3 text-sm" }: { role: DemoRole; href: string; label?: string; className?: string }) {
  const router = useRouter();
  return (
    <button type="button" className={className} onClick={() => { demo.setRole(role); router.push(href); }}>
      {label ?? `${DEMO_ROLE_LABELS[role]}로 열기`}
    </button>
  );
}
