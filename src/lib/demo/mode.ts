// 시연용 데모 모드: Supabase 환경변수가 없으면 자동으로 켜진다.
// NEXT_PUBLIC_ 값은 빌드 때 코드에 박히므로 서버·브라우저 어디서나 같은 값이다.
export const DEMO_MODE = !(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);
