# RLS 점검 (로컬 PostgreSQL)

실제 Supabase가 아닌 로컬 PostgreSQL 16에서 스키마와 권한 규칙을 빠르게 확인하는 스크립트입니다.

```bash
createdb meonjeo_test
psql -d meonjeo_test -f supabase/tests/00_local_auth_stub.sql
for f in supabase/migrations/*.sql; do psql -d meonjeo_test -v ON_ERROR_STOP=1 -f "$f"; done
psql -d meonjeo_test -f supabase/tests/rls_smoke.sql
```

`--- ... 기대:` 줄 바로 아래 결과가 기대와 같으면 정상입니다.
