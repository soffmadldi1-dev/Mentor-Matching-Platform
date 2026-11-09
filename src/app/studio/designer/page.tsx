import type { Metadata } from "next";
import { getViewer, STUDIO_ROLES } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { DesignerClient } from "./DesignerClient";
import { DEMO_MODE } from "@/lib/demo/mode";

export const metadata: Metadata = { title: "AI 공략 설계기" };

export default async function DesignerPage({ searchParams }: PageProps<"/studio/designer">) {
  const { join } = await searchParams;
  const joinTrack = join === "A" || join === "B" ? join : undefined;
  const viewer = DEMO_MODE ? null : await getViewer();
  const access = DEMO_MODE
    ? "demo"
    : !isSupabaseConfigured()
    ? "unconfigured"
    : !viewer
      ? "guest"
      : STUDIO_ROLES.includes(viewer.role)
        ? "allowed"
        : "mentee";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow">멘토 스튜디오</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">AI 공략 설계기</h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-sub">
        내 경험을 적으면 회차별 목표·진행·결과물·과제를 설계하는 프롬프트를 만들어 드립니다. 내 AI에 붙여넣어 설계서를 받고, 그 답을 초안으로 저장하세요.
      </p>
      <div className="mt-8">
        <DesignerClient access={access} joinTrack={joinTrack} />
      </div>
    </div>
  );
}
