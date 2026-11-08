import type { Metadata } from "next";
import { DemoSessionReport } from "@/components/demo/DemoSessionReport";

export const metadata: Metadata = { title: "회차 리포트" };

export default async function SessionReportPage({ params }: PageProps<"/studio/bookings/[id]">) {
  const { id } = await params;
  return <DemoSessionReport id={id} />;
}
