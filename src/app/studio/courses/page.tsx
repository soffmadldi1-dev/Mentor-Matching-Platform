import type { Metadata } from "next";
import { DemoStudioCourses } from "@/components/demo/DemoStudioCourses";

export const metadata: Metadata = { title: "내 과정" };

export default function StudioCoursesPage() {
  return <DemoStudioCourses />;
}
