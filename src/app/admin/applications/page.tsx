import type { Metadata } from "next";
import { DemoAdminApplications } from "@/components/demo/DemoAdminApplications";

export const metadata: Metadata = { title: "멘토 지원 심사" };

export default function Page() {
  return <DemoAdminApplications />;
}
