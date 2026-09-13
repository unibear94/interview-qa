-- 답변 테이블에 학생 이름 컬럼 추가 (회원가입 시 입력한 이름 저장용)
alter table answers add column if not exists user_name text;
