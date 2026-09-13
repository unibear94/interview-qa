# 면접 질문 아카이브

학생들을 위한 면접 질문 & 답변 아카이브. 계약학과 / 일반대학 / 일반기업 면접을 모두 지원합니다.

## 기능
- 면접 유형별(계약학과/일반대학/일반기업) 질문 목록 및 필터
- 로그인 후 본인 답변 작성 (사전 준비 답변 / 실제 면접 답변 구분)
- 면접 후기 기록 (기업/대학명, 압박 질문 여부, 분위기 메모)
- 유튜브 링크 기반 참고영상 탭
- 멘토 코멘트 (답변에 대한 첨삭)

## 로컬 실행
```bash
npm install
cp .env.example .env.local
# .env.local 에 Supabase URL / anon key 입력
npm run dev
```

## Supabase 설정
1. https://supabase.com 에서 새 프로젝트 생성
2. 프로젝트 설정 > API 에서 URL, anon key 복사 → `.env.local`에 입력
3. SQL Editor에서 `supabase/schema.sql` 내용 실행 (테이블 + 보안 정책 생성)
4. Authentication > Providers에서 Email 로그인 활성화 확인

## 질문 추가하는 법 (관리자)
Supabase 대시보드 > Table Editor > `questions` 테이블에서 직접 행 추가하면 바로 사이트에 반영됩니다.

## 배포 (Vercel)
1. 이 레포를 GitHub에 push
2. https://vercel.com 에서 GitHub 로그인 후 이 레포 Import
3. 환경변수 설정: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy 클릭
