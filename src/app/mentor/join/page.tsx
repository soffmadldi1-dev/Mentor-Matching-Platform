import type { Metadata } from "next";
import { MentorJoin } from "@/components/demo/MentorJoin";

export const metadata: Metadata = { title: "멘토로 활동하기" };

export default function MentorJoinPage() {
  return <MentorJoin />;
}
