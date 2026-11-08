import type { NextRequest } from "next/server";
import { getViewer } from "@/lib/auth";
import { getField } from "@/lib/fields";
import { toCsv } from "@/lib/csv";
import { fetchWaitlist } from "../data";

// 대기자 CSV 내보내기 (admin 전용)
export async function GET(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin") {
    return new Response("운영자만 내려받을 수 있습니다.", { status: 403 });
  }
  const sp = request.nextUrl.searchParams;
  const field = sp.get("field") ?? undefined;
  const role = sp.get("role") ?? undefined;
  const { rows, error } = await fetchWaitlist({ field, role });
  if (error) return new Response(`불러오기 오류: ${error}`, { status: 500 });

  const csv = toCsv(
    ["등록일시", "이름", "이메일", "관심", "분야", "메모"],
    rows.map((r) => [
      new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" }),
      r.name,
      r.email,
      r.role_interest === "mentor" ? "멘토" : "멘티",
      getField(r.field_slug ?? "")?.name ?? "",
      r.note ?? "",
    ]),
  );
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="waitlist-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
