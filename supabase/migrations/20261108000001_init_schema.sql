-- =====================================================================
-- 먼저가본(인생공략집) 초기 스키마 — CLAUDE.md 8장 기준
-- 모든 테이블에 RLS를 켜고, admin 권한은 public.is_admin()으로 판별한다.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1. 프로필 (auth.users 1:1)
-- ---------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'mentee'
    check (role in ('mentee', 'candidate', 'mentor', 'admin')),
  email text, -- 운영자 화면 식별용 (가입 시 auth.users에서 복사)
  display_name text,
  phone text, -- 선택 입력(phone_optional)
  marketing_consent boolean not null default false,
  privacy_consented_at timestamptz,
  created_at timestamptz not null default now()
);
comment on column public.profiles.phone is '선택 입력 연락처';

-- 현재 로그인 사용자의 역할 (RLS 안에서 재귀 없이 쓰기 위해 security definer)
create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false)
$$;

-- 회원가입 시 프로필 자동 생성 (역할 기본값 mentee)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, marketing_consent, privacy_consented_at)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    coalesce((new.raw_user_meta_data ->> 'marketing_consent')::boolean, false),
    case when (new.raw_user_meta_data ->> 'privacy_consent')::boolean then now() end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 일반 사용자가 자기 역할을 바꾸지 못하게 막는다 (SQL 편집기 등 auth.uid() 없는 접속은 허용)
create or replace function public.guard_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception '역할은 운영자만 변경할 수 있습니다.';
  end if;
  return new;
end;
$$;

create trigger guard_profile_role
  before update on public.profiles
  for each row execute function public.guard_profile_role();

-- ---------------------------------------------------------------------
-- 2. 분야
-- ---------------------------------------------------------------------
create table public.fields (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort int not null default 0,
  is_active boolean not null default true
);

-- ---------------------------------------------------------------------
-- 3. 대기자
-- ---------------------------------------------------------------------
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null,
  role_interest text not null check (role_interest in ('mentee', 'mentor')),
  field_slug text references public.fields (slug) on update cascade,
  note text,
  privacy_consent boolean not null,
  created_at timestamptz not null default now(),
  constraint waitlist_privacy_required check (privacy_consent = true)
);
-- 이메일 중복 방지 (대소문자 무시)
create unique index waitlist_email_unique on public.waitlist (lower(email));

-- ---------------------------------------------------------------------
-- 4. 멘토 프로필
-- ---------------------------------------------------------------------
create table public.mentor_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  headline text,
  bio text,
  experience_text text,
  keywords text[] not null default '{}',
  field_slugs text[] not null default '{}',
  is_founding boolean not null default false,
  certified_at timestamptz,
  status text not null default 'candidate'
    check (status in ('candidate', 'certified', 'suspended'))
);

-- 인증 상태·파운딩 여부·인증일은 운영자만 변경
create or replace function public.guard_mentor_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or public.is_admin() then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.status := 'candidate';
    new.is_founding := false;
    new.certified_at := null;
  else
    new.status := old.status;
    new.is_founding := old.is_founding;
    new.certified_at := old.certified_at;
  end if;
  return new;
end;
$$;

create trigger guard_mentor_profile
  before insert or update on public.mentor_profiles
  for each row execute function public.guard_mentor_profile();

-- ---------------------------------------------------------------------
-- 5. 아카데미: 기수·수강·과제
-- ---------------------------------------------------------------------
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null check (kind in ('workshop', 'camp')),
  starts_on date,
  ends_on date,
  price int not null default 0 check (price >= 0),
  status text not null default 'draft'
    check (status in ('draft', 'open', 'running', 'closed'))
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references public.cohorts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'applied'
    check (status in ('applied', 'accepted', 'completed', 'dropped')),
  progress jsonb not null default '{}'::jsonb,
  graduated_at timestamptz,
  unique (cohort_id, user_id)
);

create table public.assignments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.enrollments (id) on delete cascade,
  week int not null check (week between 0 and 4),
  kind text not null,
  content jsonb not null default '{}'::jsonb,
  file_path text,
  submitted_at timestamptz not null default now(),
  reviewed boolean not null default false
);

-- ---------------------------------------------------------------------
-- 6. 공략 과정
-- ---------------------------------------------------------------------
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  field_slug text not null references public.fields (slug) on update cascade,
  design_markdown text,
  title text,
  one_liner text,
  target text,
  before text,
  after text,
  sessions jsonb not null default '[]'::jsonb,
  prep text[] not null default '{}',
  notice text,
  price int check (price is null or price >= 0),
  headlines text[] not null default '{}',
  checks text[] not null default '{}',
  session_count int not null default 4 check (session_count in (2, 3, 4, 6)),
  minutes int not null default 60 check (minutes in (30, 60, 90)),
  mode text not null default 'online' check (mode in ('online', 'offline', 'hybrid')),
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create index courses_mentor_idx on public.courses (mentor_id);
create index courses_field_status_idx on public.courses (field_slug, status);

