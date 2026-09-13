'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

const TYPES = [
  { key: 'contract_dept', label: '계약학과' },
  { key: 'university', label: '일반대학' },
  { key: 'company', label: '일반기업' },
];

export default function HomePage() {
  const [type, setType] = useState('contract_dept');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ org_name: '', department_track: '', admission_type: '' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from('questions').select('*').eq('interview_type', type).order('created_at', { ascending: false });
      if (filters.org_name) query = query.eq('org_name', filters.org_name);
      if (filters.department_track) query = query.eq('department_track', filters.department_track);
      if (filters.admission_type) query = query.eq('admission_type', filters.admission_type);
      const { data, error } = await query;
      if (!error) setQuestions(data || []);
      setLoading(false);
    }
    load();
  }, [type, filters]);

  return (
    <div>
      <div className="tabs">
        {TYPES.map((t) => (
          <div
            key={t.key}
            className={`tab ${type === t.key ? 'active' : ''}`}
            onClick={() => { setType(t.key); setFilters({ org_name: '', department_track: '', admission_type: '' }); }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          placeholder={type === 'university' ? '대학명' : '기업명'}
          value={filters.org_name}
          onChange={(e) => setFilters({ ...filters, org_name: e.target.value })}
          style={{ flex: 1, minWidth: 100 }}
        />
        <input
          placeholder={type === 'university' ? '학과' : '직무/트랙'}
          value={filters.department_track}
          onChange={(e) => setFilters({ ...filters, department_track: e.target.value })}
          style={{ flex: 1, minWidth: 100 }}
        />
        {type === 'university' && (
          <input
            placeholder="전형"
            value={filters.admission_type}
            onChange={(e) => setFilters({ ...filters, admission_type: e.target.value })}
            style={{ flex: 1, minWidth: 100 }}
          />
        )}
      </div>

      {loading && <p>불러오는 중...</p>}
      {!loading && questions.length === 0 && <p style={{ color: '#888' }}>등록된 질문이 없어요.</p>}

      {questions.map((q) => (
        <Link key={q.id} href={`/questions/${q.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
          <p className="card-title">{q.question_text}</p>
          <p className="card-meta">
            {q.org_name}
            {q.department_track ? ` · ${q.department_track}` : ''}
            {q.admission_type ? ` · ${q.admission_type}` : ''}
            {q.category ? ` · ${q.category}` : ''}
          </p>
        </Link>
      ))}
    </div>
  );
}
