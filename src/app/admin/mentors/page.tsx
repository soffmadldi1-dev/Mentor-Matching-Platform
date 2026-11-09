import type { Metadata } from "next";
import { DemoAdminMentors } from "@/components/demo/DemoAdminMentors";

export const metadata: Metadata = { title: "멘토 목록 · 등급" };

export default function Page() {
  return <DemoAdminMentors />;
}
