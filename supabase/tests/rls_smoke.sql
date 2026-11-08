-- RLS 점검 시나리오. 실행 방법은 supabase/tests/README.md
\set ON_ERROR_STOP 0
insert into auth.users (id,email,raw_user_meta_data) values
 ('00000000-0000-0000-0000-00000000000a','admin@ex.com','{"display_name":"운영자","privacy_consent":true}'),
 ('00000000-0000-0000-0000-00000000000b','mentee@ex.com','{}'),
 ('00000000-0000-0000-0000-00000000000c','cand@ex.com','{}');
update public.profiles set role='admin' where id='00000000-0000-0000-0000-00000000000a';
update public.profiles set role='candidate' where id='00000000-0000-0000-0000-00000000000c';
select id, role, display_name, privacy_consented_at is not null as consent from public.profiles order by id;
-- anon 대기자 등록
reset request.jwt.claim.sub;
set role anon;
insert into public.waitlist (email,name,role_interest,field_slug,privacy_consent) values ('A@ex.com','가','mentee','career',true);
\echo '--- 중복(대소문자) 기대: unique 오류'
insert into public.waitlist (email,name,role_interest,field_slug,privacy_consent) values ('a@ex.com','가','mentee','career',true);
\echo '--- 동의 없음 기대: 오류'
insert into public.waitlist (email,name,role_interest,field_slug,privacy_consent) values ('b@ex.com','나','mentor','tourism',false);
\echo '--- anon 대기자 조회 기대: 권한 오류'
select count(*) from public.waitlist;
select slug,name from public.fields order by sort;
reset role;
-- 멘티
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000b';
\echo '--- 멘티 대기자 조회 기대: 0'
select count(*) from public.waitlist;
\echo '--- 멘티 역할 변경 기대: 오류'
update public.profiles set role='admin' where id='00000000-0000-0000-0000-00000000000b';
\echo '--- 멘티 과정 작성 기대: RLS 오류'
insert into public.courses (mentor_id, field_slug, design_markdown) values ('00000000-0000-0000-0000-00000000000b','career','x');
\echo '--- 멘티 프로필 조회 기대: 본인 1건'
select count(*) from public.profiles;
reset role;
-- 예비 멘토
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000c';
insert into public.courses (mentor_id, field_slug, design_markdown, title) values ('00000000-0000-0000-0000-00000000000c','tourism','# 설계','초안');
\echo '--- 예비 멘토 게시 시도 기대: 오류'
update public.courses set status='published';
update public.courses set status='review' returning status;
insert into public.mentor_profiles (user_id, headline, status, is_founding) values ('00000000-0000-0000-0000-00000000000c','예시','certified',true) returning status, is_founding;
reset role;
-- 관리자
set role authenticated; set request.jwt.claim.sub='00000000-0000-0000-0000-00000000000a';
select count(*) as waitlist_admin from public.waitlist;
update public.profiles set role='mentor' where id='00000000-0000-0000-0000-00000000000b' returning role;
update public.courses set status='published' returning status, published_at is not null as pub;
reset role;
-- anon은 게시 과정만
reset request.jwt.claim.sub;
set role anon;
select title, status from public.courses;
\echo '--- anon 프로필 직접 조회 기대: 권한 오류'
select display_name from public.profiles;
\echo '--- anon 공개 이름 뷰 기대: 게시 과정 멘토 1건'
select * from public.public_profiles;
reset role;
