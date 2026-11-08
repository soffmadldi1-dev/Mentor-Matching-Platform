import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * 서버 컴포넌트·서버 액션·라우트 핸들러용 Supabase 클라이언트.
 * 환경변수가 없으면 null.
 */
export async function createClient() {
  // 쿠키를 먼저 읽어 이 요청을 항상 동적 렌더링으로 만든다(환경변수 유무와 관계없이 같은 동작).
  const cookieStore = await cookies();
  const env = getSupabaseEnv();
  if (!env) return null;

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // 서버 컴포넌트에서는 쿠키를 쓸 수 없다. 세션 갱신은 proxy.ts가 맡는다.
        }
      },
    },
  });
}
