'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('가입 완료! 이메일 인증 후 로그인해주세요.');
    }
  }

  return (
    <div>
      <h2>{mode === 'login' ? '로그인' : '회원가입'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
        </div>
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
