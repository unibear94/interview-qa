-- 개인정보 수집 동의 기록 테이블
create table consent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text,
  full_name text,
  consent_version text default 'v1',
  agreed_at timestamp with time zone default now()
);

alter table consent_logs enable row level security;

-- 가입 과정에서 로그인 세션이 완전히 생기기 전에 기록되는 경우가 있어 insert는 누구나 가능하게 허용
-- (동의 "여부"를 기록하는 로그일 뿐이라 insert 자체는 민감하지 않음)
create policy "consent_logs_insert_any" on consent_logs for insert with check (true);

-- 조회는 관리자만 가능
create policy "consent_logs_select_admin" on consent_logs for select using (
  exists (select 1 from admins where admins.email = auth.email())
);
