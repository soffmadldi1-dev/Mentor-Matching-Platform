"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  userId: z.uuid(),
  role: z.enum(["mentee", "candidate", "mentor", "admin"]),
});

export type RoleState = { ok?: boolean; message?: string };

// 회원 역할 변경 (admin 전용 — DB 트리거·RLS도 한 번 더 막는다)
export async function changeRole(_prev: RoleState, form: FormData): Promise<RoleState> {
  const viewer = await getViewer();
  if (!viewer || viewer.role !== "admin") return { message: "운영자만 변경할 수 있습니다." };

  const parsed = schema.safeParse({ userId: form.get("userId"), role: form.get("role") });
  if (!parsed.success) return { message: "입력값을 확인해 주세요." };
  if (parsed.data.userId === viewer.id) return { message: "본인 역할은 여기서 바꿀 수 없습니다." };

  const supabase = await createClient();
  if (!supabase) return { message: "Supabase가 설정되지 않았습니다." };
  const { error } = await supabase.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.userId);
  if (error) return { message: `변경 실패: ${error.message}` };

  revalidatePath("/admin/users");
  return { ok: true, message: "변경했습니다." };
}
