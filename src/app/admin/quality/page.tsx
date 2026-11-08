import type { Metadata } from "next";
import { DemoAdminQuality } from "@/components/demo/DemoAdminQuality";

export const metadata: Metadata = { title: "품질 지표" };

export default function Page() {
  return <DemoAdminQuality />;
}
