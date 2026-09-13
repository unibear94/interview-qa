'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answerType, setAnswerType] = useState('prep');
  const [answers, setAnswers] = useState({ prep: '', actual: '' });
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: q } = await supabase.from('questions').select('*').eq('id', id).single();
      setQuestion(q);

      const { data: { user: u } } = await supabase.auth.getUser();
      setUser(u);

      if (u) {
        const { data: ans } = await supabase
          .from('answers')
          .select('*')
          .eq('question_id', id)
          .eq('user_id', u.id);
        const prep = ans?.find((a) => a.answer_type === 'prep')?.answer_text || '';
        const actual = ans?.find((a) => a.answer_type === 'actual')?.answer_text || '';
        setAnswers({ prep, actual });

        const answerIds = (ans || []).map((a) => a.id);
        if (answerIds.length) {
          const { data: cmts } = await supabase.from('comments').select('*').in('answer_id', answerIds);
          setComments(cmts || []);
        }
      }
    }
    load();
  }, [id]);

  async function saveAnswer() {
    if (!user) {
      alert('로그인이 필요해요.');
      return;
    }
    setSaving(true);
    const text = answers[answerType];
    const { data: existing } = await supabase
      .from('answers')
      .select('id')
      .eq('question_id', id)
      .eq('user_id', user.id)
      .eq('answer_type', answerType)
      .maybeSingle();

    if (existing) {
      await supabase.from('answers').update({ answer_text: text }).eq('id', existing.id);
    } else {
      await supabase.from('answers').insert({
        question_id: id,
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_metadata?.full_name || '',
        answer_type: answerType,
        answer_text: text,
      });
    }
    setSaving(false);
    alert('저장됐어요!');
  }

  if (!question) return <p>불러오는 중...</p>;

  return (
    <div>
      <h2 style={{ fontSize: 16 }}>{question.question_text}</h2>
      <p className="card-meta">
        {question.org_name}
        {question.department_track ? ` · ${question.department_track}` : ''}
        {question.admission_type ? ` · ${question.admission_type}` : ''}
        {question.year ? ` · ${question.year}` : ''}
      </p>

      <div className="tabs" style={{ marginTop: 14 }}>
        <div className={`tab ${answerType === 'prep' ? 'active' : ''}`} onClick={() => setAnswerType('prep')}>
          사전 준비 답변
        </div>
        <div className={`tab ${answerType === 'actual' ? 'active' : ''}`} onClick={() => setAnswerType('actual')}>
          실제 면접 답변
        </div>
      </div>

      <textarea
        rows={6}
        style={{ width: '100%' }}
        placeholder="여기에 답변을 작성하세요"
        value={answers[answerType]}
        onChange={(e) => setAnswers({ ...answers, [answerType]: e.target.value })}
      />
      <button style={{ marginTop: 8, width: '100%' }} onClick={saveAnswer} disabled={saving}>
        {saving ? '저장 중...' : '저장하기'}
      </button>

      {comments.length > 0 && (
        <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 10 }}>
          <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>멘토 코멘트</p>
          {comments.map((c) => (
            <p key={c.id} style={{ fontSize: 13, color: '#555' }}>{c.comment_text}</p>
          ))}
        </div>
      )}
    </div>
  );
}