-- 멘토는 draft/review만 지정 가능, 게시·숨김은 운영자만
create or replace function public.guard_course_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  if auth.uid() is null or public.is_admin() then
    if new.status = 'published' and new.published_at is null then
      new.published_at := now();
    end if;
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'review') then
      raise exception '과정 게시는 운영자 승인 후에만 가능합니다.';
    end if;
    new.published_at := null;
  else
    if new.status is distinct from old.status
       and new.status not in ('draft', 'review') then
      raise exception '과정 게시는 운영자 승인 후에만 가능합니다.';
    end if;
    -- 게시된 과정을 멘토가 수정하면 다시 검토 대기로 돌린다
    if old.status = 'published' and new.status = 'published' then
      new.status := 'review';
    end if;
    new.published_at := old.published_at;
  end if;
  return new;
end;
$$;

create trigger guard_course_status
  before insert or update on public.courses
  for each row execute function public.guard_course_status();

-- ---------------------------------------------------------------------
-- 7. 공략 찾기: 요청서·매칭 추천
-- ---------------------------------------------------------------------
create table public.need_requests (
  id uuid primary key default gen_random_uuid(),
  mentee_id uuid references public.profiles (id) on delete set null,
  raw_text text,
  summary jsonb not null default '{}'::jsonb,
  field_slug text references public.fields (slug) on update cascade,
  created_at timestamptz not null default now()
);

create table public.match_suggestions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.need_requests (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  score int check (score between 0 and 100),
  reasons text[] not null default '{}',
  confirm_question text,
  admin_approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 8. 신청·회차 리포트·후기
-- ---------------------------------------------------------------------
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  mentee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'inquiry'
    check (status in ('inquiry', 'confirmed', 'in_progress', 'done', 'cancelled')),
  preferred_schedule text,
  message text,
  created_at timestamptz not null default now()
);

create table public.session_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings (id) on delete cascade,
  session_n int not null check (session_n >= 1),
  mentor_memo text,
  ai_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (booking_id, session_n)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings (id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now()
);

-- 단계 8에서 사용. 테이블만 미리 만든다.
create table public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  feature text not null,
  model text,
  input_tokens int,
  output_tokens int,
  ok boolean not null default true,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- 권한(GRANT) — RLS가 실제 접근을 걸러낸다
-- =====================================================================
grant usage on schema public to anon, authenticated;
grant select on public.fields, public.courses, public.mentor_profiles, public.cohorts, public.reviews to anon;
grant insert on public.waitlist to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin(), public.my_role() to anon, authenticated;

-- =====================================================================
-- RLS 정책
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.fields enable row level security;
alter table public.waitlist enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.cohorts enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.courses enable row level security;
alter table public.need_requests enable row level security;
alter table public.match_suggestions enable row level security;
alter table public.bookings enable row level security;
alter table public.session_reports enable row level security;
alter table public.reviews enable row level security;
alter table public.ai_usage_logs enable row level security;

-- profiles: 본인·admin만 (이메일·연락처가 있으므로 공개 읽기 없음 → 공개용은 public_profiles 뷰)
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- fields: 공개 읽기, admin 관리
create policy fields_select_all on public.fields for select using (true);
create policy fields_admin_all on public.fields for all using (public.is_admin()) with check (public.is_admin());

-- waitlist: 누구나 동의 후 등록, 읽기·삭제는 admin
create policy waitlist_insert_any on public.waitlist
  for insert to anon, authenticated with check (privacy_consent = true);
create policy waitlist_admin_select on public.waitlist for select using (public.is_admin());
create policy waitlist_admin_delete on public.waitlist for delete using (public.is_admin());

-- mentor_profiles: 인증 멘토 공개 읽기, 본인 작성·수정(상태는 트리거가 잠금), admin 전체
create policy mentor_profiles_select on public.mentor_profiles
  for select using (status = 'certified' or user_id = auth.uid() or public.is_admin());
create policy mentor_profiles_insert_own on public.mentor_profiles
  for insert with check (user_id = auth.uid() or public.is_admin());
create policy mentor_profiles_update_own on public.mentor_profiles
  for update using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());
create policy mentor_profiles_admin_delete on public.mentor_profiles for delete using (public.is_admin());

-- cohorts: 공개된 기수 읽기, admin 관리
create policy cohorts_select on public.cohorts
  for select using (status <> 'draft' or public.is_admin());
create policy cohorts_admin_all on public.cohorts for all using (public.is_admin()) with check (public.is_admin());

-- enrollments: 본인 신청·읽기, admin 전체
create policy enrollments_select on public.enrollments
  for select using (user_id = auth.uid() or public.is_admin());
create policy enrollments_insert_own on public.enrollments
  for insert with check (user_id = auth.uid() and status = 'applied');
create policy enrollments_admin_update on public.enrollments
  for update using (public.is_admin()) with check (public.is_admin());
create policy enrollments_admin_delete on public.enrollments for delete using (public.is_admin());

-- assignments: 본인 수강 건의 과제만, admin 전체
create policy assignments_select on public.assignments
  for select using (
    public.is_admin()
    or exists (select 1 from public.enrollments e where e.id = assignments.enrollment_id and e.user_id = auth.uid())
  );
