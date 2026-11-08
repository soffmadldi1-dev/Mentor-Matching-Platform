import type { Metadata } from "next";
import { DemoAdminCohorts } from "@/components/demo/DemoAdminCohorts";

export const metadata: Metadata = { title: "기수 관리" };

export default function Page() {
  return <DemoAdminCohorts />;
}
