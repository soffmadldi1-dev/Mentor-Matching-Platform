import type { Metadata } from "next";
import { DemoCamp } from "@/components/demo/DemoCamp";

export const metadata: Metadata = { title: "내 캠프" };

export default function CampPage() {
  return <DemoCamp />;
}
