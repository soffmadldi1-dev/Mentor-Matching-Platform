import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { WaitlistRow } from "@/lib/waitlistStats";

/** 대기자 전체 (RLS상 admin만 읽힌다) */
export async function fetchWaitlist(filters: { field?: string; role?: string } = {}) {
  const supabase = await createClient();
  if (!supabase) return { rows: [] as WaitlistRow[], error: "Supabase가 설정되지 않았습니다." };
  let q = supabase
    .from("waitlist")
    .select("id, email, name, role_interest, field_slug, note, created_at")
    .order("created_at", { ascending: false })
    .range(0, 9999);
  if (filters.field) q = q.eq("field_slug", filters.field);
  if (filters.role) q = q.eq("role_interest", filters.role);
  const { data, error } = await q;
  return { rows: (data ?? []) as WaitlistRow[], error: error?.message ?? null };
}
