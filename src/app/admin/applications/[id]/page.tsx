import type { Metadata } from "next";
import { DemoAdminApplicationDetail } from "@/components/demo/DemoAdminApplications";

export const metadata: Metadata = { title: "멘토 지원서" };

export default async function Page({ params }: PageProps<"/admin/applications/[id]">) {
  const { id } = await params;
  return <DemoAdminApplicationDetail id={id} />;
}
