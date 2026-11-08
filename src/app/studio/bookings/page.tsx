import type { Metadata } from "next";
import { DemoBookings } from "@/components/demo/DemoBookings";

export const metadata: Metadata = { title: "신청 관리" };

export default function BookingsPage() {
  return <DemoBookings />;
}
