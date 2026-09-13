'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(null); // null: 확인 중, true/false: 확인 완료
  const [answers, setAnswers] = useState([]);
  const [comments, setComments] = useState({}); // answer_id -> comment 배열
  const [drafts, setDrafts] = useState({}); // answer_id -> 입력 중인 코멘트
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);
      if (!u) { setIsAdmin(false); return; }

      const { data: adminRow } = await supabase.from('admins').select('email').eq('email', u.email).maybeSingle();
      setIsAdmin(!!adminRow);
      if (!adminRow) return;

      const { data: ans } = await supabase
        .from('answers')
        .select('*, questions(question_text, org_name, department_track)')
        .order('created_at', { ascending: false });
      setAnswers(ans || []);

      const answerIds = (ans || []).map((a) => a.id);
      if (answerIds.length) {
        const { data: cmts } = await supabase.from('comments').select('*').in('answer_id', answerIds);
        const grouped = {};
        (cmts || []).forEach((c) => {
          if (!grouped[c.answer_id]) grouped[c.answer_id] = [];
          grouped[c.answer_id].push(c);
        });
        setComments(grouped);
      }
    }
    init();
  }, []);

  async function saveComment(answerId) {
    const text = drafts[answerId];
    if (!text || !text.trim()) return;
    const { data, error } = await supabase
      .from('comments')
      .insert({ answer_id: answerId, commenter_id: user.id, comment_text: text })
      .select()
      .single();
    if (!error) {
      setComments((prev) => ({ ...prev, [answerId]: [...(prev[answerId] || []), data] }));
      setDrafts((prev) => ({ ...prev, [answerId]: '' }));
    }
  }

  if (isAdmin === null) return <p>확인 중...</p>;
  if (isAdmin === false) return <p style={{ color: '#888' }}>관리자만 접근할 수 있는 페이지예요.</p>;

  return (
    <div>
      <h2 style={{ fontSize: 16 }}>학생 답변 &amp; 코멘트</h2>
      {answers.length === 0 && <p style={{ color: '#888' }}>아직 작성된 답변이 없어요.</p>}
      {answers.map((a) => (
        <div key={a.id} className="card">
          <p className="card-title">{a.questions?.question_text}</p>
          <p className="card-meta">
            {a.questions?.org_name} {a.questions?.department_track ? `· ${a.questions.department_track}` : ''} ·{' '}
            {a.answer_type === 'prep' ? '사전 준비' : '실제 면접'} · {a.user_name || a.user_email || '학생'}
          </p>
          <p style={{ fontSize: 13, background: '#f7f7f8', padding: 8, borderRadius: 6, marginTop: 6, whiteSpace: 'pre-wrap' }}>
            {a.answer_text || '(작성된 답변 없음)'}
          </p>

          {(comments[a.id] || []).map((c) => (
            <p key={c.id} style={{ fontSize: 12, color: '#2563eb', marginTop: 6 }}>
              💬 {c.comment_text}
            </p>
          ))}

          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <input
              placeholder="코멘트 작성"
              style={{ flex: 1 }}
              value={drafts[a.id] || ''}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [a.id]: e.target.value }))}
            />
            <button onClick={() => saveComment(a.id)}>등록</button>
          </div>
        </div>
      ))}
    </div>
  );
}
