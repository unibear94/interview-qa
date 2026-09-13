-- 질문 테이블
create table questions (
  id uuid primary key default gen_random_uuid(),
  interview_type text not null check (interview_type in ('contract_dept','university','company')),
  org_name text,
  department_track text,
  admission_type text,
  category text,
  question_text text not null,
  year int,
  source_note text,
  created_at timestamp with time zone default now()
);

-- 답변 테이블
create table answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  question_id uuid references questions(id) not null,
  answer_type text not null check (answer_type in ('prep','actual')),
  answer_text text,
  created_at timestamp with time zone default now(),
  unique (user_id, question_id, answer_type)
);

-- 면접 후기 테이블
create table interview_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  question_id uuid references questions(id),
  interview_type text,
  org_name text,
  department_track text,
  atmosphere_note text,
  was_pressured boolean,
  duration_minutes int,
  free_note text,
  created_at timestamp with time zone default now()
);

-- 멘토 코멘트 테이블
create table comments (
  id uuid primary key default gen_random_uuid(),
  answer_id uuid references answers(id) not null,
  commenter_id uuid references auth.users(id),
  comment_text text not null,
  created_at timestamp with time zone default now()
);

-- 북마크 테이블
create table bookmarks (
  user_id uuid references auth.users(id) not null,
  question_id uuid references questions(id) not null,
  primary key (user_id, question_id)
);

-- 참고영상 테이블
create table reference_videos (
  id uuid primary key default gen_random_uuid(),
  interview_type text,
  title text not null,
  youtube_url text not null,
  youtube_id text not null,
  org_name text,
  description text,
  added_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- Row Level Security 활성화
alter table questions enable row level security;
alter table answers enable row level security;
alter table interview_reviews enable row level security;
alter table comments enable row level security;
alter table bookmarks enable row level security;
alter table reference_videos enable row level security;

-- 질문: 누구나 읽기 가능 (로그인 없이도 목록 볼 수 있게)
create policy "questions_select_all" on questions for select using (true);
-- 질문 추가/수정은 관리자가 Supabase 대시보드에서 직접 하거나, 별도 관리자 정책을 추가하세요.

-- 답변: 본인 것만 읽기/쓰기
create policy "answers_select_own" on answers for select using (auth.uid() = user_id);
create policy "answers_insert_own" on answers for insert with check (auth.uid() = user_id);
create policy "answers_update_own" on answers for update using (auth.uid() = user_id);

-- 면접 후기: 본인 것만
create policy "reviews_select_own" on interview_reviews for select using (auth.uid() = user_id);
create policy "reviews_insert_own" on interview_reviews for insert with check (auth.uid() = user_id);

-- 코멘트: 답변 주인만 읽기 (필요시 멘토 role 추가해서 확장)
create policy "comments_select_via_answer" on comments for select using (
  exists (select 1 from answers where answers.id = comments.answer_id and answers.user_id = auth.uid())
);

-- 북마크: 본인 것만
create policy "bookmarks_select_own" on bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert_own" on bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete_own" on bookmarks for delete using (auth.uid() = user_id);

-- 참고영상: 누구나 읽기, 로그인한 사람 등록 가능 (필요시 관리자만으로 제한 가능)
create policy "videos_select_all" on reference_videos for select using (true);
create policy "videos_insert_logged_in" on reference_videos for insert with check (auth.uid() is not null);
