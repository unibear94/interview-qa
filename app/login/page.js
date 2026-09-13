'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push('/mypage');
      return;
    }

    // 회원가입
    if (!agreed) {
      setMessage('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    // 동의 기록 남기기
    await supabase.from('consent_logs').insert({
      user_id: data.user?.id || null,
      email,
      full_name: name,
    });

    setMessage('가입 완료! 이메일 인증 후 로그인해주세요.');
  }

  return (
    <div>
      <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <div className="field">
            <label>이름</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="실명을 입력해주세요" />
          </div>
        )}
        <div className="field">
          <label>이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>

        {mode === 'signup' && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <label>
              (필수) 개인정보(이름, 이메일) 수집 및 이용에 동의합니다.{' '}
              <Link href="/consent" target="_blank" className="link">전문 보기</Link>
            </label>
          </div>
        )}

        <button type="submit" style={{ width: '100%' }}>{mode === 'login' ? '로그인' : '가입하기'}</button>
      </form>
      {message && <p style={{ color: '#d33', fontSize: 13 }}>{message}</p>}
      <p style={{ fontSize: 13, marginTop: 12 }}>
        {mode === 'login' ? (
          <>계정이 없으신가요? <a className="link" onClick={() => setMode('signup')} style={{ cursor: 'pointer' }}>회원가입</a></>
        ) : (
          <>이미 계정이 있으신가요? <a className="link" onClick={() => setMode('login')} style={{ cursor: 'pointer' }}>로그인</a></>
        )}
      </p>
    </div>
  );
}
