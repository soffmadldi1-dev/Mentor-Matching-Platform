import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { JoinFlow } from "@/components/demo/JoinFlow";

export const metadata: Metadata = { title: "멘토 지원서" };

// A 셀프 등록 · B 경력 인증 지원 흐름. C(출시 캠프)는 아카데미로 보낸다.
export default async function JoinTrackPage({ params, searchParams }: PageProps<"/mentor/join/[track]">) {
  const { track } = await params;
  const { step } = await searchParams;
  const t = track.toUpperCase();
  if (t === "C") redirect("/academy");
  if (t !== "A" && t !== "B") notFound();
  return <JoinFlow key={t} track={t} initialStep={typeof step === "string" ? step : undefined} />;
}
