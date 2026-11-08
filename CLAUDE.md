# 먼저가본 (인생공략집) — 프로젝트 명세

## 1. 서비스 한 줄 정의
경험자를 '공략집 출시 캠프'로 양성해 자기 경험을 4회차 '공략 과정'으로 출시하게 하고, 멘티에게는 AI로 고민을 정리해 맞는 멘토를 추천하는 경험 기반 멘토링 플랫폼.
- 브랜드: 먼저가본 / 서브타이틀: 인생공략집
- 슬로건: "먼저 가본 사람이 1% 앞을 보여줍니다"
- 운영자: 홍요셉 (HRD 교육기획 14년, 한국관광공사 관광일자리센터 3,000명+ 취업 서비스 운영)

## 2. 핵심 구조 (반드시 지킬 것)
- 선(先) 멘토 양성 → 후(後) 마켓. 멘토는 출시 캠프를 수료해야 과정을 게시할 수 있다.
- 한 플랫폼, 두 출입구: 멘티 문 = "공략 찾기", 멘토 문 = "공략 만들기(아카데미)".
- 차별점은 매칭이 아니라 ① 멘토 양성·인증 ② AI 과정 설계 ③ 회차별 결과물(아웃풋) 검증이다.
- 공략 과정 기본형: 4회차, 회당 60분, 온라인. 매 회차에 멘티가 손에 쥐는 결과물이 있어야 한다.

## 3. 핵심 분야 (MVP에서는 이 3개만)
- 01 취업·이직 공략 (career) — 서류·면접·직무, 진로 탐색 포함
- 02 관광 커리어 공략 (tourism) — 관광통역안내사·여행사·MICE·호텔·관광공기업
- 03 경험 수익화·1인 창업 공략 (venture) — 경험 상품화, SNS 운영, 세무·회계 기초
연애·결혼·육아는 만들지 않는다. 분야는 DB 테이블로 관리해 나중에 추가할 수 있게만 설계한다.

## 4. 사용자 역할
- guest: 둘러보기, 대기자 등록, 니즈 정리 체험
- mentee: 공략 요청서 저장, 과정 신청, 내 공략 노트, 후기
- candidate (예비 멘토): 아카데미 신청, 캠프 진도·과제 제출, 공략 설계기 사용
- mentor (인증 멘토): 과정 게시·수정, 일정 오픈, 회차 리포트 작성, 신청 관리
- admin (운영자): 모든 데이터, 캠프·기수 관리, 멘토 인증 승인, 매칭 검수, 과정 게시 승인
founding 멘토(1기)는 mentor_profiles.is_founding = true로 표시하고 "파운딩 멘토" 배지를 노출한다.

## 5. 기술 스택
- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase: Auth(이메일 매직링크 + 카카오 로그인은 나중에), Postgres, Row Level Security, Storage
- AI(MVP): **API 연동 없음.** 각 AI 기능은 "프롬프트 생성기"로 구현한다. 사용자가 입력하면 프롬프트 텍스트를 만들어 보여주고, 복사 버튼으로 자기 AI에 붙여넣게 한다. 필요한 화면에는 "AI 답 붙여넣기" 칸을 두어 결과를 저장할 수 있게 한다.
- 프롬프트 템플릿은 lib/prompts/ 아래 순수 함수(입력 → 문자열)로 만들고 단위 테스트한다. 나중에 API를 붙일 때 같은 템플릿을 재사용한다.
- AI(단계 8, 추가 기능): Anthropic TypeScript SDK(@anthropic-ai/sdk)로 서버 Route Handler에서만 호출. 모델은 환경변수 ANTHROPIC_MODEL(기본 claude-sonnet-5-5), 가벼운 작업은 ANTHROPIC_MODEL_FAST(기본 claude-haiku-5-5). 지금은 설치하지 않는다.
- 입력 검증: zod.
- 배포: Vercel. 환경변수는 .env.local / Vercel에만 두고 절대 커밋하지 않는다.
- 결제: MVP에는 넣지 않는다. 신청은 "신청 접수(inquiry)" 상태로만 받는다. (사업자등록 후 토스페이먼츠 연동 단계에서 추가)