create policy assignments_insert_own on public.assignments
  for insert with check (
    reviewed = false
    and exists (select 1 from public.enrollments e where e.id = assignments.enrollment_id and e.user_id = auth.uid())
  );
create policy assignments_update on public.assignments
  for update using (
    public.is_admin()
    or exists (select 1 from public.enrollments e where e.id = assignments.enrollment_id and e.user_id = auth.uid())
  );
create policy assignments_admin_delete on public.assignments for delete using (public.is_admin());

-- courses: 게시 과정 공개, 예비·인증 멘토는 본인 과정 관리(상태는 트리거가 잠금), admin 전체
create policy courses_select on public.courses
  for select using (status = 'published' or mentor_id = auth.uid() or public.is_admin());
create policy courses_insert_own on public.courses
  for insert with check (
    mentor_id = auth.uid() and public.my_role() in ('candidate', 'mentor', 'admin')
  );
create policy courses_update_own on public.courses
  for update using (mentor_id = auth.uid() or public.is_admin())
  with check (mentor_id = auth.uid() or public.is_admin());
create policy courses_delete_own on public.courses
  for delete using ((mentor_id = auth.uid() and status = 'draft') or public.is_admin());

-- need_requests: 멘티 고민은 본인과 admin만
create policy need_requests_select on public.need_requests
  for select using (mentee_id = auth.uid() or public.is_admin());
create policy need_requests_insert_own on public.need_requests
  for insert with check (mentee_id = auth.uid());
create policy need_requests_update_own on public.need_requests
  for update using (mentee_id = auth.uid() or public.is_admin());
create policy need_requests_delete_own on public.need_requests
  for delete using (mentee_id = auth.uid() or public.is_admin());

-- match_suggestions: admin 작성, 멘티는 공개 승인된 본인 추천만 읽기
create policy match_suggestions_select on public.match_suggestions
  for select using (
    public.is_admin()
    or (admin_approved and exists (
      select 1 from public.need_requests r where r.id = match_suggestions.request_id and r.mentee_id = auth.uid()
    ))
  );
create policy match_suggestions_admin_all on public.match_suggestions
  for all using (public.is_admin()) with check (public.is_admin());

-- bookings: 멘티 본인 신청(inquiry), 과정 멘토는 읽기·상태 변경, admin 전체
create policy bookings_select on public.bookings
  for select using (
    mentee_id = auth.uid()
    or public.is_admin()
    or exists (select 1 from public.courses c where c.id = bookings.course_id and c.mentor_id = auth.uid())
  );
create policy bookings_insert_own on public.bookings
  for insert with check (
    mentee_id = auth.uid() and status = 'inquiry'
    and exists (select 1 from public.courses c where c.id = bookings.course_id and c.status = 'published')
  );
create policy bookings_update on public.bookings
  for update using (
    public.is_admin()
    or exists (select 1 from public.courses c where c.id = bookings.course_id and c.mentor_id = auth.uid())
  );

-- session_reports: 과정 멘토 작성, 해당 멘티 읽기, admin 전체
create policy session_reports_select on public.session_reports
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b join public.courses c on c.id = b.course_id
      where b.id = session_reports.booking_id and (b.mentee_id = auth.uid() or c.mentor_id = auth.uid())
    )
  );
create policy session_reports_mentor_write on public.session_reports
  for insert with check (
    public.is_admin()
    or exists (
      select 1 from public.bookings b join public.courses c on c.id = b.course_id
      where b.id = session_reports.booking_id and c.mentor_id = auth.uid()
    )
  );
create policy session_reports_mentor_update on public.session_reports
  for update using (
    public.is_admin()
    or exists (
      select 1 from public.bookings b join public.courses c on c.id = b.course_id
      where b.id = session_reports.booking_id and c.mentor_id = auth.uid()
    )
  );

-- reviews: 게시 과정 후기는 공개, 해당 멘티만 작성
create policy reviews_select on public.reviews for select using (true);
create policy reviews_insert_own on public.reviews
  for insert with check (
    exists (select 1 from public.bookings b where b.id = reviews.booking_id and b.mentee_id = auth.uid())
  );
create policy reviews_admin_all on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ai_usage_logs: 본인 기록 읽기, admin 전체 (기록은 단계 8 서버에서)
create policy ai_usage_logs_select on public.ai_usage_logs
  for select using (user_id = auth.uid() or public.is_admin());
create policy ai_usage_logs_insert_own on public.ai_usage_logs
  for insert with check (user_id = auth.uid());

-- =====================================================================
-- 공개용 멘토 이름 뷰: 인증 멘토·게시 과정 멘토의 표시 이름만 노출 (이메일·연락처 제외)
-- =====================================================================
create view public.public_profiles as
  select p.id, p.display_name
  from public.profiles p
  where exists (select 1 from public.mentor_profiles m where m.user_id = p.id and m.status = 'certified')
     or exists (select 1 from public.courses c where c.mentor_id = p.id and c.status = 'published');
grant select on public.public_profiles to anon, authenticated;
