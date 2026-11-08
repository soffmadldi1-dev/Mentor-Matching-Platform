import type { Metadata } from "next";
import { DemoAdminCohortDetail } from "@/components/demo/DemoAdminCohorts";

export const metadata: Metadata = { title: "기수 상세" };

export default async function Page({ params }: PageProps<"/admin/cohorts/[id]">) {
  const { id } = await params;
  return <DemoAdminCohortDetail id={id} />;
}