## 6. 디자인 규칙
- 흰 배경, 라이트 테마. 강조색은 오렌지 #d9731c 하나만. 구조색 네이비 #1d3a5f, 본문 #14202e, 보조 #586577, 선 #e1e5eb, 패널 #f5f7fa, 강조 연한 배경 #fdf1e4.
- 폰트: Pretendard(CDN) 기본. 제목도 Pretendard 굵기로 처리.
- 모든 한글 텍스트에 word-break: keep-all; overflow-wrap: break-word.
- 모바일 우선. 390px에서 가로 스크롤 0. 표는 모바일에서 카드형으로 세로 적층.
- 이모지를 섹션 아이콘으로 쓰지 않는다. 번호(01/02/03)는 분야 번호처럼 실제 의미가 있을 때만.
- 버튼 문구는 동작을 그대로 말한다("과정 게시하기", "신청 접수하기").
- UI 언어는 한국어 경어체. 코드 주석도 한국어.

## 7. 정보 구조 (라우트)
- /                       홈: "지금 어떤 길 앞에 서 있나요?" 입력창 + 3개 분야 카드 + 대기자 등록
- /fields/[slug]          분야별 공략집: 게시된 과정 목록
- /courses/[id]           과정 상세페이지(멘티용): 헤드카피, 멘토 프로필·배지, Before/After, 회차별 공략, 가격, 신청 접수
- /find                   공략 찾기: 고민 입력 → AI 공략 요청서 → 추천 멘토 3명(이유 포함)
- /me/notes               내 공략 노트(멘티): 신청 내역, 회차 요약, 다음 과제
- /academy                아카데미 소개 + 진입 워크숍·출시 캠프 기수 신청
- /academy/camp           캠프 수강 화면(candidate): 0~4주차 진도, 과제 제출, 통과 기준 체크
- /studio                 멘토 스튜디오 홈
- /studio/designer        AI 공략 설계기
- /studio/courses         내 과정 목록·편집·게시 요청
- /studio/bookings        신청 관리, 회차 리포트 작성
- /admin                  운영자: 대기자, 기수, 수강생 진도, 멘토 인증 승인, 과정 게시 승인, 매칭 검수, AI 사용량

## 8. 데이터 모델 (Supabase Postgres, 모든 테이블 RLS 적용)
- profiles(id=auth.uid, role, display_name, phone_optional, marketing_consent, created_at)
- fields(id, slug[career|tourism|venture], name, sort, is_active)
- waitlist(id, email, name, role_interest[mentee|mentor], field_slug, note, privacy_consent, created_at)
- mentor_profiles(user_id, headline, bio, experience_text, keywords text[], field_slugs text[], is_founding bool, certified_at, status[candidate|certified|suspended])
- cohorts(id, name, kind[workshop|camp], starts_on, ends_on, price, status[draft|open|running|closed])
- enrollments(id, cohort_id, user_id, status[applied|accepted|completed|dropped], progress jsonb, graduated_at)
- assignments(id, enrollment_id, week[0-4], kind, content jsonb, file_path, submitted_at, reviewed bool)
- courses(id, mentor_id, field_slug, design_markdown, title, one_liner, target, before, after, sessions jsonb, prep text[], notice, price, headlines text[], checks text[], session_count, minutes, mode, status[draft|review|published|hidden], created_at, published_at)
- need_requests(id, mentee_id nullable, raw_text, summary jsonb, field_slug, created_at)
- match_suggestions(id, request_id, course_id, score, reasons text[], confirm_question, admin_approved bool, created_at)
- bookings(id, course_id, mentee_id, status[inquiry|confirmed|in_progress|done|cancelled], preferred_schedule, message, created_at)
- session_reports(id, booking_id, session_n, mentor_memo, ai_summary jsonb, created_at)
- reviews(id, booking_id, rating 1-5, body, created_at)
- ai_usage_logs(id, user_id, feature, model, input_tokens, output_tokens, ok, created_at) — 단계 8에서 사용, 테이블만 미리 생성
RLS 원칙: 본인 데이터만 읽기·쓰기, 게시된 과정·인증 멘토 프로필은 공개 읽기, admin은 전체. 멘티 고민(raw_text)은 본인과 admin만 읽는다.

