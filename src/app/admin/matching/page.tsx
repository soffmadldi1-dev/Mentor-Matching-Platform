import type { Metadata } from "next";
import { DemoAdminMatching } from "@/components/demo/DemoAdminMatching";

export const metadata: Metadata = { title: "매칭 검수" };

export default function Page() {
  return <DemoAdminMatching />;
}
