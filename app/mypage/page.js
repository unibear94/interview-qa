'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      const { data } = await supabase
        .from('answers')
        .select('*, questions(question_text, org_name)')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      setAnswers(data || []);

      const { data: adminRow } = await supabase.from('admins').select('email').eq('email', u.email).maybeSingle();
      setIsAdmin(!!adminRow);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (!user) return <p>불러오는 중...</p>;

  return (
    <div>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontWeight: 600, margin: 0 }}>{user.email}</p>
          <p className="card-meta">작성한 답변 {answers.length}개</p>
        </div>
        <button className="secondary" onClick={handleLogout}>로그아웃</button>
      </div>

      {isAdmin && (
        <Link href="/admin" className="card" style={{ display: 'block', textDecoration: 'none', color: '#2563eb', fontWeight: 600, textAlign: 'center' }}>
          🛠 관리자 페이지 (학생 답변 &amp; 코멘트)
        </Link>
      )}

      <h3 style={{ fontSize: 14, marginTop: 20 }}>내가 작성한 답변</h3>
      {answers.length === 0 && <p style={{ color: '#888' }}>아직 작성한 답변이 없어요.</p>}
      {answers.map((a) => (
        <div key={a.id} className="card">
          <p className="card-title">{a.questions?.question_text}</p>
          <p className="card-meta">{a.questions?.org_name} · {a.answer_type === 'prep' ? '사전 준비' : '실제 면접'}</p>
        </div>
      ))}
    </div>
  );
}
