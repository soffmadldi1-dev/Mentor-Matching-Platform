import type { Metadata } from "next";
import { DemoNotes } from "@/components/demo/DemoNotes";

export const metadata: Metadata = { title: "내 공략 노트" };

export default function NotesPage() {
  return <DemoNotes />;
}
