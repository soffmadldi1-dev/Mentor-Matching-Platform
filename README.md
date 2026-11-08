# 먼저가본 · 인생공략집

먼저 가본 사람이 1% 앞을 보여줍니다. 경험 기반 멘토링 플랫폼입니다. 명세는 [CLAUDE.md](./CLAUDE.md)를 기준으로 합니다.

## 지금 들어 있는 것 (단계 0~2)

| 화면 | 경로 | 비고 |
|---|---|---|
| 홈 | `/` | 히어로, 고민 입력창, 3개 분야 카드, 두 출입구, 대기자 등록 |
| 아카데미 | `/academy` | 출시 캠프(0~4주) 구성, 파운딩 멘토 1기 안내, 대기 등록 |
| 분야별 공략집 | `/fields/career` 등 | 분야 소개 + 대기자 등록 (과정 목록은 단계 3) |
| 공략 찾기 | `/find` | 준비 중 안내 + 대기자 등록 (요청서·추천은 단계 4) |
| AI 공략 설계기 | `/studio/designer` | 누구나 프롬프트 생성. 예비·인증 멘토는 AI 답을 초안으로 저장 |
| 과정 편집 | `/studio/courses/[id]/edit` | 설계서 보며 편집, "설계서에서 가져오기" |
| 멘토 스튜디오 | `/studio` | 내 과정 목록 |
| 운영 | `/admin/waitlist`, `/admin/users` | 대기자 집계·CSV, 회원 역할 변경 (admin만) |
| 개인정보 동의 초안 | `/legal/privacy` | |
| 로그인 | `/login` | 이메일 매직링크 |

## 로컬 실행

준비물: Node.js 20 이상

```bash
npm install
```

```bash
cp .env.example .env.local
```

`.env.local`에 Supabase 값을 넣은 뒤(아래 참고):

```bash
npm run dev
```

http://localhost:3000 을 엽니다. Supabase 값이 없어도 화면과 공략 설계기 프롬프트 생성은 동작하고, 저장 기능만 "연결되지 않았습니다"로 안내합니다.

확인 명령(타입 검사 + 린트 + 단위 테스트):

```bash
npm run check
```

## Supabase 연결

1. https://supabase.com 에서 새 프로젝트를 만듭니다(무료 플랜, 리전은 Seoul 권장).
2. **SQL Editor**에서 아래 두 파일 내용을 순서대로 붙여넣고 실행합니다.
   - `supabase/migrations/20261108000001_init_schema.sql` (테이블·RLS)
   - `supabase/migrations/20261108000002_seed_fields.sql` (분야 3개)
   - Supabase CLI를 쓴다면 `supabase link` 후 `supabase db push`로도 적용됩니다.
3. **Project Settings → API**(또는 상단 Connect)에서 Project URL과 Publishable key를 복사해 `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`에 넣습니다.
4. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (배포 후에는 배포 주소)
   - Redirect URLs에 `http://localhost:3000/auth/callback`, `https://배포주소/auth/callback` 추가
5. 사이트에서 운영자 이메일로 한 번 로그인(가입)한 뒤, SQL Editor에서 운영자 권한을 줍니다.

```sql
update public.profiles set role = 'admin' where email = '운영자@이메일';
```

이후 다른 회원의 역할은 `/admin/users` 화면에서 바꿉니다. 가입하면 멘티로 시작하고, 예비 멘토(candidate)부터 공략 설계 초안을 저장할 수 있습니다.

> 무료 플랜의 기본 메일 발송은 시간당 발송량이 매우 적습니다. 실제 공개 전에는 Authentication → SMTP Settings에서 자체 SMTP(예: Resend, 네이버 웍스 메일 등)를 연결하세요.

## Vercel 배포

1. 이 저장소를 Vercel에서 **Add New → Project**로 가져옵니다(프레임워크 자동 인식: Next.js).
2. Environment Variables에 `.env.example`의 키를 넣습니다: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL`(배포 주소, 예: `https://meonjeo.vercel.app`).
3. Deploy 후, Supabase의 Site URL·Redirect URLs를 배포 주소로 갱신합니다.

## RLS 점검

로컬 PostgreSQL로 권한 규칙을 확인하는 스크립트가 `supabase/tests/`에 있습니다. 사용법은 [supabase/tests/README.md](./supabase/tests/README.md)를 보세요.

## 폴더 구조

```
src/
  app/                 화면(라우트)
  components/          공용 컴포넌트 (대기자 폼, 프롬프트 패널, 상세페이지 뷰, 마크다운 뷰)
  lib/prompts/         AI 프롬프트 템플릿(순수 함수) + 테스트 — 단계 8에서 API 연동 시 재사용
  lib/designer/        설계기 예시 3종, 설계서 마크다운 파서
  lib/validation/      zod 입력 검증
  lib/supabase/        서버·브라우저·proxy용 Supabase 클라이언트
  proxy.ts             세션 쿠키 갱신 (Next.js 16의 middleware)
supabase/migrations/   스키마·RLS·시드 SQL
```
