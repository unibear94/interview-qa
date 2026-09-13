-- answers 테이블에 이메일 컬럼 추가 (관리자 화면에서 누가 쓴 답변인지 보기 위함)
alter table answers add column if not exists user_email text;

-- 관리자는 모든 학생의 답변을 볼 수 있음 (기존 "본인 것만" 정책과 함께 적용됨)
create policy "answers_select_admin" on answers for select using (
  exists (select 1 from admins where admins.email = auth.email())
);

-- 관리자만 코멘트 작성 가능
create policy "comments_insert_admin" on comments for insert with check (
  exists (select 1 from admins where admins.email = auth.email())
);

-- 관리자는 모든 코멘트 조회 가능
create policy "comments_select_admin" on comments for select using (
  exists (select 1 from admins where admins.email = auth.email())
);
