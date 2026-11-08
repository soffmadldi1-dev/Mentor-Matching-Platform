/** 로그인 후 돌아갈 경로를 사이트 안 경로로만 제한한다 (오픈 리다이렉트 방지) */
export function safeNext(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
