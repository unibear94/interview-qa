-- 관리자(선생님) 이메일 목록 테이블
create table admins (
  email text primary key
);

alter table admins enable row level security;

-- 로그인한 사람이면 누구나 "내가 관리자인지" 조회는 가능하게 (등록은 못함)
create policy "admins_select_all" on admins for select using (true);

-- 본인 이메일을 여기 직접 추가하세요! (아래 이메일을 본인 이메일로 바꾸고 실행)
insert into admins (email) values ('p2205015@gmail.com');

-- 기존 "로그인만 하면 영상 등록 가능" 정책 제거
drop policy if exists "videos_insert_logged_in" on reference_videos;

-- 새 정책: admins 테이블에 등록된 이메일만 영상 등록 가능
create policy "videos_insert_admin_only" on reference_videos for insert with check (
  exists (select 1 from admins where admins.email = auth.email())
);
