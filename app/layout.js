import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: '면접 질문 아카이브',
  description: '학생들을 위한 면접 질문 & 답변 아카이브',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <header className="topnav">
          <Link href="/" className="brand">면접 질문 아카이브</Link>
        </header>
        <main className="container">{children}</main>
        <nav className="bottomnav">
          <Link href="/">질문</Link>
          <Link href="/interview-log">면접기록</Link>
          <Link href="/videos">참고영상</Link>
          <Link href="/mypage">마이페이지</Link>
        </nav>
      </body>
    </html>
  );
}
