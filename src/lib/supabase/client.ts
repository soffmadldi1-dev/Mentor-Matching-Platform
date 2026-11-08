"use client";

import { createBrowserClient } from "@supabase/ssr";

// 브라우저용 Supabase 클라이언트 (현재는 사용처가 적지만 단계 3 이후 실시간 기능에 쓴다)
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