## 9. AI 기능 명세
MVP 구현 방식(공통 "프롬프트 생성기" 컴포넌트):
  입력 폼 → [프롬프트 만들기] → 3단계 안내(복사 → 내 AI 열기 → 붙여넣기) + 프롬프트 텍스트 + [복사] 버튼 + "AI 답을 받은 뒤 확인할 것" 체크리스트 + (필요 시) "AI 답 붙여넣기" 칸과 [저장]
  프롬프트는 마크다운 출력 형식(제목·순서 고정, 표 포함)을 지정해 사람이 읽기 좋게 받게 한다.
  아래 각 기능의 "출력" 항목은 프롬프트 안의 출력 형식으로 쓰고, 단계 8에서 API로 바꿀 때 JSON 스키마로 그대로 옮긴다.
공통 규칙(모든 프롬프트에 포함): 한국어 경어체, 짧고 구체적으로. 합격·수익·성과 보장 표현 금지. 입력에 없는 경력·수치를 지어내지 않는다.


① 경험 진단 — 대상: candidate (MVP: 프롬프트 생성, 단계 8: POST /api/ai/experience)
  입력: 경력·자격·성공/실패 경험 자유 서술
  출력: { assets:[{title, why_sellable, who_needs}](3개), recommended_field, one_sentence:"나는 ○○한 사람이 ○○하도록 돕는다" }

② 공략 설계기 — 대상: candidate, mentor (MVP: 프롬프트 생성, 단계 8: POST /api/ai/course-design)
  입력: field, experience, who, final_output, session_count(2|3|4|6), minutes(30|60|90), mode, desired_price(optional), keywords
  출력: { title(30자 이내), oneLiner(60자 이내), target, before, after,
          sessions:[{n, goal, activities, output, homework}] (정확히 session_count개, 마지막 output = final_output),
          prep:[...], notice(3문장), price:{amount, reason}, headlines:[3개], checks:[2~3개] }
  가격 권장 구간: career·tourism 4회 기준 15~25만 원, venture 4회 기준 30~40만 원, 회차·시간에 비례 조정.
  checks에는 멘토가 출시 전 확인할 사실·법규·개인정보·표현 문제를 넣는다.
  MVP: 멘토가 AI 답(마크다운)을 "AI 답 붙여넣기" 칸에 넣으면 courses.design_markdown에 저장하고, 과정 편집 폼(제목·한 줄 소개·대상·Before/After·회차표·준비물·안내문·가격·헤드카피)은 멘토가 그 내용을 보며 직접 채운다. 마크다운 표를 회차표로 자동 채우는 "가져오기" 버튼은 있으면 좋지만 실패해도 수동 입력이 가능해야 한다.
  출력 형식(프롬프트에 그대로 넣을 것): 1 과정명(30자 이내) / 2 한 줄 소개(60자 이내) / 3 대상 / 4 Before→After / 5 회차별 공략 표(회차|목표|진행 내용|멘티가 가져가는 결과물|과제, 정확히 session_count행) / 6 준비물 / 7 교육 안내문 3문장 / 8 추천 가격과 근거 / 9 헤드카피 3안 / 10 출시 전 멘토 확인 사항 2~3개 / 11 멘토에게 묻고 싶은 질문 2개

③ 니즈 정리 — 대상: guest, mentee (MVP: 구조화 질문 폼 + 선택적 프롬프트, 단계 8: POST /api/ai/need-summary)
  입력: 고민 자유 서술(3~5문장)
  출력: { current_position, goal, blocker, needed_output, timeline, budget_hint, field_slug, clarifying_question }
  MVP: 멘티가 5개 질문(지금 어디에 있나요 / 어디로 가고 싶나요 / 무엇이 막혔나요 / 어떤 결과물이 필요한가요 / 언제까지·예산은)에 직접 답해 공략 요청서를 만든다. 서술이 어려운 사람을 위해 "내 AI로 정리하기" 프롬프트도 제공하고, 정리 결과를 붙여넣을 수 있게 한다. 저장은 로그인 후.

