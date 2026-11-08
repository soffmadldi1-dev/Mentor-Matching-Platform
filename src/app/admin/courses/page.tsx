import type { Metadata } from "next";
import { DemoAdminCourses } from "@/components/demo/DemoAdminCourses";

export const metadata: Metadata = { title: "과정 게시 승인" };

export default function Page() {
  return <DemoAdminCourses />;
}
