// Supabase 환경변수 읽기. 값이 없으면 null을 돌려주고, 화면에서 "설정 필요" 안내를 띄운다.
export function getSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "아직 데이터베이스(Supabase)가 연결되지 않았습니다. 운영자에게 알려 주세요.";

/** 매직링크가 돌아올 사이트 주소 */
export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
