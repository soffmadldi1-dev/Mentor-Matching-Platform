-- 핵심 분야 3개 시드 (CLAUDE.md 3장). 다시 실행해도 안전하다.
insert into public.fields (slug, name, sort, is_active) values
  ('career',  '취업·이직 공략',          1, true),
  ('tourism', '관광 커리어 공략',         2, true),
  ('venture', '경험 수익화·1인 창업 공략', 3, true)
on conflict (slug) do update
  set name = excluded.name, sort = excluded.sort, is_active = excluded.is_active;
