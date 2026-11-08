import type { Metadata } from "next";
import { DemoCourseDetail } from "@/components/demo/DemoCourseDetail";

export const metadata: Metadata = { title: "공략 과정" };

// 과정 상세(멘티용). 현재는 시연용 데이터로 보여 준다.
export default async function CoursePage({ params }: PageProps<"/courses/[id]">) {
  const { id } = await params;
  return <DemoCourseDetail id={id} />;
}