④ 매칭 추천 — 대상: mentee (MVP: 운영자 수동 매칭, 단계 8: POST /api/ai/match)
  1차: field_slug 일치 + published 과정만 후보로 필터, 최대 20개
  2차: 요청서와 후보 과정(제목·대상·결과물·회차 목표·멘토 headline·평균 평점)을 프롬프트에 넣어 LLM이 순위화
  출력: { picks:[{course_id, score 0-100, reasons:[3줄], caution}] (최대 3개), confirm_question }
  MVP: admin 화면에서 요청서와 같은 분야의 게시 과정 목록을 나란히 보고 운영자가 최대 3개를 골라 추천 이유 3줄을 직접 쓴다(운영자용 "추천 이유 초안 만들기" 프롬프트 복사 버튼 제공).
  "추천은 참고용이며 최종 선택은 멘티가 합니다" 문구를 항상 표시.
  나중에 pgvector 임베딩으로 1차 필터를 바꿀 수 있게 함수 분리.

⑤ 회차 리포트 — 대상: mentor (MVP: 프롬프트 생성 + 결과 붙여넣기, 단계 8: POST /api/ai/session-report)
  입력: course 정보 + session_n + 멘토 메모 3줄
  출력: { mentee_summary, next_homework, mentor_quality_flags[], institution_note }

## 10. 공략집 출시 캠프 (아카데미) 규칙
- 0주차 진입 워크숍 "내 경험 값 매기기"(2시간) → 1주 경험을 공략으로 → 2주 4회차 설계 → 3주 파일럿·멘토링 기술 → 4주 출시와 첫 판매
- 주차별 통과 기준: 1주 잠재 멘티 인터뷰 3명 + Before/After 1장 / 2주 과정 설계서 + 피어 리뷰 2건 / 3주 파일럿 후기 3건 + 회차 리포트 / 4주 상품 게시
- 수료 조건 = 과정 게시 + 파일럿 후기 3건. admin 승인 시 mentor_profiles.status = certified, 인증 배지 발급.
- 인증 유지: 회차 리포트 제출률 90%+, 평균 후기 4.5+ (미달 시 admin 화면에 경고)
- 기수 가격 정책은 cohorts.price로 관리(1기 0원, 2기 9.9만, 3기~ 19.9만). 결제는 아직 없음.

## 11. 개인정보·안전
- 개인정보 수집·이용 동의 체크박스(대기자, 회원가입, 니즈 입력 저장 시). 동의 문구 초안을 /legal/privacy에 만든다.
- 멘티 고민·이력서는 매칭 외 목적으로 쓰지 않는다. AI 호출 시 이름·연락처는 프롬프트에서 제거한다.
- 멘토·멘티 간 외부 연락처 교환 유도 문구를 과정 상세·메시지에서 막는다(전화번호·이메일 패턴 경고).
- 홍보·상세페이지에 "합격 보장", "수익 보장" 문구가 들어가면 게시 요청 시 경고한다.

## 12. 작업 방식
- 한 번에 한 단계만. 단계가 끝나면 무엇을 만들었는지, 어떻게 확인하는지(로컬 URL·테스트 계정), 남은 문제를 짧게 보고하고 멈춘다.
- 각 단계마다 타입 검사(tsc), 린트, 핵심 로직 단위 테스트, 390px·1280px 화면 확인을 통과해야 완료다.
- 시드 데이터는 "예시" 표시가 된 가상 인물만 쓴다. 실제 인물 이름을 지어내지 않는다.
- 비밀값은 .env.example에 키 이름만 적는다.
- 확실하지 않은 라이브러리 API는 추측하지 말고 공식 문서를 확인한 뒤 쓴다.
- 요청받지 않은 기능은 만들지 말고, 제안은 보고 끝에 한 줄로만 한다.

## 13. 구현 메모 (개발 중 확정한 사항)
- Next.js 16.4 기준. `middleware` 대신 `src/proxy.ts`, 요청 API(cookies·params)는 비동기. 버전별 규칙은 node_modules/next/dist/docs 를 먼저 확인한다.
- cacheComponents는 끈다(로그인 상태에 따라 달라지는 동적 화면이 대부분이라 단순한 모델을 쓴다).
- Supabase 키는 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY(또는 레거시 ANON_KEY). 서비스 롤 키는 쓰지 않고 admin 권한은 RLS의 public.is_admin()으로 처리한다.
- 단위 테스트: vitest (`npm test`). 확인 명령: `npm run typecheck && npm run lint && npm test`.
- Next.js 버전 규칙: @AGENTS.md
